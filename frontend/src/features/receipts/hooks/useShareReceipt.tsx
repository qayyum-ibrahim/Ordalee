'use client';

import { useState } from 'react';
import { Receipt } from '../api/receiptsApi';
import { Business } from '@/features/business/api/businessApi';
import { toast } from 'sonner';

async function generatePdfBlob(receipt: Receipt, business: Business): Promise<Blob> {
  const { pdf } = await import('@react-pdf/renderer');
  const { ReceiptDocument } = await import('../pdf/ReceiptDocument');
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

  async function downloadPdf(receipt: Receipt, business: Business) {
  setIsGenerating(true);
  try {
    const blob = await generatePdfBlob(receipt, business);
    triggerDownload(blob, `${receipt.receiptNumber}.pdf`);
  } catch {
    toast.error("Couldn't generate the PDF. Try again.");
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
    if (error instanceof Error && error.name === 'AbortError') return; // user cancelled the share sheet — not a failure
    toast.error("Couldn't prepare the receipt. Try again.");
  } finally {
    setIsGenerating(false);
  }
}

  return { isGenerating, downloadPdf, shareToWhatsApp };
}

