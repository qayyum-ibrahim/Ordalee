import { Types } from 'mongoose';
import { Receipt } from '../models/Receipt.model';
import { startOfBusinessDay, startOfBusinessWeek, startOfBusinessMonth } from '../../../shared/utils/businessTime';

export interface DashboardStats {
  todayRevenueMinor: number;
  weekRevenueMinor: number;
  monthRevenueMinor: number;
  todayReceiptCount: number;
  recentReceipts: unknown[];
}

export async function getDashboardStats(businessId: string): Promise<DashboardStats> {
  const now = new Date();
  const todayStart = startOfBusinessDay(now);
  const weekStart = startOfBusinessWeek(now);
  const monthStart = startOfBusinessMonth(now);

  const [result] = await Receipt.aggregate([
    { $match: { businessId: new Types.ObjectId(businessId), status: 'completed' } },
    {
      $facet: {
        today: [
          { $match: { clientCreatedAt: { $gte: todayStart } } },
          { $group: { _id: null, revenue: { $sum: '$totalMinor' }, count: { $sum: 1 } } },
        ],
        week: [
          { $match: { clientCreatedAt: { $gte: weekStart } } },
          { $group: { _id: null, revenue: { $sum: '$totalMinor' } } },
        ],
        month: [
          { $match: { clientCreatedAt: { $gte: monthStart } } },
          { $group: { _id: null, revenue: { $sum: '$totalMinor' } } },
        ],
        recent: [{ $sort: { clientCreatedAt: -1 } }, { $limit: 5 }],
      },
    },
  ]);

  return {
    todayRevenueMinor: result.today[0]?.revenue ?? 0,
    weekRevenueMinor: result.week[0]?.revenue ?? 0,
    monthRevenueMinor: result.month[0]?.revenue ?? 0,
    todayReceiptCount: result.today[0]?.count ?? 0,
    recentReceipts: result.recent,
  };
}