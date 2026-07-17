'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { resetPasswordRequest } from '@/features/auth/api/authApi';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getSupportWhatsAppLink } from '@/lib/constants/support';
import { PasswordInput } from '@/components/ui/password-input';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => resetPasswordRequest(token!, newPassword),
    onSuccess: () => setTimeout(() => router.push('/login'), 1500),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (token) mutation.mutate();
  }

  if (!token) {
    return (
      <Card elevation="md" className="w-full max-w-sm p-6 text-center md:p-8">
        <p className="text-sm text-muted-foreground">This reset link is missing its token.</p>
        <Link href="/forgot-password"><Button variant="outline" className="mt-4 w-full">Request reset link</Button></Link>
      </Card>
    );
  }

  return (
    <Card elevation="md" className="w-full max-w-sm p-6 md:p-8">
      <h2 className="mb-6 text-xl font-semibold">Choose a new password</h2>
      {mutation.isSuccess ? (
        <p className="rounded-lg bg-secondary/20 p-3 text-sm">Password updated. Redirecting to login…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput id="newPassword" placeholder="Minimum 8 characters" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          {mutation.isError && (
  <p className="text-sm text-red-600">
    This link is invalid or has expired.{' '}
    <a href={getSupportWhatsAppLink("Hi, my Ordalee password reset link isn't working.")}
      target="_blank" rel="noopener noreferrer" className="underline">
      Get help on WhatsApp
    </a>
  </p>
)}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}