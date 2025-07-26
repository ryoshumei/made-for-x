import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚛 Starting Mercari shipping data seeding...');

  // Clear existing Mercari shipping data
  console.log('🧹 Clearing existing Mercari shipping data...');
  await prisma.sizeTier.deleteMany();
  await prisma.shippingOption.deleteMany();
  await prisma.shippingService.deleteMany();
  await prisma.mercariServiceCategory.deleteMany();

  // 1. Create Mercari Service Categories
  console.log('📦 Creating Mercari service categories...');

  const rakurakuCategory = await prisma.mercariServiceCategory.create({
    data: {
      categoryName: 'らくらくメルカリ便',
      categoryNameEn: 'Rakuraku Mercari Bin',
      underlyingCarrier: 'ヤマト運輸',
      status: 'active',
      description: 'ヤマト運輸との提携による配送サービス',
    },
  });

  const yuyuCategory = await prisma.mercariServiceCategory.create({
    data: {
      categoryName: 'ゆうゆうメルカリ便',
      categoryNameEn: 'Yuyu Mercari Bin',
      underlyingCarrier: '日本郵政',
      status: 'active',
      description: '日本郵政との提携による配送サービス',
    },
  });

  console.log(
    `✅ Created service categories: ${rakurakuCategory.categoryName}, ${yuyuCategory.categoryName}`
  );

  // 2. Create Shipping Services
  console.log('🚚 Creating shipping services...');

  // らくらくメルカリ便 services
  const nekopos = await prisma.shippingService.create({
    data: {
      mercariCategoryId: rakurakuCategory.id,
      serviceName: 'ネコポス',
      serviceNameEn: 'Neko Pos',
      sizeCategory: 'small',
      deliveryInfo: '翌日配達',
      status: 'active',
      description: '小型サイズ・ポスト投函対応',
      referenceUrl: 'https://help.jp.mercari.com/guide/articles/134/',
    },
  });

  const takkyubinCompact = await prisma.shippingService.create({
    data: {
      mercariCategoryId: rakurakuCategory.id,
      serviceName: '宅急便コンパクト',
      serviceNameEn: 'Takkyubin Compact',
      sizeCategory: 'medium',
      status: 'active',
      description: '小〜中型サイズ・専用BOX必要',
      referenceUrl: 'https://help.jp.mercari.com/guide/articles/135/',
    },
  });

  const takkyubin = await prisma.shippingService.create({
    data: {
      mercariCategoryId: rakurakuCategory.id,
      serviceName: '宅急便',
      serviceNameEn: 'Takkyubin',
      sizeCategory: 'large',
      status: 'active',
      description: '中〜大型サイズ・サイズ別料金',
      referenceUrl: 'https://help.jp.mercari.com/guide/articles/136/',
    },
  });

  // ゆうゆうメルカリ便 services
  const yuPacket = await prisma.shippingService.create({
    data: {
      mercariCategoryId: yuyuCategory.id,
      serviceName: 'ゆうパケット',
      serviceNameEn: 'Yu Packet',
      sizeCategory: 'small',
      status: 'active',
      description: '小型サイズ A4・3cm以内',
      referenceUrl: 'https://help.jp.mercari.com/guide/articles/176/',
    },
  });

  const yuPacketPostMini = await prisma.shippingService.create({
    data: {
      mercariCategoryId: yuyuCategory.id,
      serviceName: 'ゆうパケットポストmini',
      serviceNameEn: 'Yu Packet Post Mini',
      sizeCategory: 'small',
      status: 'active',
      description: '小型サイズ・専用封筒必要',
      referenceUrl: 'https://help.jp.mercari.com/guide/articles/1479/',
    },
  });

  const yuPacketPost = await prisma.shippingService.create({
    data: {
      mercariCategoryId: yuyuCategory.id,
      serviceName: 'ゆうパケットポスト',
      serviceNameEn: 'Yu Packet Post',
      sizeCategory: 'small',
      status: 'active',
      description: '小型サイズ A4・専用箱またはシール',
      referenceUrl: 'https://help.jp.mercari.com/guide/articles/834/',
    },
  });

  const yuPacketPlus = await prisma.shippingService.create({
    data: {
      mercariCategoryId: yuyuCategory.id,
      serviceName: 'ゆうパケットプラス',
      serviceNameEn: 'Yu Packet Plus',
      sizeCategory: 'medium',
      status: 'active',
      description: '小〜中型サイズ・専用箱必要',
      referenceUrl: 'https://help.jp.mercari.com/guide/articles/816/',
    },
  });

  const yuPack = await prisma.shippingService.create({
    data: {
      mercariCategoryId: yuyuCategory.id,
      serviceName: 'ゆうパック',
      serviceNameEn: 'Yu Pack',
      sizeCategory: 'large',
      status: 'active',
      description: '中〜大型サイズ・サイズ別料金',
      referenceUrl: 'https://help.jp.mercari.com/guide/articles/177/',
    },
  });

  console.log('✅ Created 8 shipping services');

  // 3. Create Shipping Options (固定価格)
  console.log('💰 Creating shipping options...');

  const shippingOptions: Prisma.ShippingOptionCreateManyInput[] = [
    // らくらくメルカリ便 - ネコポス
    {
      serviceId: nekopos.id,
      optionName: 'ネコポス',
      optionNameEn: 'Neko Pos',
      totalPrice: 210,
      basePrice: 210,
      packagingPrice: 0,
      packagingDetails: '厚さ3cm以内、ポスト投函',
      requiresSpecialPackaging: false,
      maxWeightKg: new Prisma.Decimal(1.0),
      maxLengthCm: new Prisma.Decimal(31.2),
      maxWidthCm: new Prisma.Decimal(22.8),
      maxThicknessCm: new Prisma.Decimal(3.0),
      minLengthCm: new Prisma.Decimal(23.0),
      minWidthCm: new Prisma.Decimal(11.5),
      sortOrder: 1,
    },

    // らくらくメルカリ便 - 宅急便コンパクト (薄型BOX)
    {
      serviceId: takkyubinCompact.id,
      optionName: '宅急便コンパクト (薄型BOX)',
      optionNameEn: 'Takkyubin Compact (Thin Box)',
      totalPrice: 520,
      basePrice: 450,
      packagingPrice: 70,
      packagingName: '専用薄型BOX',
      packagingDetails: '専用薄型BOX必要（24×33.2cm）。郵便局、コンビニで購入可能',
      requiresSpecialPackaging: true,
      maxLengthCm: new Prisma.Decimal(24.0),
      maxWidthCm: new Prisma.Decimal(33.2),
      sortOrder: 2,
    },

    // らくらくメルカリ便 - 宅急便コンパクト (BOX)
    {
      serviceId: takkyubinCompact.id,
      optionName: '宅急便コンパクト (BOX)',
      optionNameEn: 'Takkyubin Compact (Box)',
      totalPrice: 520,
      basePrice: 450,
      packagingPrice: 70,
      packagingName: '専用BOX',
      packagingDetails: '専用BOX必要（19.3×24.7×4.7cm）。郵便局、コンビニで購入可能',
      requiresSpecialPackaging: true,
      maxLengthCm: new Prisma.Decimal(19.3),
      maxWidthCm: new Prisma.Decimal(24.7),
      maxHeightCm: new Prisma.Decimal(4.7),
      sortOrder: 3,
    },

    // ゆうゆうメルカリ便 - ゆうパケット
    {
      serviceId: yuPacket.id,
      optionName: 'ゆうパケット',
      optionNameEn: 'Yu Packet',
      totalPrice: 230,
      basePrice: 230,
      packagingPrice: 0,
      packagingDetails: '厚さ3cm以内、3辺合計60cm以内',
      requiresSpecialPackaging: false,
      maxWeightKg: new Prisma.Decimal(1.0),
      maxSizeCm: 60,
      maxLengthCm: new Prisma.Decimal(34.0),
      maxThicknessCm: new Prisma.Decimal(3.0),
      sortOrder: 4,
    },

    // ゆうゆうメルカリ便 - ゆうパケットポストmini
    {
      serviceId: yuPacketPostMini.id,
      optionName: 'ゆうパケットポストmini',
      optionNameEn: 'Yu Packet Post Mini',
      totalPrice: 180,
      basePrice: 160,
      packagingPrice: 20,
      packagingName: '専用封筒',
      packagingDetails: '専用封筒必要。郵便局、ローソンで購入可能',
      requiresSpecialPackaging: true,
      maxWeightKg: new Prisma.Decimal(2.0),
      maxLengthCm: new Prisma.Decimal(21.1),
      maxWidthCm: new Prisma.Decimal(16.8),
      sortOrder: 5,
    },

    // ゆうゆうメルカリ便 - ゆうパケットポスト (専用箱)
    {
      serviceId: yuPacketPost.id,
      optionName: 'ゆうパケットポスト (専用箱)',
      optionNameEn: 'Yu Packet Post (Box)',
      totalPrice: 280,
      basePrice: 215,
      packagingPrice: 65,
      packagingName: '専用箱',
      packagingDetails: '専用箱必要（32.7×22.8×3cm）。郵便局、ローソン、セリアで購入可能',
      requiresSpecialPackaging: true,
      maxWeightKg: new Prisma.Decimal(2.0),
      maxSizeCm: 60,
      maxLengthCm: new Prisma.Decimal(32.7),
      maxWidthCm: new Prisma.Decimal(22.8),
      maxThicknessCm: new Prisma.Decimal(3.0),
      sortOrder: 6,
    },

    // ゆうゆうメルカリ便 - ゆうパケットポスト (発送用シール)
    {
      serviceId: yuPacketPost.id,
      optionName: 'ゆうパケットポスト (発送用シール)',
      optionNameEn: 'Yu Packet Post (Sticker)',
      totalPrice: 220,
      basePrice: 215,
      packagingPrice: 5,
      packagingName: '発送用シール',
      packagingDetails:
        '発送用シール必要（20枚入り100円）。郵便局、ローソン、イトーヨーカドー、ダイソーで購入可能',
      requiresSpecialPackaging: true,
      maxWeightKg: new Prisma.Decimal(2.0),
      maxSizeCm: 60,
      maxLengthCm: new Prisma.Decimal(34.0),
      maxThicknessCm: new Prisma.Decimal(3.0),
      minLengthCm: new Prisma.Decimal(14.0),
      minWidthCm: new Prisma.Decimal(9.0),
      sortOrder: 7,
    },

    // ゆうゆうメルカリ便 - ゆうパケットプラス
    {
      serviceId: yuPacketPlus.id,
      optionName: 'ゆうパケットプラス',
      optionNameEn: 'Yu Packet Plus',
      totalPrice: 520,
      basePrice: 455,
      packagingPrice: 65,
      packagingName: '専用箱',
      packagingDetails: '専用箱必要（24×17×7cm）。郵便局で購入可能',
      requiresSpecialPackaging: true,
      maxWeightKg: new Prisma.Decimal(2.0),
      maxLengthCm: new Prisma.Decimal(23.2),
      maxWidthCm: new Prisma.Decimal(16.2),
      maxHeightCm: new Prisma.Decimal(6.5),
      sortOrder: 8,
    },
  ];

  await prisma.shippingOption.createMany({
    data: shippingOptions,
  });

  console.log(`✅ Created ${shippingOptions.length} shipping options`);

  // 4. Create Size Tiers (サイズ分級)
  console.log('📏 Creating size tiers...');

  // らくらくメルカリ便 - 宅急便サイズ分級
  const takkyubinTiers: Prisma.SizeTierCreateManyInput[] = [
    {
      serviceId: takkyubin.id,
      tierName: '60サイズ',
      price: 750,
      maxWeightKg: new Prisma.Decimal(2.0),
      maxSizeCm: 60,
    },
    {
      serviceId: takkyubin.id,
      tierName: '80サイズ',
      price: 850,
      maxWeightKg: new Prisma.Decimal(5.0),
      maxSizeCm: 80,
    },
    {
      serviceId: takkyubin.id,
      tierName: '100サイズ',
      price: 1050,
      maxWeightKg: new Prisma.Decimal(10.0),
      maxSizeCm: 100,
    },
    {
      serviceId: takkyubin.id,
      tierName: '120サイズ',
      price: 1200,
      maxWeightKg: new Prisma.Decimal(15.0),
      maxSizeCm: 120,
    },
    {
      serviceId: takkyubin.id,
      tierName: '140サイズ',
      price: 1450,
      maxWeightKg: new Prisma.Decimal(20.0),
      maxSizeCm: 140,
    },
    {
      serviceId: takkyubin.id,
      tierName: '160サイズ',
      price: 1700,
      maxWeightKg: new Prisma.Decimal(25.0),
      maxSizeCm: 160,
    },
    {
      serviceId: takkyubin.id,
      tierName: '170サイズ',
      price: 2100,
      maxWeightKg: new Prisma.Decimal(30.0),
      maxSizeCm: 170,
    },
    {
      serviceId: takkyubin.id,
      tierName: '180サイズ',
      price: 2100,
      maxWeightKg: new Prisma.Decimal(30.0),
      maxSizeCm: 180,
    },
    {
      serviceId: takkyubin.id,
      tierName: '200サイズ',
      price: 2500,
      maxWeightKg: new Prisma.Decimal(30.0),
      maxSizeCm: 200,
    },
  ];

  // ゆうゆうメルカリ便 - ゆうパックサイズ分級
  const yuPackTiers: Prisma.SizeTierCreateManyInput[] = [
    {
      serviceId: yuPack.id,
      tierName: '60サイズ',
      price: 770,
      maxWeightKg: new Prisma.Decimal(25.0),
      maxSizeCm: 60,
    },
    {
      serviceId: yuPack.id,
      tierName: '80サイズ',
      price: 870,
      maxWeightKg: new Prisma.Decimal(25.0),
      maxSizeCm: 80,
    },
    {
      serviceId: yuPack.id,
      tierName: '100サイズ',
      price: 1070,
      maxWeightKg: new Prisma.Decimal(25.0),
      maxSizeCm: 100,
    },
    {
      serviceId: yuPack.id,
      tierName: '120サイズ',
      price: 1250,
      maxWeightKg: new Prisma.Decimal(25.0),
      maxSizeCm: 120,
    },
    {
      serviceId: yuPack.id,
      tierName: '140サイズ',
      price: 1450,
      maxWeightKg: new Prisma.Decimal(25.0),
      maxSizeCm: 140,
    },
    {
      serviceId: yuPack.id,
      tierName: '160サイズ',
      price: 1700,
      maxWeightKg: new Prisma.Decimal(25.0),
      maxSizeCm: 160,
    },
    {
      serviceId: yuPack.id,
      tierName: '170サイズ',
      price: 1900,
      maxWeightKg: new Prisma.Decimal(25.0),
      maxSizeCm: 170,
    },
  ];

  await prisma.sizeTier.createMany({
    data: [...takkyubinTiers, ...yuPackTiers],
  });

  console.log(`✅ Created ${takkyubinTiers.length + yuPackTiers.length} size tiers`);

  // Verification
  const verification = await Promise.all([
    prisma.mercariServiceCategory.count(),
    prisma.shippingService.count(),
    prisma.shippingOption.count(),
    prisma.sizeTier.count(),
  ]);

  console.log('\n📊 Seeding completed successfully!');
  console.log('📈 Final Statistics:');
  console.log(`- Service Categories: ${verification[0]}`);
  console.log(`- Shipping Services: ${verification[1]}`);
  console.log(`- Shipping Options: ${verification[2]}`);
  console.log(`- Size Tiers: ${verification[3]}`);

  // Show sample data
  console.log('\n📋 Sample Options:');
  const samples = await prisma.shippingOption.findMany({
    take: 3,
    include: {
      service: {
        include: {
          mercariCategory: true,
        },
      },
    },
    orderBy: { totalPrice: 'asc' },
  });

  samples.forEach((option, index) => {
    console.log(
      `${index + 1}. ${option.service.mercariCategory.categoryName} - ${option.optionName}: ${option.totalPrice}円`
    );
    if (option.packagingDetails) {
      console.log(`   詳細: ${option.packagingDetails}`);
    }
  });

  console.log('\n🎯 Ready for API development!');
}

main()
  .catch((e) => {
    console.error('❌ Error during Mercari shipping seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
