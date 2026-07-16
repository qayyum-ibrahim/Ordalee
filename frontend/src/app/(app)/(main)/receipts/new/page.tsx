'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateReceiptInput } from '@/features/receipts/api/receiptsApi';
import { ReceiptForm } from '@/features/receipts/components/ReceiptForm';
import { useMyBusiness } from '@/features/business/hooks/useMyBusiness';
import { createReceiptOffline } from '@/features/receipts/offline/createReceiptOffline';

export default function NewReceiptPage() {
  const router = useRouter();
  const { data: business } = useMyBusiness();
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
      setError(true); // an IndexedDB write itself failing — private-browsing
      // restrictions in some browsers, not a network issue
    } finally {
      setIsSaving(false);
    }
  }

  if (!business) return null;

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">New receipt</h1>
      <ReceiptForm currency={business.currency} taxPercentage={business.taxPercentage}
        onSubmit={handleSubmit} isPending={isSaving} />
      {error && <p className="mt-2 text-center text-sm text-red-600">Couldn't save the receipt. Try again.</p>}
    </div>
  );
}