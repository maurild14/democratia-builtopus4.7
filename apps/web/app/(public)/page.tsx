import Link from 'next/link';
import {
  Scale, Fingerprint, MessageSquare, Radio, BarChart3, FileText,
  ArrowRight, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PublicNavbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <PublicNavbar />

      {/* ── HERO ───────────────────────────────────────────── */}
      {/*
        Layout strategy: SVG in normal flow so the section matches the illustration's
        exact aspect ratio (1672×933). Content is absolutely positioned in the open
        parabolic arch at the top-center of the crowd — the crowd is dense on the left
        edge near the top and curves away, leaving the center zone clear.
      */}
      <section className="relative overflow-hidden bg-white border-b border-border">
        {/* Crowd illustration — full width, natural height, no cropping or gradient */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/capitol.svg"
          alt=""
          aria-hidden
          draggable={false}
          className="w-full h-auto block pointer-events-none select-none"
        />

        {/* Content — pinned inside the parabolic open zone (top ~27% of section) */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start text-center px-6 pt-[4%]">
          <h1 className="font-display text-[clamp(2rem,10.5vw,7.5rem)] leading-none tracking-wider text-foreground select-none">
            DEMOCRATIA
          </h1>

          {/* Editorial rule */}
          <div className="flex items-center w-full max-w-3xl mt-2 gap-3" aria-hidden>
            <div className="flex-1 h-px bg-foreground/20" />
            <div className="flex-1 h-px bg-foreground/20" />
          </div>

          <p className="mt-2 max-w-[260px] sm:max-w-xs text-xs sm:text-sm text-muted-foreground leading-snug">
            Structured deliberation for the modern citizen. No algorithmic feeds — only rigorous civic discourse.
          </p>

          {/* Centered symmetrical CTAs */}
          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-4 sm:gap-6">
            <Button size="lg" className="rounded-full px-7 sm:px-8" asChild>
              <Link href="/register">Sign up</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-7 sm:px-8" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#problem"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Scroll to learn more"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Learn more</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </a>
      </section>

      {/* ── PLATFORM PULSE ─────────────────────────────────── */}
      <section id="pulse" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '127', label: 'Active communities' },
            { value: '3,841', label: 'Citizens deliberating' },
            { value: '48', label: 'Completed processes' },
            { value: '2', label: 'Pilot cities' },
          ].map((stat) => (
            <Card key={stat.label} className="card-editorial p-6 text-center">
              <p className="font-display text-4xl md:text-5xl">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase font-medium">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── THE PROBLEM / CIVIC SCOPE ──────────────────────── */}
      <section id="problem" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Problem card */}
          <Card className="card-editorial p-8 relative overflow-hidden">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-6 w-6 items-center justify-center border border-foreground">
                <span className="text-xs font-bold">✕</span>
              </div>
              <h2 className="text-2xl font-bold leading-tight">The Problem: Polarized Discourse</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Modern digital spaces incentivize outrage over understanding. The structural architecture of traditional platforms fragments communities, amplifies extremes, and leaves citizens without a constructive mechanism to deliberate complex issues between election cycles.
            </p>
            <div className="mt-6 h-0.5 w-12 bg-foreground" aria-hidden />
          </Card>

          {/* Civic scope card */}
          <Card className="card-editorial p-8">
            <h2 className="text-2xl font-bold mb-6">Civic Scope</h2>
            <div className="flex flex-wrap gap-2">
              {['NEIGHBORHOOD', 'MUNICIPALITY', 'PROVINCE', 'NATIONAL'].map((level) => (
                <span key={level} className="badge-pill">{level}</span>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Forums are organized by geography — from your block to the country level. Your voice carries full weight in your neighborhood and travels up the hierarchy as consensus forms.
            </p>
          </Card>
        </div>

        {/* What is DemocratIA — inverted section */}
        <div className="mt-6 section-inverted p-8 sm:p-12 bg-dot-pattern relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
                What is<br />DemocratIA?
              </h2>
              <p className="text-zinc-300 leading-relaxed text-sm sm:text-base mb-6">
                A digital broadsheet for the modern citizen. We provide the structural scaffolding for rigorous, human-centered deliberation. By replacing algorithmic feeds with structured debate formats, we return agency to the participants.
              </p>
              <Link
                href="/#pipeline"
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-white border-b border-white/50 hover:border-white transition-colors pb-0.5"
              >
                Explore the methodology <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Scale, title: 'Structured Debate', desc: 'Format matters. Arguments are mapped, not yelled.' },
                { icon: Fingerprint, title: 'Verified Identity', desc: 'Accountability through one-person, one-voice systems.' },
                { icon: MessageSquare, title: 'Layer Deliberation', desc: 'Free conversation rises into structured consensus.' },
                { icon: FileText, title: 'Public Reports', desc: 'Outcomes feed back to governments and civil society.' },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="bg-white/10 border-white/20 p-4">
                  <Icon className="h-5 w-5 text-white mb-3" />
                  <h3 className="text-white text-sm font-semibold mb-1">{title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PIPELINE ───────────────────────────────────── */}
      <section id="pipeline" className="py-16 px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">The Pipeline</h2>
          <p className="mt-3 text-muted-foreground">A 5-layer deliberation process transforming free conversation into actionable consensus.</p>
        </div>

        <div className="flex flex-col gap-0">
          {[
            {
              n: 1,
              title: 'Free Conversation',
              desc: 'Community-driven, open discussion forums. Ideas flow organically and are organized by geographic relevance, moving beyond standard upvote systems to nuanced agree/disagree metrics.',
              inverted: false,
            },
            {
              n: 2,
              title: 'Statement Extraction',
              desc: 'AI synthesizes key positions from threads into neutral, votable statements. Participants vote individually on these positions rather than engaging in direct replies.',
              inverted: false,
            },
            {
              n: 3,
              title: 'Automated Clustering',
              desc: 'Algorithms identify opinion clusters, mapping out clear consensus points and divisive statements across different participant groups, replacing noise with structured data.',
              inverted: false,
            },
            {
              n: 4,
              title: 'Consensus Synthesis',
              desc: 'Generation of inclusive consensus statements that represent shared agreements while explicitly acknowledging minority positions and objections.',
              inverted: false,
            },
            {
              n: 5,
              title: 'Action & Proposals',
              desc: 'Formal reports and open datasets are generated and delivered to accountable public officials, converting digital consensus into institutional pressure.',
              inverted: true,
            },
          ].map((step, idx) => (
            <div key={step.n} className="flex flex-col items-center">
              <Card className={`card-editorial w-full p-6 sm:p-8 ${step.inverted ? 'bg-foreground text-background border-foreground' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step.inverted ? 'bg-background text-foreground' : 'bg-foreground text-background'}`}>
                    {step.n}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className={`text-sm leading-relaxed ${step.inverted ? 'text-zinc-300' : 'text-muted-foreground'}`}>{step.desc}</p>
                  </div>
                </div>
              </Card>
              {idx < 4 && (
                <div className="flex flex-col items-center py-1" aria-hidden>
                  <div className="w-[2px] h-2 bg-border" />
                  <div className="text-border text-xs leading-none">⋮</div>
                  <div className="w-[2px] h-2 bg-border" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CIVIC RADAR PREVIEW ────────────────────────────── */}
      <section id="radar" className="py-16 px-4 sm:px-6 border-t border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold">Civic Radar</h2>
            <p className="mt-2 text-muted-foreground">A transparent view into legislative actions and public execution, simplified by AI for informed citizen debate.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Legislative Updates */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Legislative Updates</h3>
                <Badge variant="inverted">Live Feed</Badge>
              </div>
              <Card className="card-editorial p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <Badge variant="outline" className="text-[10px]">DECREE #4092</Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Today, 09:30 AM</span>
                </div>
                <h4 className="font-bold text-base mb-3">Urban Mobility Infrastructure Expansion Act</h4>
                <div className="border border-border p-3 mb-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground text-[10px] uppercase tracking-widest block mb-1">Summary by AI</strong>
                    This decree allocates an additional $50M to expand bike lanes and pedestrian zones... It aims to reduce traffic congestion and promote eco-friendly transport.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <Link href="/register">
                    <Radio className="h-3.5 w-3.5" />
                    Open Debate
                  </Link>
                </Button>
              </Card>
            </div>

            {/* Transparency sidebar */}
            <div>
              <h3 className="font-semibold mb-4">Transparency</h3>
              <Card className="card-editorial p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Annual Budget Execution</p>
                <p className="font-display text-5xl mb-1">64%</p>
                <p className="text-xs text-muted-foreground mb-4">of allocated funds used — Q3 Target</p>
                <div className="w-full bg-muted h-2">
                  <div className="bg-foreground h-2 transition-all" style={{ width: '64%' }} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE PRINCIPLES ────────────────────────────────── */}
      <section id="principles" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Core Principles</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Scale,
              title: 'Deliberation over Debate',
              desc: 'The goal is not to win an argument, but to find areas of agreement and honestly map disagreements without gamified hostility.',
            },
            {
              icon: BarChart3,
              title: 'Informed Citizens',
              desc: 'We provide accessible, synthesized government information. Meaningful deliberation requires access to clear facts.',
            },
            {
              icon: FileText,
              title: 'Radical Transparency',
              desc: 'Everything produced — reports, open datasets, algorithms — is public. Institutional accountability tracked visibly.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="card-editorial p-8 text-center flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center border-2 border-foreground mb-5">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section id="faq" className="py-16 px-4 sm:px-6 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left font-medium">{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="section-inverted py-20 px-4 sm:px-6 text-center bg-dot-pattern">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-5xl sm:text-7xl tracking-wider mb-6">JOIN NOW</h2>
          <p className="text-zinc-300 mb-8 leading-relaxed">
            Be part of the first wave of citizens building a better model for civic discourse. Free, open source, and yours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black" asChild>
              <Link href="/register">Create an account</Link>
            </Button>
            <Button size="lg" className="bg-white text-black hover:bg-zinc-100" asChild>
              <Link href="https://github.com/democratia-platform/democratia" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const FAQ_ITEMS = [
  { q: 'Is DemocratIA free to use?', a: 'Yes — DemocratIA is free and open source (AGPL-3.0). There are no subscription fees, no paywalls, and no ads.' },
  { q: 'Who can participate in forums?', a: 'Any verified citizen can participate. You need a verified phone number and email address, and to declare your primary neighborhood. Participation is weighted by geographic proximity to the forum.' },
  { q: 'How does geographic verification work?', a: 'We use your declared address and cross-reference it with your IP geolocation as a non-blocking consistency check. Your primary neighborhood determines where your voice has full weight (1.0x). You can also join up to 2 secondary neighborhoods at reduced weight.' },
  { q: 'How does the AI remain neutral?', a: 'Our prompts are designed to never editorialize, invent positions, or erase minority voices. The AI extracts and synthesizes — it never decides. All prompts are public in our GitHub repository.' },
  { q: 'What happens to deliberation results?', a: 'Layer 5 produces formal public reports and open datasets distributed to relevant government bodies, civil society organizations, and the public. All data is k-anonymized (k≥20) before export.' },
  { q: 'Can I remain anonymous?', a: 'You use a pseudonym by default. Your real identity is never displayed publicly. However, phone and email verification are required for participation to enforce the one-person-one-voice rule.' },
  { q: 'How is off-topic moderation handled?', a: 'An AI classifier flags potentially off-topic content with a confidence score. Flagged content is reviewable by moderators and always appealable by the author. The classifier is designed to be permissive — political controversy is not off-topic.' },
  { q: 'How can I contribute to the project?', a: 'Check our GitHub repository for open issues labeled "good first issue". We welcome contributions to the UI, prompts, algorithms, documentation, and translations.' },
  { q: 'What cities are supported?', a: 'The v1 pilot targets Buenos Aires (CABA, Argentina) and San Francisco (California, USA). More cities will be added by community contributors adding a single source file to the geo package.' },
  { q: 'What is the deliberation pipeline?', a: 'It is a 5-layer process: free conversation → AI statement extraction → algorithmic clustering → Habermas-style synthesis → formal proposals and reports. A thread elevates through the pipeline once it reaches engagement thresholds.' },
];
