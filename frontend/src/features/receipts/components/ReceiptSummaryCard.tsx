'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Share2, Check } from 'lucide-react';
import { formatMinor } from '@/lib/utils/money';
import { Receipt } from '../api/receiptsApi';
import { Business } from '@/features/business/api/businessApi';
import { useShareReceipt } from '../hooks/useShareReceipt';
import { cn } from '@/lib/utils';

interface ReceiptSummaryCardProps {
  receipt: Receipt;
  business: Business;
  statusBadge?: string;
  statusVariant?: 'info' | 'warning';
}

export function ReceiptSummaryCard({ receipt, business, statusBadge, statusVariant = 'info' }: ReceiptSummaryCardProps) {
  const { isGenerating, downloadPdf, shareToWhatsApp } = useShareReceipt();

  return (
    <div className="mx-auto max-w-lg p-4 md:p-8">
      <Card elevation="lg" className="p-6 text-center">
        <div className="mb-3 flex justify-center">
          <div className="animate-pop-in flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
            <Check className="h-6 w-6 text-primary" strokeWidth={2.5} />
          </div>
        </div>

        {statusBadge && (
          <span className={cn(
            'mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium',
            statusVariant === 'warning' ? 'bg-destructive/10 text-destructive' : 'bg-secondary/20 text-foreground'
          )}>
            {statusBadge}
          </span>
        )}
        <p className="text-2xl font-semibold text-primary">{receipt.receiptNumber}</p>
        <p className="font-money mt-2 text-3xl font-bold">{formatMinor(receipt.totalMinor, business.currency)}</p>
        {receipt.customerName && <p className="mt-1 text-muted-foreground">{receipt.customerName}</p>}
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full" disabled={isGenerating} onClick={() => downloadPdf(receipt, business)}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button className="w-full" disabled={isGenerating} onClick={() => shareToWhatsApp(receipt, business)}>
          <Share2 className="mr-2 h-4 w-4" />
          {isGenerating ? 'Preparing…' : 'Share'}
        </Button>
      </div>
    </div>
  );
}