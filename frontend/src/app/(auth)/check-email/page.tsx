'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { resendVerificationRequest } from '@/features/auth/api/authApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [sent, setSent] = useState(false);
  const [resendError, setResendError] = useState(false);
const mutation = useMutation({
  mutationFn: () => resendVerificationRequest(email),
  onSuccess: () => setSent(true),
  onError: () => setResendError(true),
});
  return (
    <Card elevation="md" className="w-full max-w-sm p-6 text-center md:p-8">
      <div className="mb-4 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
          <MailCheck className="h-6 w-6 text-primary" />
        </div>
      </div>
      <h2 className="text-xl font-semibold">Check your email</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a verification link to {email ? <span className="font-medium text-foreground">{email}</span> : 'your email address'}. Click it to activate your account.
      </p>
      <Button variant="outline" className="mt-6 w-full" disabled={!email || mutation.isPending || sent} onClick={() => mutation.mutate()}>
        {sent ? 'Link resent' : mutation.isPending ? 'Resending…' : "Didn't get it? Resend"}
      </Button>
      <p className="mt-4 text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary underline underline-offset-2">Back to login</Link>
      </p>
      {resendError && <p className="mt-2 text-sm text-red-600">Couldn't resend right now. Try again in a moment.</p>}
    </Card>
  );
}

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <CheckEmailContent />
      </Suspense>
    </div>
  );
}