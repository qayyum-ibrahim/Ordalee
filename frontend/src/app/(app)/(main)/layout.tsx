import { RequireBusiness } from '@/features/business/components/RequireBusiness';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewReceiptFab } from '@/components/layout/NewReceiptFab';
import { OfflineToastListener } from '@/components/layout/OfflineToastListener';
import { Toaster } from '@/components/ui/sonner';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireBusiness>
      <div className="pb-20 md:pb-0">{children}</div>
      <NewReceiptFab />
      <BottomNav />
      <OfflineToastListener />
      <Toaster
  position="top-center"
  toastOptions={{
    classNames: {
      toast: 'rounded-xl border border-border bg-card text-foreground shadow-[var(--shadow-md)]',
      success: 'border-primary/30',
      warning: 'border-secondary/40',
      error: 'border-destructive/40',
    },
  }}
/>
    </RequireBusiness>
  );
}