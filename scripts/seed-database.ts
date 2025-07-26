import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface WasteCollectionData {
  areaName: string;
  zipcode: string;
  addressDetail?: string;
  burnableDay1: number;
  burnableDay2: number;
  burnableTime: string;
  nonBurnableWeekNumber?: number;
  nonBurnableDayOfWeek?: number;
  recyclableDay: number;
  valuableDay: number | null;
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if waste collection data already exists
  const existingSchedules = await prisma.wasteCollectionSchedule.count();
  if (existingSchedules > 0) {
    console.log('✅ Waste collection data already exists, skipping seeding...');
    return;
  }

  // Read the calendar-ready data file
  const dataPath = path.join(process.cwd(), 'private', 'calendar-ready-garbage-data.json');

  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found: ${dataPath}`);
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const wasteData: WasteCollectionData[] = JSON.parse(rawData);

  console.log(`📊 Found ${wasteData.length} records to import`);

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.wasteCollectionSchedule.deleteMany();

  // Import data in batches for better performance
  const batchSize = 50;
  let imported = 0;

  for (let i = 0; i < wasteData.length; i += batchSize) {
    const batch = wasteData.slice(i, i + batchSize);

    await prisma.wasteCollectionSchedule.createMany({
      data: batch.map((item) => ({
        areaName: item.areaName,
        zipcode: item.zipcode,
        addressDetail: item.addressDetail || null,
        burnableDay1: item.burnableDay1,
        burnableDay2: item.burnableDay2,
        burnableTime: item.burnableTime,
        nonBurnableWeekNumber: item.nonBurnableWeekNumber || null,
        nonBurnableDayOfWeek: item.nonBurnableDayOfWeek || null,
        recyclableDay: item.recyclableDay,
        valuableDay: item.valuableDay,
      })),
    });

    imported += batch.length;
    console.log(`✅ Imported ${imported}/${wasteData.length} records`);
  }

  // Verify import
  const totalRecords = await prisma.wasteCollectionSchedule.count();
  console.log(`🎯 Total records in database: ${totalRecords}`);

  // Show some sample data
  console.log('\n📋 Sample records:');
  const samples = await prisma.wasteCollectionSchedule.findMany({
    take: 3,
    select: {
      id: true,
      areaName: true,
      burnableDay1: true,
      burnableDay2: true,
      burnableTime: true,
      zipcode: true,
      addressDetail: true,
    },
  });

  const dayNames = ['', '月', '火', '水', '木', '金', '土', '日'];

  samples.forEach((record, index) => {
    console.log(`${index + 1}. ${record.areaName} (${record.zipcode})`);
    console.log(
      `   可燃垃圾: ${dayNames[record.burnableDay1]}${dayNames[record.burnableDay2]} ${record.burnableTime}`
    );
    if (record.addressDetail) {
      console.log(`   詳細: ${record.addressDetail}`);
    }
    console.log('');
  });

  // Show statistics
  console.log('📈 Import Statistics:');
  console.log(`- Total areas: ${totalRecords}`);

  const uniqueZipcodes = await prisma.wasteCollectionSchedule.groupBy({
    by: ['zipcode'],
    _count: { zipcode: true },
  });
  console.log(`- Unique zipcodes: ${uniqueZipcodes.length}`);

  const recordsWithDetails = await prisma.wasteCollectionSchedule.count({
    where: { addressDetail: { not: null } },
  });
  console.log(`- Records with address details: ${recordsWithDetails}`);

  console.log('\n✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
