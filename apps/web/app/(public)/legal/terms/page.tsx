import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Legal</p>
        <h1 className="text-4xl font-bold font-display">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: April 2026 · AGPL-3.0 Licensed Platform</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
          <p className="leading-relaxed text-muted-foreground">By accessing or using DemocratIA, you agree to be bound by these Terms of Service and our Privacy Policy. DemocratIA is an open-source platform licensed under AGPL-3.0. If you do not agree to these terms, do not use the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Platform Purpose</h2>
          <p className="leading-relaxed text-muted-foreground">DemocratIA facilitates structured civic deliberation in geographically organized forums. Citizens discuss public policy issues, vote on positions, and collectively generate proposals that are made available as open data to governments, civil society, and the public.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. User Accounts</h2>
          <p className="leading-relaxed text-muted-foreground">You must register with a valid email address and a pseudonym. You are responsible for maintaining the confidentiality of your account credentials. Pseudonyms may be changed every 15 days. You must accurately represent your geographic location for residency weighting to function correctly.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Acceptable Use</h2>
          <p className="leading-relaxed text-muted-foreground">You agree not to: post content that is off-topic, harassing, or factually misleading; attempt to manipulate the deliberation process; use automated systems to generate or vote on content; or violate any applicable laws. DemocratIA uses AI-based moderation to flag off-topic content.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Content License</h2>
          <p className="leading-relaxed text-muted-foreground">By posting content on DemocratIA, you grant the platform a worldwide, royalty-free license to store, display, and distribute that content as part of our open-data public reporting mission. Deliberative reports are published under a Creative Commons Attribution 4.0 license.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Open Source</h2>
          <p className="leading-relaxed text-muted-foreground">The DemocratIA platform is free and open-source software licensed under AGPL-3.0. The source code is available on GitHub. You may fork and run your own instance subject to the terms of the AGPL-3.0 license.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Limitation of Liability</h2>
          <p className="leading-relaxed text-muted-foreground">DemocratIA is provided "as is" without warranty of any kind. We are not liable for any decisions made by governments or civil society organizations based on the outputs of the platform. The platform is a tool for citizen expression, not a binding political mechanism.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Account Deletion</h2>
          <p className="leading-relaxed text-muted-foreground">You may delete your account at any time from your profile settings. Your personal data will be removed within 30 days. Content you contributed (comments, votes, thread posts) will be anonymized but retained as part of the deliberative record.</p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <Link href="/legal/privacy" className="text-sm underline hover:no-underline mr-6">Privacy Policy</Link>
        <Link href="/login" className="text-sm underline hover:no-underline">Back to login</Link>
      </div>
    </div>
  );
}
