'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { registerRequest } from '@/features/auth/api/authApi';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => registerRequest(email, password),
    retry: false,
    onSuccess: () => router.push(`/check-email?email=${encodeURIComponent(email)}`),
  });

// Access the nested Axios error structure safely
const axiosError = mutation.error as any;
const backendErrorMessage = axiosError?.response?.data?.error?.message 
  || axiosError?.message 
  || "An unexpected error occurred.";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <h1 className="mb-8 text-2xl font-bold text-primary">Ordalee</h1>

      <Card elevation="md" className="w-full max-w-sm p-6 md:p-8">
        <h2 className="mb-6 text-xl font-semibold">Create your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" placeholder="Minimum 8 characters" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {mutation.isError && (<p className="text-sm text-red-600">{backendErrorMessage}</p>)}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary underline underline-offset-2">Log in</Link>
      </p>
    </div>
  );
}