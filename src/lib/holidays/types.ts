export interface Holiday {
  date: Date;
  name: string;
  nameEn: string;
}

export interface BridgePlan {
  /** Total consecutive days off (holidays + weekends + PTO) */
  totalDaysOff: number;
  /** Number of PTO days needed */
  ptoDaysNeeded: number;
  /** Start date of the consecutive days off */
  startDate: Date;
  /** End date of the consecutive days off */
  endDate: Date;
  /** The specific dates that require PTO */
  ptoDates: Date[];
}
