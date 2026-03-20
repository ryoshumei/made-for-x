import { Holiday, BridgePlan } from './types';

const MAX_PTO_DAYS = 3;

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isHolidayDate(date: Date, holidays: Holiday[]): boolean {
  const dateStr = date.toISOString().slice(0, 10);
  return holidays.some((h) => h.date.toISOString().slice(0, 10) === dateStr);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isFreeDay(date: Date, holidays: Holiday[]): boolean {
  return isWeekend(date) || isHolidayDate(date, holidays);
}

/**
 * Expands outward from a holiday to find a cluster of free days
 * (holidays + weekends), including workday gaps of 1-2 days
 * where the day after the gap is a free day.
 * Returns the start and end dates of the cluster, plus any gap workdays.
 */
function expandCluster(
  startDate: Date,
  holidays: Holiday[]
): { clusterStart: Date; clusterEnd: Date; gapDays: Date[] } {
  let clusterStart = new Date(startDate);
  let clusterEnd = new Date(startDate);
  const gapDays: Date[] = [];

  // Expand forward
  let current = addDays(clusterEnd, 1);
  while (true) {
    if (isFreeDay(current, holidays)) {
      clusterEnd = current;
      current = addDays(current, 1);
      continue;
    }

    // Check if a gap of 1-2 workdays leads to a free day
    let gapSize = 0;
    let probe = current;
    const potentialGap: Date[] = [];
    while (gapSize < MAX_PTO_DAYS && !isFreeDay(probe, holidays)) {
      potentialGap.push(new Date(probe));
      gapSize++;
      probe = addDays(probe, 1);
    }
    if (gapSize <= 2 && isFreeDay(probe, holidays)) {
      gapDays.push(...potentialGap);
      clusterEnd = probe;
      current = addDays(probe, 1);
      continue;
    }
    break;
  }

  // Expand backward
  current = addDays(clusterStart, -1);
  while (true) {
    if (isFreeDay(current, holidays)) {
      clusterStart = current;
      current = addDays(current, -1);
      continue;
    }

    // Check if a gap of 1-2 workdays leads to a free day
    let gapSize = 0;
    let probe = current;
    const potentialGap: Date[] = [];
    while (gapSize < MAX_PTO_DAYS && !isFreeDay(probe, holidays)) {
      potentialGap.push(new Date(probe));
      gapSize++;
      probe = addDays(probe, -1);
    }
    if (gapSize <= 2 && isFreeDay(probe, holidays)) {
      gapDays.push(...potentialGap);
      clusterStart = probe;
      current = addDays(probe, -1);
      continue;
    }
    break;
  }

  return { clusterStart, clusterEnd, gapDays };
}

function daysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Calculates the optimal bridge holiday plan for a given holiday.
 *
 * Algorithm:
 * 1. Expand outward from the holiday to find a cluster of free days
 * 2. Identify workday gaps within the cluster
 * 3. Generate bridge plans using 0 to MAX_PTO_DAYS PTO
 * 4. Rank: fewest PTO first, then most total days off
 */
export function calculateBridgePlan(holidayDate: Date, allHolidays: Holiday[]): BridgePlan {
  const { clusterStart, clusterEnd, gapDays } = expandCluster(holidayDate, allHolidays);

  // Sort gap days chronologically
  gapDays.sort((a, b) => a.getTime() - b.getTime());

  // If no gap days, the natural cluster is the plan
  if (gapDays.length === 0) {
    return {
      totalDaysOff: daysBetween(clusterStart, clusterEnd),
      ptoDaysNeeded: 0,
      startDate: clusterStart,
      endDate: clusterEnd,
      ptoDates: [],
    };
  }

  // If gap days within PTO cap, take them all
  if (gapDays.length <= MAX_PTO_DAYS) {
    return {
      totalDaysOff: daysBetween(clusterStart, clusterEnd),
      ptoDaysNeeded: gapDays.length,
      startDate: clusterStart,
      endDate: clusterEnd,
      ptoDates: gapDays,
    };
  }

  // If too many gap days, find the best contiguous sub-cluster
  // that requires at most MAX_PTO_DAYS PTO
  // Fall back to the natural free-day span around the holiday
  let bestPlan: BridgePlan = {
    totalDaysOff: 1,
    ptoDaysNeeded: 0,
    startDate: holidayDate,
    endDate: holidayDate,
    ptoDates: [],
  };

  // Find the natural span (no PTO) around the holiday
  let natStart = new Date(holidayDate);
  let natEnd = new Date(holidayDate);
  while (isFreeDay(addDays(natStart, -1), allHolidays)) {
    natStart = addDays(natStart, -1);
  }
  while (isFreeDay(addDays(natEnd, 1), allHolidays)) {
    natEnd = addDays(natEnd, 1);
  }
  bestPlan = {
    totalDaysOff: daysBetween(natStart, natEnd),
    ptoDaysNeeded: 0,
    startDate: natStart,
    endDate: natEnd,
    ptoDates: [],
  };

  // Try bridging forward, backward, and combined forward+backward
  // Helper: try bridging N workdays forward from an end date
  function tryBridgeForward(fromEnd: Date, maxPto: number): { newEnd: Date; pto: Date[] } | null {
    const ptoDays: Date[] = [];
    let d = addDays(fromEnd, 1);
    while (ptoDays.length < maxPto && !isFreeDay(d, allHolidays)) {
      ptoDays.push(new Date(d));
      d = addDays(d, 1);
    }
    if (ptoDays.length > 0 && ptoDays.length <= maxPto && isFreeDay(d, allHolidays)) {
      let newEnd = d;
      while (isFreeDay(addDays(newEnd, 1), allHolidays)) {
        newEnd = addDays(newEnd, 1);
      }
      return { newEnd, pto: ptoDays };
    }
    return null;
  }

  // Helper: try bridging N workdays backward from a start date
  function tryBridgeBackward(
    fromStart: Date,
    maxPto: number
  ): { newStart: Date; pto: Date[] } | null {
    const ptoDays: Date[] = [];
    let d = addDays(fromStart, -1);
    while (ptoDays.length < maxPto && !isFreeDay(d, allHolidays)) {
      ptoDays.push(new Date(d));
      d = addDays(d, -1);
    }
    if (ptoDays.length > 0 && ptoDays.length <= maxPto && isFreeDay(d, allHolidays)) {
      let newStart = d;
      while (isFreeDay(addDays(newStart, -1), allHolidays)) {
        newStart = addDays(newStart, -1);
      }
      return { newStart, pto: ptoDays };
    }
    return null;
  }

  function updateBest(total: number, pto: number, start: Date, end: Date, ptoDates: Date[]) {
    if (
      total > bestPlan.totalDaysOff ||
      (total === bestPlan.totalDaysOff && pto < bestPlan.ptoDaysNeeded)
    ) {
      bestPlan = {
        totalDaysOff: total,
        ptoDaysNeeded: pto,
        startDate: start,
        endDate: end,
        ptoDates,
      };
    }
  }

  // Single-direction bridges
  for (let pto = 1; pto <= MAX_PTO_DAYS; pto++) {
    const fwd = tryBridgeForward(natEnd, pto);
    if (fwd) {
      updateBest(daysBetween(natStart, fwd.newEnd), fwd.pto.length, natStart, fwd.newEnd, fwd.pto);
    }
    const bwd = tryBridgeBackward(natStart, pto);
    if (bwd) {
      updateBest(daysBetween(bwd.newStart, natEnd), bwd.pto.length, bwd.newStart, natEnd, bwd.pto);
    }
  }

  // Combined forward+backward bridges (e.g., 1 backward + 2 forward = 3 PTO)
  for (let fwdPto = 1; fwdPto < MAX_PTO_DAYS; fwdPto++) {
    for (let bwdPto = 1; bwdPto <= MAX_PTO_DAYS - fwdPto; bwdPto++) {
      const fwd = tryBridgeForward(natEnd, fwdPto);
      const bwd = tryBridgeBackward(natStart, bwdPto);
      if (fwd && bwd) {
        const totalPto = fwd.pto.length + bwd.pto.length;
        const total = daysBetween(bwd.newStart, fwd.newEnd);
        updateBest(total, totalPto, bwd.newStart, fwd.newEnd, [...bwd.pto, ...fwd.pto]);
      }
    }
  }

  return bestPlan;
}
