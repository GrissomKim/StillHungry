require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Super Admin 계정 생성
  const hashed = await bcrypt.hash('admin1234', 10);
  const superAdmin = await prisma.admin.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password: hashed,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Super Admin 생성:', superAdmin.username);

  // 테스트용 단지 생성
  const complex = await prisma.complex.upsert({
    where: { slug: 'guro' },
    update: {},
    create: {
      name: '구로디지털단지',
      slug: 'guro',
    },
  });
  console.log('✅ 단지 생성:', complex.name);

  // 테스트용 식당 생성
  const cafeteria = await prisma.cafeteria.upsert({
    where: { id: 1 },
    update: {},
    create: {
      complexId: complex.id,
      name: '테스트 구내식당',
      description: '개발 테스트용 식당',
    },
  });
  console.log('✅ 식당 생성:', cafeteria.name);

  // 식당 Admin 계정 생성
  const hashed2 = await bcrypt.hash('admin1234', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'testadmin' },
    update: {},
    create: {
      username: 'testadmin',
      password: hashed2,
      role: 'ADMIN',
      cafeteriaId: cafeteria.id,
    },
  });
  console.log('✅ Admin 계정 생성:', admin.username);

  console.log('\n=== 테스트 계정 ===');
  console.log('Super Admin - ID: superadmin / PW: admin1234');
  console.log('Admin       - ID: testadmin  / PW: admin1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
