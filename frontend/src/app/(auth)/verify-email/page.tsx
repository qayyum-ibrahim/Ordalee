'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import { verifyEmailRequest } from '@/features/auth/api/authApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    verifyEmailRequest(token).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token]);

  return (
    <Card elevation="md" className="w-full max-w-sm p-6 text-center md:p-8">
      {status === 'checking' && <p className="text-muted-foreground">Verifying…</p>}
      {status === 'success' && (
        <>
          <div className="animate-pop-in mb-4 flex justify-center"><CheckCircle2 className="h-12 w-12 text-primary" /></div>
          <h2 className="text-xl font-semibold">Email verified</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your account is active. You can log in now.</p>
          <Link href="/login"><Button className="mt-6 w-full">Go to login</Button></Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="mb-4 flex justify-center"><XCircle className="h-12 w-12 text-destructive" /></div>
          <h2 className="text-xl font-semibold">Link invalid or expired</h2>
          <p className="mt-2 text-sm text-muted-foreground">Request a new one from the check-email screen.</p>
          <Link href="/login"><Button variant="outline" className="mt-6 w-full">Back to login</Button></Link>
        </>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}