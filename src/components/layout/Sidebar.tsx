'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutGrid, PlayCircle, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/workflows', label: 'Workflows', icon: Workflow },
  { href: '/workflows/new', label: 'New Workflow', icon: PlayCircle },
  { href: '/runs/recent', label: 'Recent Runs', icon: Activity }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-60 shrink-0 border-r border-gray-100 bg-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-brand-700">FlowForge</h1>
        <p className="text-xs text-gray-500">Workflow automation platform</p>
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
  );
}
