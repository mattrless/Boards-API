import { PrismaClient, PermissionType } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  console.log('Seeding...');

  await prisma.systemRole.createMany({
    data: [{ name: 'admin' }, { name: 'user' }],
    skipDuplicates: true,
  });

  await prisma.boardRole.createMany({
    data: [{ name: 'owner' }, { name: 'member' }],
    skipDuplicates: true,
  });

  await prisma.permission.createMany({
    data: [
      // SYSTEM
      { name: 'manage_users', type: PermissionType.SYSTEM },
      { name: 'manage_system_roles', type: PermissionType.SYSTEM },

      // BOARD
      { name: 'create_board', type: PermissionType.BOARD },
      { name: 'update_board', type: PermissionType.BOARD },
      { name: 'delete_board', type: PermissionType.BOARD },
      { name: 'manage_lists', type: PermissionType.BOARD },
      { name: 'manage_cards', type: PermissionType.BOARD },
    ],
    skipDuplicates: true,
  });

  const adminRole = await prisma.systemRole.findUnique({
    where: { name: 'admin' },
  });

  const systemPermissions = await prisma.permission.findMany({
    where: { type: PermissionType.SYSTEM },
  });

  if (adminRole) {
    await prisma.systemRoleSystemPermission.createMany({
      data: systemPermissions.map((permission) => ({
        systemRoleId: adminRole.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  const ownerRole = await prisma.boardRole.findUnique({
    where: { name: 'owner' },
  });

  const boardPermissions = await prisma.permission.findMany({
    where: { type: PermissionType.BOARD },
  });

  if (ownerRole) {
    await prisma.boardRoleBoardPermission.createMany({
      data: boardPermissions.map((permission) => ({
        boardRoleId: ownerRole.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  const adminProfile = await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Admin',
      avatar: null,
    },
  });

  if (adminRole) {
    await prisma.user.upsert({
      where: { email: 'admin@local.dev' },
      update: {},
      create: {
        email: 'admin@local.dev',
        password:
          '$2b$10$6tCJm9jtxnya/5XEgjsOwOsRNRqHRaRIftDdc/hHc3pRgu0h/Dx3C',
        profileId: adminProfile.id,
        systemRoleId: adminRole.id,
      },
    });
  }

  console.log('Done');
}

main()
  .catch((e) => {
    console.error('Seeding failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
