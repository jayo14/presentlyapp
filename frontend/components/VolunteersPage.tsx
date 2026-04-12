import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Code,
  Smartphone, PenTool, Share2,
  Send, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Input } from './Input';
import { LandingHeader } from './LandingHeader';
import { SEO } from './SEO';

const roles = [
  { id: 'backend', title: 'Backend Developer', icon: Code, desc: 'Scaling our Python/Django infrastructure and API security.' },
  { id: 'mobile', title: 'Mobile Developer', icon: Smartphone, desc: 'Building cross-platform experiences with React Native & Expo.' },
  { id: 'design', title: 'UI/UX Designer', icon: PenTool, desc: 'Crafting intuitive and beautiful academic interfaces.' },
  { id: 'social', title: 'Social Media Creator', icon: Share2, desc: 'Building our brand presence across academic communities.' }
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}][\p{L}\s'-]{1,79}$/u;
const MIN_REASON_LENGTH = 25;
const MAX_REASON_LENGTH = 600;

type FormData = {
  name: string;
  email: string;
  portfolio: string;
  reason: string;
};

type FormErrors = Partial<Record<keyof FormData | 'role', string>>;

const sanitizeName = (value: string) =>
  value.replace(/[^\p{L}\s'-]/gu, '').replace(/\s{2,}/g, ' ').slice(0, 80);

const sanitizeEmail = (value: string) =>
  value.replace(/\s+/g, '').replace(/[<>]/g, '').slice(0, 120);

const sanitizePortfolio = (value: string) =>
  value.replace(/[<>]/g, '').trim().slice(0, 160);

const sanitizeReason = (value: string) =>
  value.replace(/[<>]/g, '').replace(/\s{3,}/g, '  ').slice(0, MAX_REASON_LENGTH);

const normalizePortfolioUrl = (value: string) =>
  !value || /^https?:\/\//i.test(value) ? value : `https://${value}`;

const isValidPortfolioUrl = (value: string) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const VolunteersPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    portfolio: '',
    reason: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (data: FormData, role: string): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!role) nextErrors.role = 'Select a role to continue.';
    if (!data.name.trim()) nextErrors.name = 'Full name is required.';
    else if (!NAME_REGEX.test(data.name.trim())) nextErrors.name = 'Use 2-80 letters only.';

    if (!data.email.trim()) nextErrors.email = 'Email address is required.';
    else if (!EMAIL_REGEX.test(data.email.trim())) nextErrors.email = 'Enter a valid email address.';

    if (data.portfolio && !isValidPortfolioUrl(normalizePortfolioUrl(data.portfolio))) {
      nextErrors.portfolio = 'Enter a valid portfolio URL.';
    }

    if (!data.reason.trim()) nextErrors.reason = 'Tell us why you want to join.';
    else if (data.reason.trim().length < MIN_REASON_LENGTH) {
      nextErrors.reason = `Please add at least ${MIN_REASON_LENGTH} characters.`;
    }

    return nextErrors;
  };

  const updateFormField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setErrors((prev) => {
      if (!prev.role) return prev;
      const { role: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedData: FormData = {
      name: sanitizeName(formData.name).trim(),
      email: sanitizeEmail(formData.email).toLowerCase(),
      portfolio: normalizePortfolioUrl(sanitizePortfolio(formData.portfolio)),
      reason: sanitizeReason(formData.reason).trim()
    };

    setFormData(normalizedData);
    const validationErrors = validate(normalizedData, selectedRole);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-primary/20 text-white rounded-full flex items-center justify-center mx-auto mb-8">
            <Check size={40} />
          </div>
          <h2 className="font-headline text-3xl font-bold text-text">Application Received!</h2>
          <p className="text-textMuted">
            Thank you for your interest in joining Presently. Our team will review your profile and reach out within 3-5 business days.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-textMuted font-sans selection:bg-primary selection:text-on-primary-fixed overflow-x-hidden">
      {/* SEO: Page metadata for volunteer route. */}
      <SEO
        title="Volunteers"
        description="Join Presently as a volunteer and help build GPS-verified attendance infrastructure for Nigerian universities."
        canonicalPath="/volunteers"
      />
      <LandingHeader />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-start">
        {/* Left Side: Content */}
        <div className="space-y-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6"
            >
              <Users size={16} />
              <span>Join the Movement</span>
            </motion.div>
            <h1 className="font-headline text-5xl md:text-primaryxl font-bold tracking-tight text-text mb-8 leading-[1.1]">
              Build the future of <br />
              <span className="text-primary">Academic Integrity.</span>
            </h1>
            <p className="text-xl text-textMuted leading-relaxed max-w-xl">
              We're a team of passionate engineers and designers rebuilding how universities manage attendance and records. Join us as a volunteer and make a real impact.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((role) => (
              <button
                type="button"
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                aria-pressed={selectedRole === role.id}
                className={`relative text-left p-6 rounded-2xl border transition-all cursor-pointer ${selectedRole === role.id
                  ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(184,134,11,0.2)] -translate-y-1'
                  : 'bg-surfaceLow border-outline hover:border-primary/20 hover:-translate-y-1'
                  }`}
              >
                <div
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${selectedRole === role.id
                    ? 'bg-primary border-primary text-white'
                    : 'border-outline text-transparent'
                    }`}
                  aria-hidden="true"
                >
                  <Check size={14} />
                </div>
                <role.icon className={`mb-4 ${selectedRole === role.id ? 'text-primary' : 'text-textMuted'}`} size={28} />
                <h3 className="font-headline font-bold text-text mb-2">{role.title}</h3>
                <p className="text-sm text-textMuted">{role.desc}</p>
              </button>
            ))}
          </div>
          {errors.role && <p className="text-sm text-error">{errors.role}</p>}
        </div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface/50 border border-outline p-8 md:p-12 rounded-[32px] sticky top-32"
        >
          <h2 className="font-headline text-2xl font-bold mb-8">Volunteer Application</h2>
          <p className="text-sm text-textMuted mb-6">
            Selected role:{' '}
            <span className="font-semibold text-text">
              {roles.find((role) => role.id === selectedRole)?.title || 'None'}
            </span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Full Name</label>
                <Input
                  placeholder="John Doe"
                  required
                  maxLength={80}
                  value={formData.name}
                  onChange={(e) => updateFormField('name', sanitizeName(e.target.value))}
                  error={errors.name}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Email Address</label>
                <Input
                  type="email"
                  placeholder="john@university.edu"
                  required
                  maxLength={120}
                  value={formData.email}
                  onChange={(e) => updateFormField('email', sanitizeEmail(e.target.value))}
                  error={errors.email}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-textMuted">Portfolio / LinkedIn / GitHub</label>
              <Input
                placeholder="https://portfolio.com/your-profile"
                maxLength={160}
                value={formData.portfolio}
                onChange={(e) => updateFormField('portfolio', sanitizePortfolio(e.target.value))}
                error={errors.portfolio}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-textMuted">Why do you want to join?</label>
              <textarea
                className={`w-full bg-surface border rounded-xl p-4 text-text focus:outline-none focus:ring-2 min-h-[120px] resize-none ${errors.reason
                  ? 'border-error focus:ring-error/30'
                  : 'border-outline focus:ring-primary/50'
                  }`}
                placeholder="Tell us a bit about yourself and your motivation..."
                required
                maxLength={MAX_REASON_LENGTH}
                aria-invalid={Boolean(errors.reason)}
                value={formData.reason}
                onChange={(e) => updateFormField('reason', sanitizeReason(e.target.value))}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={errors.reason ? 'text-error' : 'text-textMuted'}>
                  {errors.reason || `Minimum ${MIN_REASON_LENGTH} characters.`}
                </span>
                <span className="text-textMuted">{formData.reason.trim().length}/{MAX_REASON_LENGTH}</span>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-lg">
              <Send size={18} className="mr-2" /> Submit Application
            </Button>

            {!selectedRole && (
              <p className="text-xs text-center text-textMuted italic">
                Please select a role from the left to enable submission.
              </p>
            )}
          </form>
        </motion.div>
      </main>
    </div>
  );
};
