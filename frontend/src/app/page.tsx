'use client';

import Link from 'next/link';
import { GuestGuard } from '@/features/auth/components/GuestGuard';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <GuestGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-3xl font-bold text-primary">Ordalee</h1>
        <p className="mt-2 max-w-xs text-muted-foreground">
          Create professional receipts, track every sale, and share instantly on WhatsApp.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Link href="/login" className="w-full"><Button className="w-full">Log in</Button></Link>
          <Link href="/register" className="w-full"><Button variant="outline" className="w-full">Create account</Button></Link>
        </div>
      </div>
    </GuestGuard>
  );
}