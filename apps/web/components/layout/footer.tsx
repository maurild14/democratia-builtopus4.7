import Link from 'next/link';
import { Github } from 'lucide-react';

const LINKS = {
  Product: [
    { label: 'How it works', href: '/#pipeline' },
    { label: 'Civic Radar', href: '/#radar' },
    { label: 'Open Data', href: '/api/public/v1' },
  ],
  Project: [
    { label: 'GitHub', href: 'https://github.com/democratia-platform/democratia' },
    { label: 'Contributing', href: '/contributing' },
    { label: 'Code of Conduct', href: '/code-of-conduct' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'License (AGPL-3.0)', href: '/legal/license' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="font-display text-3xl tracking-wider">DEMOCRATIA</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              An open-source deliberative democracy platform for civic discourse.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com/democratia-platform/democratia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                aria-label="GitHub repository"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-foreground mb-3">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} DemocratIA Contributors. Licensed under AGPL-3.0.</p>
          <p>Pilot cities: Buenos Aires (CABA) &amp; San Francisco</p>
        </div>
      </div>
    </footer>
  );
}
