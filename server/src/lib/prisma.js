const { PrismaClient } = require('@prisma/client');

// PrismaClient는 DB 커넥션 풀을 관리하므로 앱 전체에서 하나만 생성해야 합니다.
// Spring의 @Bean + 싱글톤 스코프와 같은 개념입니다.
const prisma = new PrismaClient();

module.exports = prisma;
