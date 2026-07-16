'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

export function NewReceiptFab() {
  return (
    <Link
      href="/receipts/new"
      aria-label="New receipt"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-(--shadow-lg) transition-transform active:scale-90 md:hidden"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}