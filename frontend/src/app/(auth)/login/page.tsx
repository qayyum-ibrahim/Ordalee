'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { loginRequest } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/utils/apiError';
import { GuestGuard } from '@/features/auth/components/GuestGuard';

export default function LoginPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => loginRequest(email, password),
    onSuccess: (data) => { setAccessToken(data.accessToken); router.push('/dashboard'); },
  });

  const axiosError = mutation.error as AxiosError | undefined;
const isNetworkError = mutation.isError && !axiosError?.response;
const errorCode = getApiErrorCode(mutation.error);
const isUnverified = errorCode === 'EMAIL_NOT_VERIFIED';
const isRateLimited = errorCode === 'RATE_LIMITED';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
  <GuestGuard>
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <h1 className="mb-8 text-2xl font-bold text-primary">Ordalee</h1>
      <Card elevation="md" className="w-full max-w-sm p-6 md:p-8">
        <h2 className="mb-6 text-xl font-semibold">Log in</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary underline underline-offset-2">Forgot password?</Link>
            </div>
            <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {isNetworkError && <p className="text-sm text-red-600">Couldn't connect. Check your internet connection and try again.</p>}
{isRateLimited && <p className="text-sm text-red-600">{getApiErrorMessage(mutation.error)}</p>}
{mutation.isError && !isNetworkError && !isRateLimited && !isUnverified && <p className="text-sm text-red-600">Incorrect email or password.</p>}
{isUnverified && (
  <p className="text-sm text-red-600">
    Please verify your email first.{' '}
    <Link href={`/check-email?email=${encodeURIComponent(email)}`} className="underline">Resend the link</Link>
  </p>
)}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-primary underline underline-offset-2">Create one</Link>
      </p>
    </div>
  </GuestGuard>
  );
}