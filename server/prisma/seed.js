require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  const pw = await bcrypt.hash('admin1234', 10);

  // ──────────────────────────────────────────
  // Super Admin
  // ──────────────────────────────────────────
  const superAdmin = await prisma.admin.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: { username: 'superadmin', password: pw, role: 'SUPER_ADMIN' },
  });
  console.log('✅ Super Admin:', superAdmin.username);

  // ──────────────────────────────────────────
  // 단지
  // ──────────────────────────────────────────
  const guro = await prisma.complex.upsert({
    where: { slug: 'guro' },
    update: {},
    create: { name: '구로디지털단지', slug: 'guro' },
  });
  const gasan = await prisma.complex.upsert({
    where: { slug: 'gasan' },
    update: {},
    create: { name: '가산디지털단지', slug: 'gasan' },
  });
  console.log('✅ 단지:', guro.name, '/', gasan.name);

  // ──────────────────────────────────────────
  // 식당
  // ──────────────────────────────────────────
  const caf1 = await prisma.cafeteria.upsert({
    where: { id: 1 },
    update: {
      defaultBreakfastPrice: 4000,
      defaultLunchPrice: 5500,
      defaultDinnerPrice: 5000,
    },
    create: {
      complexId: guro.id,
      name: '1층 구내식당',
      description: '구로디지털단지 대표 구내식당',
      address: '서울 구로구 디지털로 300 1층',
      phone: '02-1234-5678',
      defaultBreakfastPrice: 4000,
      defaultLunchPrice: 5500,
      defaultDinnerPrice: 5000,
    },
  });
  const caf2 = await prisma.cafeteria.upsert({
    where: { id: 2 },
    update: {},
    create: {
      complexId: guro.id,
      name: '2층 레스토랑',
      description: '양식 위주 메뉴 제공',
      address: '서울 구로구 디지털로 300 2층',
      phone: '02-1234-5679',
      defaultLunchPrice: 8000,
      defaultDinnerPrice: 9000,
    },
  });
  const caf3 = await prisma.cafeteria.upsert({
    where: { id: 3 },
    update: {},
    create: {
      complexId: gasan.id,
      name: '본관 구내식당',
      description: '가산디지털단지 본관 1층',
      address: '서울 금천구 가산디지털1로 168',
      phone: '02-9876-5432',
      defaultBreakfastPrice: 3500,
      defaultLunchPrice: 5000,
      defaultDinnerPrice: 4500,
    },
  });
  console.log('✅ 식당:', caf1.name, '/', caf2.name, '/', caf3.name);

  // ──────────────────────────────────────────
  // Admin 계정
  // ──────────────────────────────────────────
  const admin1 = await prisma.admin.upsert({
    where: { username: 'admin_guro1' },
    update: {},
    create: { username: 'admin_guro1', password: pw, role: 'ADMIN', cafeteriaId: caf1.id },
  });
  const admin2 = await prisma.admin.upsert({
    where: { username: 'admin_gasan' },
    update: {},
    create: { username: 'admin_gasan', password: pw, role: 'ADMIN', cafeteriaId: caf3.id },
  });
  console.log('✅ Admin 계정:', admin1.username, '/', admin2.username);

  // ──────────────────────────────────────────
  // 카테고리 & 음식 항목 (caf1)
  // ──────────────────────────────────────────
  const catDefs = [
    {
      name: '밥류', order: 0,
      items: [
        { name: '쌀밥',   isMain: false, order: 0 },
        { name: '잡곡밥', isMain: false, order: 1 },
        { name: '볶음밥', isMain: true,  order: 2, calories: 580 },
      ],
    },
    {
      name: '국/찌개', order: 1,
      items: [
        { name: '된장찌개', isMain: false, order: 0, calories: 120 },
        { name: '김치찌개', isMain: false, order: 1, calories: 150 },
        { name: '미역국',   isMain: false, order: 2, calories: 80  },
        { name: '순두부찌개', isMain: false, order: 3, calories: 130 },
      ],
    },
    {
      name: '반찬', order: 2,
      items: [
        { name: '제육볶음',   isMain: true,  order: 0, calories: 320 },
        { name: '닭갈비',     isMain: true,  order: 1, calories: 380 },
        { name: '생선구이',   isMain: true,  order: 2, calories: 210 },
        { name: '계란찜',     isMain: false, order: 3, calories: 110 },
        { name: '시금치나물', isMain: false, order: 4, calories: 50  },
        { name: '콩자반',     isMain: false, order: 5, calories: 90  },
        { name: '김치',       isMain: false, order: 6, calories: 20  },
        { name: '깍두기',     isMain: false, order: 7, calories: 25  },
      ],
    },
    {
      name: '후식', order: 3,
      items: [
        { name: '요거트', isMain: false, order: 0, calories: 100 },
        { name: '과일',   isMain: false, order: 1, calories: 60  },
        { name: '식혜',   isMain: false, order: 2, calories: 140 },
      ],
    },
  ];

  for (const catDef of catDefs) {
    const existing = await prisma.category.findFirst({
      where: { cafeteriaId: caf1.id, name: catDef.name },
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          cafeteriaId: caf1.id,
          name: catDef.name,
          order: catDef.order,
          items: { create: catDef.items },
        },
      });
    }
  }
  console.log('✅ 카테고리 & 음식 항목 생성 완료');

  // ──────────────────────────────────────────
  // 메뉴 (오늘 + 어제)
  // ──────────────────────────────────────────
  const menuDefs = [
    {
      cafeteriaId: caf1.id,
      date: daysAgo(0),
      mealType: 'BREAKFAST',
      price: 4000,
      isPublished: true,
      items: [
        { name: '쌀밥',     isMain: false, order: 0 },
        { name: '미역국',   isMain: false, order: 1, calories: 80  },
        { name: '계란찜',   isMain: false, order: 2, calories: 110 },
        { name: '김치',     isMain: false, order: 3, calories: 20  },
        { name: '요거트',   isMain: false, order: 4, calories: 100 },
      ],
    },
    {
      cafeteriaId: caf1.id,
      date: daysAgo(0),
      mealType: 'LUNCH',
      price: 5500,
      isPublished: true,
      items: [
        { name: '잡곡밥',     isMain: false, order: 0 },
        { name: '된장찌개',   isMain: false, order: 1, calories: 120 },
        { name: '제육볶음',   isMain: true,  order: 2, calories: 320 },
        { name: '시금치나물', isMain: false, order: 3, calories: 50  },
        { name: '깍두기',     isMain: false, order: 4, calories: 25  },
        { name: '과일',       isMain: false, order: 5, calories: 60  },
      ],
    },
    {
      cafeteriaId: caf1.id,
      date: daysAgo(0),
      mealType: 'DINNER',
      price: 5000,
      isPublished: true,
      items: [
        { name: '쌀밥',     isMain: false, order: 0 },
        { name: '김치찌개', isMain: false, order: 1, calories: 150 },
        { name: '닭갈비',   isMain: true,  order: 2, calories: 380 },
        { name: '콩자반',   isMain: false, order: 3, calories: 90  },
        { name: '김치',     isMain: false, order: 4, calories: 20  },
      ],
    },
    {
      cafeteriaId: caf1.id,
      date: daysAgo(1),
      mealType: 'LUNCH',
      price: 5500,
      isPublished: true,
      items: [
        { name: '볶음밥',     isMain: true,  order: 0, calories: 580 },
        { name: '순두부찌개', isMain: false, order: 1, calories: 130 },
        { name: '생선구이',   isMain: true,  order: 2, calories: 210 },
        { name: '시금치나물', isMain: false, order: 3, calories: 50  },
        { name: '식혜',       isMain: false, order: 4, calories: 140 },
      ],
    },
    {
      cafeteriaId: caf3.id,
      date: daysAgo(0),
      mealType: 'LUNCH',
      price: 5000,
      isPublished: true,
      items: [
        { name: '잡곡밥',   isMain: false, order: 0 },
        { name: '미역국',   isMain: false, order: 1, calories: 80  },
        { name: '닭갈비',   isMain: true,  order: 2, calories: 380 },
        { name: '계란찜',   isMain: false, order: 3, calories: 110 },
        { name: '김치',     isMain: false, order: 4, calories: 20  },
      ],
    },
  ];

  for (const m of menuDefs) {
    const existing = await prisma.menu.findUnique({
      where: { cafeteriaId_date_mealType: { cafeteriaId: m.cafeteriaId, date: m.date, mealType: m.mealType } },
    });
    if (!existing) {
      await prisma.menu.create({
        data: {
          cafeteriaId: m.cafeteriaId,
          date: m.date,
          mealType: m.mealType,
          price: m.price,
          isPublished: m.isPublished,
          items: { create: m.items },
        },
      });
    }
  }
  console.log('✅ 메뉴 생성 완료 (오늘 조/중/석, 어제 중식)');

  // ──────────────────────────────────────────
  // 공지/이벤트
  // ──────────────────────────────────────────
  const noticeDefs = [
    {
      cafeteriaId: caf1.id,
      title: '4월 정기 휴무 안내',
      content: '4월 19일(토) ~ 4월 20일(일)은 정기 휴무입니다.\n이용에 불편을 드려 죄송합니다.',
      type: 'NOTICE',
      isPublished: true,
    },
    {
      cafeteriaId: caf1.id,
      title: '봄맞이 특별 메뉴 이벤트',
      content: '4월 한 달간 봄 제철 재료를 활용한 특별 메뉴를 선보입니다.\n매주 금요일 디저트 무료 제공!',
      type: 'EVENT',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-04-30'),
      isPublished: true,
    },
    {
      cafeteriaId: caf3.id,
      title: '식당 리모델링 공사 안내',
      content: '4월 25일(금)부터 5월 2일(금)까지 내부 리모델링 공사로 임시 휴업합니다.',
      type: 'NOTICE',
      isPublished: true,
    },
  ];

  for (const n of noticeDefs) {
    const existing = await prisma.notice.findFirst({
      where: { cafeteriaId: n.cafeteriaId, title: n.title },
    });
    if (!existing) {
      await prisma.notice.create({ data: n });
    }
  }
  console.log('✅ 공지/이벤트 생성 완료');

  console.log('\n══════════════════════════════');
  console.log('  테스트 계정');
  console.log('══════════════════════════════');
  console.log('  Super Admin  superadmin  / admin1234');
  console.log('  구로 식당     admin_guro1 / admin1234');
  console.log('  가산 식당     admin_gasan / admin1234');
  console.log('══════════════════════════════\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
