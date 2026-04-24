'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ChevronDown } from 'lucide-react';
import { createClientSupabase } from '@democratia/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GeoSelector } from '@/components/geo-selector';

interface FormState {
  pseudonym: string;
  email: string;
  password: string;
  phone: string;
  primaryZoneId: string;
  primaryZoneName: string;
  agreed: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    pseudonym: '', email: '', password: '', phone: '', primaryZoneId: '', primaryZoneName: '', agreed: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState & { general: string }>>({});

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (form.pseudonym.length < 3) newErrors.pseudonym = 'Pseudonym must be at least 3 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(form.pseudonym)) newErrors.pseudonym = 'Only letters, numbers and underscores.';
    if (!form.email.includes('@')) newErrors.email = 'Enter a valid email address.';
    if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (!form.primaryZoneId) newErrors.primaryZoneName = 'Please select your neighborhood.';
    if (!form.agreed) newErrors.general = 'You must agree to the Terms and Privacy Policy.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const supabase = createClientSupabase();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { pseudonym: form.pseudonym, primary_zone_id: form.primaryZoneId, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrors({ general: error.message });
      setLoading(false);
      return;
    }

    router.push('/verify?type=email');
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join your community&apos;s deliberative forum.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Pseudonym */}
        <div className="space-y-1.5">
          <Label htmlFor="pseudonym">Pseudonym <span aria-hidden className="text-destructive">*</span></Label>
          <Input
            id="pseudonym"
            type="text"
            autoComplete="username"
            value={form.pseudonym}
            onChange={(e) => setField('pseudonym', e.target.value)}
            placeholder="your_name"
            aria-describedby={errors.pseudonym ? 'pseudo-err' : undefined}
            aria-required
          />
          <p className="text-xs text-muted-foreground">This is your public identity. You can change it every 15 days.</p>
          {errors.pseudonym && <p id="pseudo-err" role="alert" className="text-xs text-destructive">{errors.pseudonym}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email <span aria-hidden className="text-destructive">*</span></Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="your@email.com"
            aria-required
          />
          {errors.email && <p role="alert" className="text-xs text-destructive">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password <span aria-hidden className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              className="pr-10"
              aria-required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
          {errors.password && <p role="alert" className="text-xs text-destructive">{errors.password}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="+1 415 555 0100"
          />
          <p className="text-xs text-muted-foreground">Required for SMS verification to participate in forums.</p>
        </div>

        {/* Geo selector */}
        <div className="space-y-1.5">
          <Label>Primary neighborhood <span aria-hidden className="text-destructive">*</span></Label>
          <GeoSelector
            value={form.primaryZoneId}
            onChange={(id, name) => { setField('primaryZoneId', id); setField('primaryZoneName', name); }}
          />
          <p className="text-xs text-muted-foreground">Your neighborhood determines where your voice has full weight.</p>
          {errors.primaryZoneName && <p role="alert" className="text-xs text-destructive">{errors.primaryZoneName}</p>}
        </div>

        {/* Agreement */}
        <div className="flex items-start gap-3">
          <input
            id="agree"
            type="checkbox"
            checked={form.agreed}
            onChange={(e) => setField('agreed', e.target.checked)}
            className="mt-0.5 h-4 w-4 border border-border rounded-sm cursor-pointer"
            aria-required
          />
          <Label htmlFor="agree" className="text-sm font-normal cursor-pointer leading-relaxed">
            I agree to the{' '}
            <Link href="/legal/terms" className="underline hover:no-underline" target="_blank">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="underline hover:no-underline" target="_blank">Privacy Policy</Link>.
          </Label>
        </div>

        {errors.general && <p role="alert" className="text-sm text-destructive">{errors.general}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-foreground underline hover:no-underline">Log in</Link>
      </p>
    </div>
  );
}
