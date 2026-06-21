import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { lookupByZipcode } from '@/lib/waste/lookup';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const zipcode = new URL(request.url).searchParams.get('zipcode') ?? '';
    const result = await lookupByZipcode(prisma, zipcode);

    if (result.status === 'invalid') {
      return NextResponse.json(
        { success: false, message: '郵便番号の形式が正しくありません（7桁の数字）' },
        { status: 400 }
      );
    }
    if (result.status === 'not_found') {
      return NextResponse.json(
        { success: false, message: 'この郵便番号に対応する地域が見つかりませんでした' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      zipcode: zipcode.replace(/\D/g, ''),
      city: result.city,
      towns: result.towns,
      matchType: result.matchType,
      count: result.areas!.length,
      areas: result.areas!.map((a) => ({
        areaName: a.areaName,
        addressDetail: a.addressDetail ?? null,
        schedules: a.schedules,
      })),
    });
  } catch (error) {
    console.error('waste lookup error:', error);
    return NextResponse.json(
      { success: false, message: 'サーバー内部エラーが発生しました' },
      { status: 500 }
    );
  }
}
