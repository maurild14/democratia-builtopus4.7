'use client';

import Link from 'next/link';
import { Bell, Shield, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavbarProps {
  user?: { pseudonym: string; role: string } | null;
  unreadCount?: number;
}

export function AppNavbar({ user, unreadCount = 0 }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="font-display text-2xl tracking-wider">DEMOCRATIA</span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {/* Notifications */}
            <Link href="/notifications" className="relative p-2 rounded-full hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Notifications${unreadCount > 0 ? `, ${Math.min(unreadCount, 99)} unread` : ''}`}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[9px] font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Moderation shield */}
            {(user.role === 'moderator' || user.role === 'admin') && (
              <Link href="/moderation" className="p-2 rounded-full hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Moderation panel">
                <Shield className="h-5 w-5" />
              </Link>
            )}

            {/* Profile */}
            <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:block">{user.pseudonym}</span>
            </Link>
          </nav>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild><Link href="/login">Log in</Link></Button>
            <Button size="sm" asChild><Link href="/register">Sign up</Link></Button>
          </div>
        )}
      </div>
    </header>
  );
}

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
        <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="font-display text-2xl tracking-wider">DEMOCRATIA</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2" aria-label="Public navigation">
          <Button variant="ghost" size="sm" asChild><Link href="/login">Log in</Link></Button>
          <Button size="sm" asChild><Link href="/register">Sign up</Link></Button>
        </nav>

        {/* Mobile */}
        <button
          className="sm:hidden p-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className={cn('sm:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-2')}>
          <Button variant="outline" size="sm" asChild className="w-full"><Link href="/login" onClick={() => setMobileOpen(false)}>Log in</Link></Button>
          <Button size="sm" asChild className="w-full"><Link href="/register" onClick={() => setMobileOpen(false)}>Sign up</Link></Button>
        </div>
      )}
    </header>
  );
}
