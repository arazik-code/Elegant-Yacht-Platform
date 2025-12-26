// Database Seed Script for Bimo Yacht
// Run with: npx tsx prisma/seed.ts

const { PrismaClient } = require('@prisma/client')

// Define enum values inline since they may not export correctly
const YachtType = {
  SALE: 'SALE',
  CHARTER: 'CHARTER',
  BOTH: 'BOTH',
} as const

const YachtStatus = {
  AVAILABLE: 'AVAILABLE',
  PENDING: 'PENDING',
  SOLD: 'SOLD',
  ARCHIVED: 'ARCHIVED',
} as const

const MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
} as const

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting database seed...')

  // Clear existing data
  await prisma.yachtMedia.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.yacht.deleteMany()
  await prisma.siteSettings.deleteMany()

  // Create site settings
  await prisma.siteSettings.create({
    data: {
      id: 'settings',
      whatsappNumber: '971501234567',
      whatsappMessage: 'Hello! I\'m interested in your luxury yachts.',
      email: 'info@bimoyacht.com',
      phone: '+971 50 123 4567',
      address: 'Dubai Marina, Dubai, UAE',
      instagramUrl: 'https://instagram.com/bimoyacht',
      instagramFollowers: '900K+',
      dedLicenseNumber: 'DED-123456',
      showPrices: true,
      maintenanceMode: false,
    },
  })

  // Create sample yachts
  const yachts = [
    {
      title: 'Majesty 155',
      slug: 'majesty-155-superyacht',
      type: YachtType.SALE,
      status: YachtStatus.AVAILABLE,
      price: 45000000,
      priceOnRequest: false,
      currency: 'AED',
      lengthFeet: 155,
      lengthMeters: 47.25,
      beam: 8.70,
      brand: 'Majesty Yachts',
      model: '155',
      year: 2023,
      builder: 'Gulf Craft',
      cabins: 6,
      bathrooms: 7,
      guestCapacity: 12,
      crewCapacity: 9,
      engines: 'Twin MTU 16V2000 M96L',
      maxSpeed: 18,
      cruiseSpeed: 14,
      descriptionEn: 'The Majesty 155 represents the pinnacle of Arabian yacht craftsmanship. This magnificent superyacht offers unparalleled luxury with its expansive decks, sophisticated interiors, and state-of-the-art amenities. Perfect for those who demand nothing but the finest.',
      descriptionAr: 'تمثل ماجستي 155 قمة الحرفية العربية في صناعة اليخوت. يقدم هذا اليخت الفخم رفاهية لا مثيل لها مع أسطحه الواسعة وتصميماته الداخلية المتطورة ووسائل الراحة المتطورة.',
      highlightsEn: ['Beach Club', 'Jacuzzi on Sundeck', 'Zero-Speed Stabilizers', 'Cinema Room'],
      highlightsAr: ['نادي الشاطئ', 'جاكوزي على السطح', 'مثبتات صفرية السرعة', 'غرفة سينما'],
      amenitiesEn: ['Wi-Fi', 'Air Conditioning', 'Water Toys', 'Tender Garage', 'BBQ'],
      amenitiesAr: ['واي فاي', 'تكييف', 'ألعاب مائية', 'مرآب القوارب', 'شواء'],
      featured: true,
      showPrice: true,
      priority: 100,
    },
    {
      title: 'Azimut Grande 35',
      slug: 'azimut-grande-35-metri',
      type: YachtType.SALE,
      status: YachtStatus.AVAILABLE,
      price: 32000000,
      priceOnRequest: false,
      currency: 'AED',
      lengthFeet: 115,
      lengthMeters: 35.00,
      beam: 7.60,
      brand: 'Azimut',
      model: 'Grande 35 Metri',
      year: 2022,
      builder: 'Azimut Yachts',
      cabins: 5,
      bathrooms: 5,
      guestCapacity: 10,
      crewCapacity: 6,
      engines: 'Twin MTU 12V2000 M96',
      maxSpeed: 24,
      cruiseSpeed: 20,
      descriptionEn: 'Italian excellence meets Dubai luxury. The Azimut Grande 35 Metri combines legendary Italian design with cutting-edge engineering. Every detail speaks of refined taste and uncompromising quality.',
      descriptionAr: 'التميز الإيطالي يلتقي بالفخامة في دبي. يجمع أزيموت غراندي 35 متري بين التصميم الإيطالي الأسطوري والهندسة المتطورة.',
      highlightsEn: ['Carbon Tech Hull', 'D2P Diesel Electric', 'Open Flybridge', 'Beach Area'],
      highlightsAr: ['هيكل من تقنية الكربون', 'محرك كهربائي ديزل', 'جسر علوي مفتوح', 'منطقة الشاطئ'],
      featured: true,
      showPrice: true,
      priority: 90,
    },
    {
      title: 'Sunseeker 95',
      slug: 'sunseeker-95-yacht',
      type: YachtType.SALE,
      status: YachtStatus.AVAILABLE,
      price: 18500000,
      priceOnRequest: false,
      currency: 'AED',
      lengthFeet: 95,
      lengthMeters: 28.96,
      beam: 6.71,
      brand: 'Sunseeker',
      model: '95 Yacht',
      year: 2021,
      builder: 'Sunseeker International',
      cabins: 4,
      bathrooms: 4,
      guestCapacity: 8,
      crewCapacity: 4,
      engines: 'Twin MTU 16V2000 M93',
      maxSpeed: 28,
      cruiseSpeed: 24,
      descriptionEn: 'British engineering at its finest. The Sunseeker 95 Yacht delivers exhilarating performance with timeless sophistication. A perfect blend of sportiness and elegance for the discerning owner.',
      descriptionAr: 'الهندسة البريطانية في أفضل حالاتها. يقدم يخت صن سيكر 95 أداءً مثيراً مع تطور خالد. مزيج مثالي من الرياضية والأناقة.',
      highlightsEn: ['Hydraulic Swim Platform', 'Skylounge', 'Forward Jacuzzi', 'Garage for Jet Ski'],
      highlightsAr: ['منصة سباحة هيدروليكية', 'صالة سماوية', 'جاكوزي أمامي', 'مرآب جت سكي'],
      featured: true,
      showPrice: false,
      priority: 85,
    },
    {
      title: 'Royal Dubai Charter',
      slug: 'royal-dubai-charter-yacht',
      type: YachtType.CHARTER,
      status: YachtStatus.AVAILABLE,
      charterPricePerHour: 5000,
      charterPricePerDay: 35000,
      currency: 'AED',
      lengthFeet: 85,
      lengthMeters: 25.90,
      beam: 6.00,
      brand: 'Gulf Craft',
      model: 'Majesty 85',
      year: 2022,
      cabins: 4,
      bathrooms: 4,
      guestCapacity: 25,
      crewCapacity: 5,
      engines: 'Twin Caterpillar C32',
      maxSpeed: 22,
      cruiseSpeed: 18,
      descriptionEn: 'Experience Dubai from the water aboard this magnificent charter yacht. Perfect for celebrations, corporate events, or sunset cruises around the Palm and Marina. White-glove service included.',
      descriptionAr: 'اختبر دبي من الماء على متن هذا اليخت الفخم للإيجار. مثالي للاحتفالات وفعاليات الشركات أو رحلات غروب الشمس حول النخلة والمارينا.',
      highlightsEn: ['Professional Crew', 'Gourmet Catering', 'Water Sports', 'Sound System'],
      highlightsAr: ['طاقم محترف', 'تقديم طعام فاخر', 'رياضات مائية', 'نظام صوتي'],
      charterRoutes: ['Dubai Marina', 'Palm Jumeirah', 'World Islands', 'Burj Al Arab'],
      minimumHours: 4,
      featured: true,
      showPrice: true,
      priority: 95,
    },
    {
      title: 'Luxury Marina Cruiser',
      slug: 'luxury-marina-cruiser-charter',
      type: YachtType.CHARTER,
      status: YachtStatus.AVAILABLE,
      charterPricePerHour: 3500,
      charterPricePerDay: 25000,
      currency: 'AED',
      lengthFeet: 65,
      lengthMeters: 19.80,
      beam: 5.20,
      brand: 'Princess',
      model: 'V65',
      year: 2020,
      cabins: 3,
      bathrooms: 3,
      guestCapacity: 18,
      crewCapacity: 3,
      engines: 'Twin MAN V12',
      maxSpeed: 34,
      cruiseSpeed: 28,
      descriptionEn: 'The perfect yacht for intimate gatherings and memorable celebrations. This Princess V65 offers speed, style, and comfort for unforgettable Dubai experiences.',
      descriptionAr: 'اليخت المثالي للتجمعات الحميمة والاحتفالات التي لا تنسى. يقدم هذا اليخت السرعة والأناقة والراحة لتجارب دبي التي لا تنسى.',
      charterRoutes: ['Dubai Marina', 'Ain Dubai', 'JBR Beach', 'Atlantis'],
      minimumHours: 3,
      featured: false,
      showPrice: true,
      priority: 70,
    },
    {
      title: 'Pershing 140',
      slug: 'pershing-140-performance',
      type: YachtType.SALE,
      status: YachtStatus.AVAILABLE,
      priceOnRequest: true,
      currency: 'AED',
      lengthFeet: 140,
      lengthMeters: 42.67,
      beam: 8.00,
      brand: 'Pershing',
      model: '140',
      year: 2024,
      builder: 'Ferretti Group',
      cabins: 5,
      bathrooms: 6,
      guestCapacity: 10,
      crewCapacity: 7,
      engines: 'Triple MTU 16V2000 M96L',
      maxSpeed: 38,
      cruiseSpeed: 30,
      descriptionEn: 'The ultimate expression of speed and luxury. The Pershing 140 is a masterpiece of marine engineering, delivering breathtaking performance without compromising on comfort or style.',
      descriptionAr: 'التعبير النهائي عن السرعة والفخامة. بيرشينج 140 هو تحفة من الهندسة البحرية، يقدم أداءً مذهلاً دون المساس بالراحة أو الأناقة.',
      highlightsEn: ['38 Knots Top Speed', 'Carbon Fiber Construction', 'Racing Heritage', 'Italian Design'],
      highlightsAr: ['سرعة قصوى 38 عقدة', 'بناء من ألياف الكربون', 'تراث السباق', 'تصميم إيطالي'],
      featured: true,
      showPrice: false,
      priority: 98,
    },
  ]

  for (const yachtData of yachts) {
    const yacht = await prisma.yacht.create({
      data: yachtData,
    })

    // Add sample media for each yacht
    const sampleImages = [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=80',
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1920&q=80',
      'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1920&q=80',
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1920&q=80',
    ]

    for (let i = 0; i < sampleImages.length; i++) {
      await prisma.yachtMedia.create({
        data: {
          yachtId: yacht.id,
          url: sampleImages[i],
          type: MediaType.IMAGE,
          order: i,
          isCover: i === 0,
          alt: `${yacht.title} - Image ${i + 1}`,
        },
      })
    }

    console.log(`✅ Created yacht: ${yacht.title}`)
  }

  console.log('\n🎉 Database seeded successfully!')
  console.log(`📊 Created ${yachts.length} yachts with media`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
