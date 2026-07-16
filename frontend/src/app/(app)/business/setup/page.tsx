'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBusinessRequest } from '@/features/business/api/businessApi';
import { BusinessForm } from '@/features/business/components/BusinessForm';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export default function BusinessSetupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
const { data: currentUser } = useCurrentUser();

  const mutation = useMutation({
    mutationFn: createBusinessRequest,
    onSuccess: (business) => {
      queryClient.setQueryData(['business', 'me'], business);
      router.push('/dashboard');
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-6 text-2xl font-semibold">Set up your business</h1>
   <div className="w-full max-w-md">
  <BusinessForm defaultEmail={currentUser?.email} onSubmit={(input) => mutation.mutate(input)}
    isPending={mutation.isPending} submitLabel="Create business" />
</div>
      {mutation.isError && <p className="mt-4 text-sm text-red-600">Something went wrong. Try again.</p>}
    </div>
  );
}