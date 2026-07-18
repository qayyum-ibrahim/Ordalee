'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Receipt } from '../api/receiptsApi';
import { Business } from '@/features/business/api/businessApi';

async function importWithRetry<T>(importFn: () => Promise<T>, retries = 2, delayMs = 800): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return importWithRetry(importFn, retries - 1, delayMs);
  }
}

async function generatePdfBlob(receipt: Receipt, business: Business): Promise<Blob> {
  const [{ pdf }, { ReceiptDocument }] = await Promise.all([
    importWithRetry(() => import('@react-pdf/renderer')),
    importWithRetry(() => import('../pdf/ReceiptDocument')),
  ]);
  return pdf(<ReceiptDocument receipt={receipt} business={business} />).toBlob();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function useShareReceipt() {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Silently warm the PDF engine's code the moment a receipt screen is
    // viewed — errors here are deliberately swallowed, since this is just
    // a head start, not a user-facing action. If it fails, the retry
    // logic in generatePdfBlob still runs for real at click time.
    importWithRetry(() => import('@react-pdf/renderer')).catch(() => {});
    importWithRetry(() => import('../pdf/ReceiptDocument')).catch(() => {});
  }, []);

  async function downloadPdf(receipt: Receipt, business: Business) {
    setIsGenerating(true);
    try {
      const blob = await generatePdfBlob(receipt, business);
      triggerDownload(blob, `${receipt.receiptNumber}.pdf`);
    } catch {
      toast.error("Couldn't prepare the PDF. Check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function shareToWhatsApp(receipt: Receipt, business: Business) {
    setIsGenerating(true);
    try {
      const blob = await generatePdfBlob(receipt, business);
      const filename = `${receipt.receiptNumber}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });
      const shareText = `Receipt ${receipt.receiptNumber} from ${business.name} — thank you for your business!`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename, text: shareText });
        return;
      }
      triggerDownload(blob, filename);
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      toast.error("Couldn't prepare the receipt. Check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return { isGenerating, downloadPdf, shareToWhatsApp };
}