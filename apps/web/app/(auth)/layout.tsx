import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-border px-4 sm:px-6 h-14 flex items-center">
        <Link href="/" className="font-display text-2xl tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          DEMOCRATIA
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="border-t border-border px-4 sm:px-6 h-12 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          By using DemocratIA you agree to our{' '}
          <Link href="/legal/terms" className="underline hover:text-foreground">Terms</Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </footer>
    </div>
  );
}
