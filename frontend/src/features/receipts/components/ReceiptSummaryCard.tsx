'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Download, Share2, Check, Ban, RotateCcw } from 'lucide-react';
import { formatMinor } from '@/lib/utils/money';
import { Receipt, voidReceiptRequest, restoreReceiptRequest } from '../api/receiptsApi';
import { Business } from '@/features/business/api/businessApi';
import { useShareReceipt } from '../hooks/useShareReceipt';
import { cn } from '@/lib/utils';

interface ReceiptSummaryCardProps {
  receipt: Receipt;
  business: Business;
  statusBadge?: string;
  statusVariant?: 'info' | 'warning';
  showVoidAction?: boolean;
}

export function ReceiptSummaryCard({
  receipt, business, statusBadge, statusVariant = 'info', showVoidAction = true,
}: ReceiptSummaryCardProps) {
  const { isGenerating, downloadPdf, shareToWhatsApp } = useShareReceipt();
  const queryClient = useQueryClient();
  const [confirmingVoid, setConfirmingVoid] = useState(false);
  const isVoid = receipt.status === 'void';

  function invalidateAfterStatusChange(updated: Receipt) {
    queryClient.setQueryData(['receipt', business._id, receipt._id], updated);
    queryClient.invalidateQueries({ queryKey: ['receipts', business._id] });
    queryClient.invalidateQueries({ queryKey: ['dashboard', business._id] });
  }

  const voidMutation = useMutation({
    mutationFn: () => voidReceiptRequest(business._id, receipt._id),
    onSuccess: invalidateAfterStatusChange,
  });
  const restoreMutation = useMutation({
    mutationFn: () => restoreReceiptRequest(business._id, receipt._id),
    onSuccess: invalidateAfterStatusChange,
  });

  return (
    <div className="mx-auto max-w-lg p-4 md:p-8">
      <Card elevation="lg" className={cn('p-6 text-center', isVoid && 'opacity-60')}>
        <div className="mb-3 flex justify-center">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            isVoid ? 'bg-destructive/10' : 'animate-pop-in bg-secondary/20'
          )}>
            {isVoid ? <Ban className="h-6 w-6 text-destructive" strokeWidth={2.5} /> : <Check className="h-6 w-6 text-primary" strokeWidth={2.5} />}
          </div>
        </div>

        {isVoid ? (
          <span className="mb-2 inline-block rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">Voided</span>
        ) : statusBadge && (
          <span className={cn(
            'mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium',
            statusVariant === 'warning' ? 'bg-destructive/10 text-destructive' : 'bg-secondary/20 text-foreground'
          )}>
            {statusBadge}
          </span>
        )}
        <p className={cn('text-2xl font-semibold', isVoid ? 'text-muted-foreground line-through' : 'text-primary')}>{receipt.receiptNumber}</p>
        <p className={cn('font-money mt-2 text-3xl font-bold', isVoid && 'text-muted-foreground line-through')}>
          {formatMinor(receipt.totalMinor, business.currency)}
        </p>
        {receipt.customerName && <p className="mt-1 text-muted-foreground">{receipt.customerName}</p>}
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full" disabled={isGenerating} onClick={() => downloadPdf(receipt, business)}>
          <Download className="mr-2 h-4 w-4" />Download
        </Button>
        <Button className="w-full" disabled={isGenerating} onClick={() => shareToWhatsApp(receipt, business)}>
          <Share2 className="mr-2 h-4 w-4" />{isGenerating ? 'Preparing…' : 'Share'}
        </Button>
      </div>

      {showVoidAction && (
        <div className="mt-3">
          {isVoid ? (
            <Button variant="outline" className="w-full" disabled={restoreMutation.isPending} onClick={() => restoreMutation.mutate()}>
              <RotateCcw className="mr-2 h-4 w-4" />{restoreMutation.isPending ? 'Restoring…' : 'Restore receipt'}
            </Button>
          ) : (
            <Button variant="destructive" className="w-full" onClick={() => setConfirmingVoid(true)}>
              <Ban className="mr-2 h-4 w-4" />Void receipt
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmingVoid}
        onOpenChange={setConfirmingVoid}
        title="Void this receipt?"
        description={`${receipt.receiptNumber} will be marked void and removed from your sales totals. It stays on record and you can restore it any time — nothing is deleted.`}
        confirmLabel="Void receipt"
        cancelLabel="Cancel"
        onConfirm={() => { setConfirmingVoid(false); voidMutation.mutate(); }}
      />
    </div>
  );
}