import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to convert day numbers to Japanese day names
const getDayName = (dayNumber: number): string => {
  const dayNames = ['', '月', '火', '水', '木', '金', '土', '日'];
  return dayNames[dayNumber] || '';
};

// Helper function to format schedule data for response
const formatScheduleData = (schedule: any) => {
  return {
    id: schedule.id,
    areaName: schedule.areaName,
    zipcode: schedule.zipcode,
    addressDetail: schedule.addressDetail,
    burnable: {
      days: `${getDayName(schedule.burnableDay1)}${getDayName(schedule.burnableDay2)}`,
      time: schedule.burnableTime,
      dayNumbers: [schedule.burnableDay1, schedule.burnableDay2],
    },
    nonBurnable:
      schedule.nonBurnableWeekNumber && schedule.nonBurnableDayOfWeek
        ? {
            week: schedule.nonBurnableWeekNumber,
            day: getDayName(schedule.nonBurnableDayOfWeek),
            dayNumber: schedule.nonBurnableDayOfWeek,
          }
        : null,
    recyclable: {
      day: getDayName(schedule.recyclableDay),
      dayNumber: schedule.recyclableDay,
    },
    valuable: schedule.valuableDay
      ? {
          day: getDayName(schedule.valuableDay),
          dayNumber: schedule.valuableDay,
        }
      : null,
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zipcode = searchParams.get('zipcode');

    // Validate zipcode parameter
    if (!zipcode) {
      return NextResponse.json(
        {
          error: 'Zipcode parameter is required',
          message: '郵便番号パラメータが必要です',
        },
        { status: 400 }
      );
    }

    // Validate zipcode format (7 digits)
    if (!/^\d{7}$/.test(zipcode)) {
      return NextResponse.json(
        {
          error: 'Invalid zipcode format. Must be 7 digits',
          message: '郵便番号の形式が正しくありません。7桁の数字で入力してください',
        },
        { status: 400 }
      );
    }

    // Search for waste collection schedules by zipcode
    const schedules = await prisma.wasteCollectionSchedule.findMany({
      where: {
        zipcode: zipcode,
      },
      orderBy: [{ areaName: 'asc' }, { addressDetail: 'asc' }],
    });

    if (schedules.length === 0) {
      return NextResponse.json(
        {
          error: 'No areas found for this zipcode',
          message: 'この郵便番号に対応する地域が見つかりませんでした',
          zipcode: zipcode,
        },
        { status: 404 }
      );
    }

    // Format the response data
    const formattedSchedules = schedules.map(formatScheduleData);

    return NextResponse.json({
      success: true,
      zipcode: zipcode,
      count: schedules.length,
      areas: formattedSchedules,
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'サーバー内部エラーが発生しました',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
