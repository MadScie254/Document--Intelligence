'use client';

import { Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        )}
        <h2 className="text-lg font-semibold text-gray-900">FlowForge Workspace</h2>
      </div>
      <Button type="button" className="gap-2" onClick={signOut}>
        <LogOut size={14} />
        Sign Out
      </Button>
    </header>
  );
}
