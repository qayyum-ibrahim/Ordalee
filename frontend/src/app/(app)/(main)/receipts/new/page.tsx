'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateReceiptInput } from '@/features/receipts/api/receiptsApi';
import { ReceiptForm } from '@/features/receipts/components/ReceiptForm';
import { useMyBusiness } from '@/features/business/hooks/useMyBusiness';
import { createReceiptOffline } from '@/features/receipts/offline/createReceiptOffline';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewReceiptPage() {
  const router = useRouter();
  const { data: business, isLoading: businessLoading } = useMyBusiness();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(input: Omit<CreateReceiptInput, 'clientReceiptId'>) {
    if (!business) return;
    setIsSaving(true);
    setError(false);
    try {
      const { clientReceiptId } = await createReceiptOffline(business, input);
      router.push(`/receipts/local/${clientReceiptId}`);
    } catch {
      setError(true);
    } finally {
      setIsSaving(false);
    }
  }

  if (businessLoading || !business) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <Skeleton className="mb-4 h-8 w-40 rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="mb-4 text-2xl font-semibold">New receipt</h1>
      <ReceiptForm currency={business.currency} taxPercentage={business.taxPercentage}
        onSubmit={handleSubmit} isPending={isSaving} />
      {error && <p className="mt-2 text-center text-sm text-red-600">Couldn't save the receipt. Try again.</p>}
    </div>
  );
}