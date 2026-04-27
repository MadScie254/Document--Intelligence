'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { X } from 'lucide-react';
import { Activity, LayoutGrid, PlayCircle, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/workflows', label: 'Workflows', icon: Workflow },
  { href: '/workflows/new', label: 'New Workflow', icon: PlayCircle },
  { href: '/runs/recent', label: 'Recent Runs', icon: Activity }
] as Array<{ href: Route; label: string; icon: React.ComponentType<{ size?: number }> }>;

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const mobileOpen = open && !!onClose;

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 shrink-0 border-r border-gray-100 bg-white p-4 transition-transform duration-200 md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 md:transition-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-brand-700">FlowForge</h1>
            <p className="text-xs text-gray-500">Workflow automation platform</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 md:hidden"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
