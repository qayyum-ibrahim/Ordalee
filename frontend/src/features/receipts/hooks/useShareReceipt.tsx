'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ReceiptDocument } from '../pdf/ReceiptDocument';
import { Receipt } from '../api/receiptsApi';
import { Business } from '@/features/business/api/businessApi';

async function generatePdfBlob(receipt: Receipt, business: Business): Promise<Blob> {
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

      // Covers Chrome on Android, which is the large majority of your
      // target audience — but file-sharing support isn't universal across
      // every browser, so this always needs the fallback below, not just
      // a feature check and a prayer.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename, text: shareText });
        return;
      }

      // No public WhatsApp API can attach a file via a URL — wa.me only
      // pre-fills text. So: download the PDF, then open WhatsApp with the
      // message ready; the user attaches the file they just watched
      // download. Not one tap, but it always works.
      triggerDownload(blob, filename);
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    } finally {
      setIsGenerating(false);
    }
  }

  return { isGenerating, downloadPdf, shareToWhatsApp };
}