'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useMyBusiness } from '@/features/business/hooks/useMyBusiness';
import { listReceiptsRequest } from '@/features/receipts/api/receiptsApi';
import { formatMinor } from '@/lib/utils/money';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { startOfBusinessDay, startOfBusinessWeek, startOfBusinessMonth } from '@/lib/utils/businessTime';

type FilterPreset = 'all' | 'today' | 'week' | 'month' | 'custom';

const PRESETS: { value: FilterPreset; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'custom', label: 'Custom' },
];

export default function ReceiptsListPage() {
  const { data: business } = useMyBusiness();
  const [search, setSearch] = useState('');
  const [preset, setPreset] = useState<FilterPreset>('all');
  const [customDate, setCustomDate] = useState('');
  const [page, setPage] = useState(1);

  const from = (() => {
    const now = new Date();
    if (preset === 'today') return startOfBusinessDay(now).toISOString();
    if (preset === 'week') return startOfBusinessWeek(now).toISOString();
    if (preset === 'month') return startOfBusinessMonth(now).toISOString();
    if (preset === 'custom' && customDate) return startOfBusinessDay(new Date(customDate)).toISOString();
    return undefined;
  })();

  const to = preset === 'custom' && customDate
    ? new Date(startOfBusinessDay(new Date(customDate)).getTime() + 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['receipts', business?._id, { search, from, to, page }],
    queryFn: () => listReceiptsRequest(business!._id, { search: search || undefined, from, to, page, limit: 20 }),
    enabled: !!business,
  });

  if (!business) return null;

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="mb-4 text-2xl font-semibold">Receipts</h1>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by customer or receipt number" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {PRESETS.map((p) => (
          <button key={p.value} onClick={() => { setPreset(p.value); setPage(1); }}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors',
              preset === p.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:bg-muted'
            )}>
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <Input type="date" className="mb-4" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : !data || data.receipts.length === 0 ? (
        <Card elevation="sm" className="border-dashed p-8 text-center text-sm text-muted-foreground">
          {search || preset !== 'all' ? 'No receipts match this filter.' : "You haven't created any receipts yet."}
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {data.receipts.map((receipt, i) => (
              <Link key={receipt._id} href={`/receipts/${receipt._id}`}
                style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }} className="animate-fade-in-up block">
                <Card elevation="sm" className="flex items-center justify-between p-3 transition-shadow hover:shadow-(--shadow-md)">
                  <div>
                    <p className="text-sm font-medium">{receipt.receiptNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {receipt.customerName || 'Walk-in customer'} ·{' '}
                      {new Date(receipt.clientCreatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <p className="font-money text-sm font-semibold">{formatMinor(receipt.totalMinor, business.currency)}</p>
                </Card>
              </Link>
            ))}
          </div>

          {data.total > data.limit && (
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(data.total / data.limit)}</span>
              <Button variant="outline" disabled={page * data.limit >= data.total} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}