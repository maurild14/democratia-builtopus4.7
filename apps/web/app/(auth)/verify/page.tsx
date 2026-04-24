'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, Suspense } from 'react';
import { Loader2, Mail, Phone } from 'lucide-react';
import { createClientSupabase } from '@democratia/auth/client';
import { Button } from '@/components/ui/button';

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const type = params.get('type') ?? 'email';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  function handleDigit(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  async function handleVerify() {
    const token = digits.join('');
    if (token.length !== 6) { setError('Please enter the 6-digit code.'); return; }
    setLoading(true);
    setError(null);

    if (type === 'phone') {
      const phone = sessionStorage.getItem('pending_phone') ?? '';
      const supabase = createClientSupabase();
      const { error: verifyError } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (verifyError) { setError(verifyError.message); setLoading(false); return; }
    }

    router.push('/onboarding');
  }

  async function resend() {
    setResent(true);
    setTimeout(() => setResent(false), 30000);
    // In production: trigger resend via API
  }

  const Icon = type === 'phone' ? Phone : Mail;
  const label = type === 'phone' ? 'phone number' : 'email address';

  return (
    <div className="w-full max-w-sm text-center">
      <div className="flex justify-center mb-6">
        <div className="flex h-14 w-14 items-center justify-center border-2 border-foreground">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">Verify your {type}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        We sent a 6-digit code to your {label}. Enter it below.
      </p>

      {/* OTP Input */}
      <div className="flex justify-center gap-2 mb-6" role="group" aria-label="6-digit verification code">
        {digits.map((d, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleDigit(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="h-14 w-11 border border-border bg-background text-center text-xl font-bold focus:border-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            aria-label={`Digit ${idx + 1}`}
          />
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-destructive mb-4">{error}</p>}

      <Button onClick={handleVerify} className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Verify
      </Button>

      <button
        onClick={resend}
        disabled={resent}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground underline disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {resent ? 'Code resent — check your inbox' : "Didn't receive it? Resend"}
      </button>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
