'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getReceiptRequest } from '@/features/receipts/api/receiptsApi';
import { useMyBusiness } from '@/features/business/hooks/useMyBusiness';
import { ReceiptSummaryCard } from '@/features/receipts/components/ReceiptSummaryCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: business } = useMyBusiness();

  const { data: receipt, isLoading } = useQuery({
    queryKey: ['receipt', business?._id, id],
    queryFn: () => getReceiptRequest(business!._id, id),
    enabled: !!business,
  });

  if (isLoading || !receipt || !business) {
    return (
      <div className="mx-auto max-w-lg p-4 md:p-8">
        <Skeleton className="h-56 rounded-xl" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
        </div>
      </div>
    );
  }

  return <ReceiptSummaryCard receipt={receipt} business={business} />;
}