import { PrismaClient, PermissionType } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  await prisma.systemRole.createMany({
    data: [{ name: 'admin' }, { name: 'user' }],
    skipDuplicates: true,
  });

  await prisma.boardRole.createMany({
    data: [{ name: 'admin' }, { name: 'member' }],
    skipDuplicates: true,
  });

  await prisma.permission.createMany({
    data: [
      // USER – shared (admin + user)
      { name: 'user_create', type: PermissionType.SYSTEM },
      { name: 'user_read', type: PermissionType.SYSTEM },
      { name: 'user_update_self', type: PermissionType.SYSTEM },
      { name: 'user_delete_self', type: PermissionType.SYSTEM },

      // BOARD
      { name: 'board_create', type: PermissionType.SYSTEM },
      { name: 'board_delete', type: PermissionType.SYSTEM },
      { name: 'board_read', type: PermissionType.SYSTEM },
      { name: 'board_update', type: PermissionType.SYSTEM },
      { name: 'board_restore', type: PermissionType.SYSTEM },

      { name: 'board_add_members', type: PermissionType.BOARD },
      { name: 'board_remove_members', type: PermissionType.BOARD },
      { name: 'board_update_member_role', type: PermissionType.BOARD },
      { name: 'board_view_members', type: PermissionType.BOARD },

      // LIST
      { name: 'list_create', type: PermissionType.BOARD },
      { name: 'list_read', type: PermissionType.BOARD },
      { name: 'list_update', type: PermissionType.BOARD },
      { name: 'list_delete', type: PermissionType.BOARD },

      // USER – admin only
      { name: 'user_update_any', type: PermissionType.SYSTEM },
      { name: 'user_delete_any', type: PermissionType.SYSTEM },
      { name: 'user_restore', type: PermissionType.SYSTEM },
    ],
    skipDuplicates: true,
  });

  const adminRole = await prisma.systemRole.findUnique({
    where: { name: 'admin' },
  });

  const userRole = await prisma.systemRole.findUnique({
    where: { name: 'user' },
  });

  if (!adminRole || !userRole) {
    throw new Error('System roles not found');
  }

  const adminPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'user_create',
          'user_read',
          'user_update_self',
          'user_delete_self',
          'user_update_any',
          'user_delete_any',
          'user_restore',
          'board_create',
          'board_delete',
          'board_read',
          'board_update',
          'board_restore',
        ],
      },
    },
  });

  const userPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'user_create',
          'user_read',
          'user_update_self',
          'user_delete_self',
          'board_create',
          'board_delete',
          'board_read',
          'board_update',
          'board_restore',
        ],
      },
    },
  });

  await prisma.systemRoleSystemPermission.createMany({
    data: adminPermissions.map((permission) => ({
      systemRoleId: adminRole.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  await prisma.systemRoleSystemPermission.createMany({
    data: userPermissions.map((permission) => ({
      systemRoleId: userRole.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  const adminBoardRole = await prisma.boardRole.findUnique({
    where: { name: 'admin' },
  });

  const memberBoardRole = await prisma.boardRole.findUnique({
    where: { name: 'member' },
  });

  if (!adminBoardRole || !memberBoardRole) {
    throw new Error('Board roles not found');
  }

  const adminBoardPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'board_add_members',
          'board_remove_members',
          'board_update_member_role',
          'board_view_members',
          'list_create',
          'list_read',
          'list_update',
          'list_delete',
        ],
      },
      type: PermissionType.BOARD,
    },
  });

  const memberBoardPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: ['board_view_members', 'list_read'],
      },
      type: PermissionType.BOARD,
    },
  });

  await prisma.boardRoleBoardPermission.createMany({
    data: adminBoardPermissions.map((permission) => ({
      boardRoleId: adminBoardRole.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  await prisma.boardRoleBoardPermission.createMany({
    data: memberBoardPermissions.map((permission) => ({
      boardRoleId: memberBoardRole.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  const adminProfile = await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Admin',
      avatar: null,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@local.dev' },
    update: {},
    create: {
      email: 'admin@local.dev',
      password: '$2b$10$6tCJm9jtxnya/5XEgjsOwOsRNRqHRaRIftDdc/hHc3pRgu0h/Dx3C',
      profileId: adminProfile.id,
      systemRoleId: adminRole.id,
    },
  });

  console.log('Seeding finished');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
