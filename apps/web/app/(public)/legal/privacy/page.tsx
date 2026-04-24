import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-4xl font-bold font-display">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: April 2026 · Pilot cities: Buenos Aires, Argentina & San Francisco, CA, USA</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-xl font-bold mb-3">1. What we collect</h2>
          <p className="leading-relaxed text-muted-foreground">We collect: your email address (for authentication), pseudonym (your public identity), phone number (optional, for SMS verification), geographic zone (for residency weighting), and all content you create on the platform (threads, comments, votes). We also collect standard server logs (IP addresses, timestamps) for security and abuse prevention.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. How we use your data</h2>
          <p className="leading-relaxed text-muted-foreground">Your email is used only for authentication and notifications. Your pseudonym is your public identity on the platform. Your geographic zone determines which forums you have full voting weight in. Your content is used to generate AI-assisted deliberative summaries and public reports. We do not sell your data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Public data and open reports</h2>
          <p className="leading-relaxed text-muted-foreground">Deliberative reports are published as open data under Creative Commons Attribution 4.0. These reports are k-anonymized: individual votes and positions are never published in ways that could be linked to a specific user. Pseudonyms in published reports are replaced with anonymous identifiers.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. AI processing</h2>
          <p className="leading-relaxed text-muted-foreground">We use Anthropic Claude to process thread content for statement extraction, moderation classification, and report generation. Content sent to Claude is processed under Anthropic&apos;s privacy policies. We use prompt caching and do not use your content to train AI models.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Data storage</h2>
          <p className="leading-relaxed text-muted-foreground">Your data is stored on Supabase (PostgreSQL), hosted on AWS infrastructure. For the pilot program, data for Buenos Aires users is stored in the US-East region. We use industry-standard encryption in transit (TLS) and at rest.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Your rights</h2>
          <p className="leading-relaxed text-muted-foreground">You have the right to: access all personal data we hold about you; correct inaccurate data; delete your account and personal data; export your data in JSON format; and object to certain processing. Contact us at privacy@democratia.app to exercise these rights.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Cookies</h2>
          <p className="leading-relaxed text-muted-foreground">We use strictly necessary cookies for authentication (Supabase session tokens). We do not use tracking or advertising cookies. You cannot opt out of authentication cookies and still use the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Contact</h2>
          <p className="leading-relaxed text-muted-foreground">For privacy-related inquiries, contact: <a href="mailto:privacy@democratia.app" className="underline hover:no-underline">privacy@democratia.app</a>. For the Argentine pilot, our data controller is registered in Buenos Aires, Argentina.</p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <Link href="/legal/terms" className="text-sm underline hover:no-underline mr-6">Terms of Service</Link>
        <Link href="/login" className="text-sm underline hover:no-underline">Back to login</Link>
      </div>
    </div>
  );
}
