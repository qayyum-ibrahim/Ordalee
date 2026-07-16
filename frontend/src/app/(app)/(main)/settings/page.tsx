'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { updateBusinessRequest, BusinessInput } from '@/features/business/api/businessApi';
import { logoutRequest } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMyBusiness } from '@/features/business/hooks/useMyBusiness';
import { BusinessForm } from '@/features/business/components/BusinessForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { syncAllPending, countUnsyncedReceipts } from '@/features/receipts/offline/syncEngine';

export default function SettingsPage() {
  const router = useRouter();
  const { data: business } = useMyBusiness();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const updateMutation = useMutation({
    mutationFn: (input: Partial<BusinessInput>) => updateBusinessRequest(business!._id, input),
    onSuccess: (updated) => queryClient.setQueryData(['business', 'me'], updated),
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
    onError: () => {
      // Deliberately not clearing local state here. Logout only means
      // something if the server actually revokes the refresh token —
      // if this request failed (offline, etc.) that httpOnly cookie is
      // still valid, and AuthGuard's silent-refresh would just log the
      // user right back in on their next visit. A fake local-only
      // logout would be worse than an honest error.
      toast.error("Couldn't log out — check your connection and try again.");
    },
  });

  async function handleLogout() {
  if (!business) return;

  if (navigator.onLine) {
    await syncAllPending(business); // give any queued receipts one last chance to reach the server
  }

  const unsyncedCount = await countUnsyncedReceipts(business._id);
  if (unsyncedCount > 0) {
    // Native confirm for now, deliberately — a proper styled confirmation
    // dialog needs real behavior (focus trap, escape-to-close), same
    // category as Select. Worth building once, properly, in Milestone 11
    // — not hand-rolled as a one-off here.
    const proceed = window.confirm(
      `You have ${unsyncedCount} receipt${unsyncedCount === 1 ? '' : 's'} that ${unsyncedCount === 1 ? "hasn't" : "haven't"} synced yet. ` +
      `They'll stay saved on this device and sync automatically next time you log in here — nothing is deleted. Log out now?`
    );
    if (!proceed) return;
  }

  logoutMutation.mutate();
}
  if (!business) return null;

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Business settings</h1>

      <Card elevation="sm" className="p-5">
        <BusinessForm initialValues={business} onSubmit={(input) => updateMutation.mutate(input)}
          isPending={updateMutation.isPending} submitLabel="Save changes" />
        {updateMutation.isSuccess && <p className="mt-4 text-sm text-green-600">Saved.</p>}
      </Card>

      <Card elevation="sm" className="mt-6 p-5">
        <h2 className="mb-1 text-sm font-medium text-muted-foreground">Account</h2>
        <p className="mb-4 text-sm text-muted-foreground">Sign out of Ordalee on this device.</p>
       <Button variant="outline" className="w-full" disabled={logoutMutation.isPending} onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
        </Button>
      </Card>
    </div>
  );
}