'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { updateBusinessRequest, BusinessInput } from '@/features/business/api/businessApi';
import { logoutRequest } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMyBusiness } from '@/features/business/hooks/useMyBusiness';
import { BusinessForm } from '@/features/business/components/BusinessForm';
import { LogoUpload } from '@/features/business/components/LogoUpload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { syncAllPending, countUnsyncedReceipts } from '@/features/receipts/offline/syncEngine';
import { getApiErrorMessage } from '@/lib/utils/apiError';

export default function SettingsPage() {
  const router = useRouter();
  const { data: business } = useMyBusiness();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [pendingLogoutCount, setPendingLogoutCount] = useState<number | null>(null);

  const updateMutation = useMutation({
    mutationFn: (input: Partial<BusinessInput>) => updateBusinessRequest(business!._id, input),
    onSuccess: (updated) => queryClient.setQueryData(['business', 'me'], updated),
  });

  const logoMutation = useMutation({
    mutationFn: (logoUrl: string) => updateBusinessRequest(business!._id, { logoUrl }),
    onSuccess: (updated) => queryClient.setQueryData(['business', 'me'], updated),
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => { clearAuth(); queryClient.clear(); router.push('/login'); },
    onError: () => toast.error("Couldn't log out — check your connection and try again."),
  });

  async function handleLogoutClick() {
    if (!business) return;
    if (navigator.onLine) await syncAllPending(business);
    const unsyncedCount = await countUnsyncedReceipts(business._id);
    if (unsyncedCount > 0) setPendingLogoutCount(unsyncedCount);
    else logoutMutation.mutate();
  }

  if (!business) return null;

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Business settings</h1>

      <Card elevation="sm" className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Business logo</h2>
        <LogoUpload currentLogoUrl={business.logoUrl} onUploaded={(url) => logoMutation.mutate(url)} />
        {logoMutation.isSuccess && <p className="mt-3 text-sm text-green-600">Logo saved.</p>}
        {logoMutation.isError && <p className="mt-3 text-sm text-red-600">Logo uploaded, but saving it failed. Try again.</p>}
      </Card>

      <Card elevation="sm" className="p-5">
        <BusinessForm initialValues={business} onSubmit={(input) => updateMutation.mutate(input)}
          isPending={updateMutation.isPending} submitLabel="Save changes" />
        {updateMutation.isSuccess && <p className="mt-4 text-sm text-green-600">Saved.</p>}
        {updateMutation.isError && <p className="mt-4 text-sm text-red-600">{getApiErrorMessage(updateMutation.error)}</p>}
      </Card>

      <Card elevation="sm" className="mt-6 p-5">
        <h2 className="mb-1 text-sm font-medium text-muted-foreground">Account</h2>
        <p className="mb-4 text-sm text-muted-foreground">Sign out of Ordalee on this device.</p>
        <Button variant="outline" className="w-full" disabled={logoutMutation.isPending} onClick={handleLogoutClick}>
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
        </Button>
      </Card>

      <ConfirmDialog
        open={pendingLogoutCount !== null}
        onOpenChange={(open) => { if (!open) setPendingLogoutCount(null); }}
        title="Unsynced receipts on this device"
        description={`You have ${pendingLogoutCount} receipt${pendingLogoutCount === 1 ? '' : 's'} that ${pendingLogoutCount === 1 ? "hasn't" : "haven't"} synced yet. They'll stay saved on this device and sync automatically next time you log in here — nothing is deleted. Log out now?`}
        confirmLabel="Log out anyway"
        cancelLabel="Stay logged in"
        onConfirm={() => { setPendingLogoutCount(null); logoutMutation.mutate(); }}
      />
    </div>
  );
}