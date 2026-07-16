'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useMyBusiness } from '@/features/business/hooks/useMyBusiness';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { formatMinor } from '@/lib/utils/money';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const { data: business } = useMyBusiness();
  const { data: stats, isLoading } = useDashboardStats(business?._id);

  if (!business) return null;

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-xl font-semibold md:text-2xl">{business.name}</h1>
        </div>
        <Link href="/settings" aria-label="Settings" className="rounded-full p-2 transition-colors hover:bg-muted">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>

      {isLoading || !stats ? (
        <DashboardSkeleton />
      ) : (
        <div className="md:grid md:grid-cols-[1fr_1.2fr] md:gap-6">
          <div>
            <Card elevation="lg" className="bg-primary p-5 text-primary-foreground">
              <p className="text-sm opacity-80">Today's revenue</p>
              <p className="font-money mt-1 text-3xl font-bold md:text-4xl">
                {formatMinor(stats.todayRevenueMinor, business.currency)}
              </p>
              <p className="mt-1 text-sm opacity-80">
                {stats.todayReceiptCount} receipt{stats.todayReceiptCount === 1 ? '' : 's'} today
              </p>
            </Card>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Card elevation="sm" className="p-4">
                <p className="text-xs text-muted-foreground">This week</p>
                <p className="font-money mt-1 text-lg font-semibold">{formatMinor(stats.weekRevenueMinor, business.currency)}</p>
              </Card>
              <Card elevation="sm" className="p-4">
                <p className="text-xs text-muted-foreground">This month</p>
                <p className="font-money mt-1 text-lg font-semibold">{formatMinor(stats.monthRevenueMinor, business.currency)}</p>
              </Card>
            </div>
          </div>

          <div className="mt-6 md:mt-0">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Recent receipts</h2>
              <Link href="/receipts" className="text-sm text-primary">See all</Link>
            </div>
            {stats.recentReceipts.length === 0 ? (
              <Card elevation="sm" className="border-dashed p-6 text-center text-sm text-muted-foreground">
                You haven't created any receipts yet.
              </Card>
            ) : (
              <div className="space-y-2">
                {stats.recentReceipts.map((receipt, i) => (
                  <Link key={receipt._id} href={`/receipts/${receipt._id}`}
                    style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in-up block">
                    <Card elevation="sm" className="flex items-center justify-between p-3 transition-shadow hover:shadow-(--shadow-md)">
                      <div>
                        <p className="text-sm font-medium">{receipt.receiptNumber}</p>
                        <p className="text-xs text-muted-foreground">{receipt.customerName || 'Walk-in customer'}</p>
                      </div>
                      <p className="font-money text-sm font-semibold">{formatMinor(receipt.totalMinor, business.currency)}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 rounded-xl bg-muted" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-xl bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-16 rounded-xl bg-muted" />
        <div className="h-16 rounded-xl bg-muted" />
      </div>
    </div>
  );
}