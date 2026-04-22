import prisma from '../config/db';

export async function getDashboardStats() {
  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    cancelledOrders,
    totalCustomers,
    totalMenuItems,
    totalCategories,
    totalRevenue,
    todayOrders,
    todayRevenue,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'CONFIRMED' } }),
    prisma.order.count({ where: { status: 'PREPARING' } }),
    prisma.order.count({ where: { status: 'READY' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    prisma.order.findMany({
      select: { customerPhone: true },
      distinct: ['customerPhone'],
    }),
    prisma.menuItem.count(),
    prisma.menuCategory.count({ where: { isActive: true } }),
    prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  const ordersByStatus = {
    REQUESTED: pendingOrders,
    CONFIRMED: confirmedOrders,
    PREPARING: preparingOrders,
    READY: readyOrders,
    COMPLETED: completedOrders,
    CANCELLED: cancelledOrders,
  };

  return {
    overview: {
      totalOrders,
      totalCustomers: totalCustomers.length,
      totalMenuItems,
      totalCategories,
      totalRevenue: totalRevenue._sum.totalAmount?.toString() || '0',
      todayOrders,
      todayRevenue: todayRevenue._sum.totalAmount?.toString() || '0',
    },
    ordersByStatus,
  };
}

export default { getDashboardStats };
