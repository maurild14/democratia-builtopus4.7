'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, MessageSquare, Vote, Radio,
  FileText, User, CheckCircle, Globe, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    icon: CheckCircle,
    title: 'Welcome to DemocratIA',
    body: 'You\'re joining a platform built for rigorous civic deliberation. No algorithms. No outrage. Just structured, meaningful discussion.',
  },
  {
    icon: LayoutDashboard,
    title: 'Your Dashboard',
    body: 'After logging in, your dashboard shows all your forums — organized from neighborhood to country level. It\'s your civic home base.',
  },
  {
    icon: Map,
    title: 'Your Forums',
    body: 'You automatically belong to forums at every geographic level above your neighborhood: city, province, and country forums are always accessible.',
  },
  {
    icon: Globe,
    title: 'Geographic Structure',
    body: 'Forums are organized geographically. Neighborhood → Municipality → Province → Country. Your voice carries more weight closer to home (1.0x → 0.75x → 0.50x).',
  },
  {
    icon: MessageSquare,
    title: 'Forum Explorer',
    body: 'The Explorer lets you search any forum worldwide, browse hierarchically, and see a live map of global civic activity.',
  },
  {
    icon: Layers,
    title: 'Inside a Forum',
    body: 'Every forum has three sections: Discussion Threads, Civic Radar (local legislative updates), and Reports (deliberation outputs).',
  },
  {
    icon: MessageSquare,
    title: 'Threads and Discussion',
    body: 'Start a thread, write a post, and vote Agree / Disagree / Pass on others\' contributions. Threads are ordered by heat score — engagement balanced with recency.',
  },
  {
    icon: Vote,
    title: 'The Deliberation Pipeline',
    body: 'When a thread gains enough engagement, it enters the 5-layer pipeline: Free discussion → Statement extraction → Opinion clustering → Synthesis → Formal proposals.',
  },
  {
    icon: Radio,
    title: 'Civic Radar',
    body: 'The Radar surfaces local legislative updates — bills, decrees, budgets — with AI-generated summaries. You can open any item to debate.',
  },
  {
    icon: FileText,
    title: 'Reports',
    body: 'Completed deliberations produce public reports and open datasets delivered to relevant government bodies. Your participation creates institutional pressure.',
  },
  {
    icon: User,
    title: 'Your Identity',
    body: 'You\'re identified by a pseudonym. Phone and email verification enforce one-person-one-voice. Your real identity is never displayed publicly.',
  },
  {
    icon: CheckCircle,
    title: 'You\'re ready!',
    body: 'Head to your dashboard to join your neighborhood forum. Your voice matters — use it.',
    isFinal: true,
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else router.push('/dashboard');
  }

  function skip() { router.push('/dashboard'); }

  const current = STEPS[step];
  const Icon = current.icon;
  const isFinal = 'isFinal' in current && current.isFinal;

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6">
      {/* Skip */}
      {!isFinal && (
        <button
          onClick={skip}
          className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Skip
        </button>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="flex h-20 w-20 items-center justify-center border-2 border-foreground">
              <Icon className="h-9 w-9" aria-hidden />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-4">{current.title}</h1>
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{current.body}</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-1.5 mt-12 mb-8" role="progressbar" aria-valuenow={step + 1} aria-valuemax={STEPS.length} aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`h-1.5 rounded-full transition-all duration-200 ${i === step ? 'w-6 bg-foreground' : 'w-1.5 bg-border hover:bg-muted-foreground'}`}
            aria-label={`Go to step ${i + 1}`}
            aria-current={i === step ? 'step' : undefined}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        <Button onClick={next}>
          {isFinal ? 'Go to dashboard' : step === 0 ? 'Get started' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
