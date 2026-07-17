'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { forgotPasswordRequest } from '@/features/auth/api/authApi';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getSupportWhatsAppLink } from '@/lib/constants/support';
import { getApiErrorMessage } from '@/lib/utils/apiError';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const mutation = useMutation({ mutationFn: () => forgotPasswordRequest(email) });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card elevation="md" className="w-full max-w-sm p-6 md:p-8">
        <h2 className="mb-2 text-xl font-semibold">Reset your password</h2>
        <p className="mb-6 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
        {mutation.isSuccess ? (
          <p className="rounded-lg bg-secondary/20 p-3 text-sm">If an account exists for that email, a reset link is on its way.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary underline underline-offset-2">Back to login</Link>
        </p>
        {mutation.isError && <p className="mb-2 text-sm text-red-600">{getApiErrorMessage(mutation.error)}</p>}
        <p className="mt-4 text-sm text-muted-foreground">
  Trouble resetting your password?{' '}
  <a href={getSupportWhatsAppLink("Hi, I'm having trouble resetting my Ordalee password.")}
    target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">
    Message us on WhatsApp
  </a>
</p>
      </Card>
    </div>
  );
}