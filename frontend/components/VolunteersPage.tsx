import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Code, Layout as LayoutIcon,
  Smartphone, PenTool, Share2,
  Send, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Logo } from './Logo';
import { Input } from './Input';
import { LandingHeader } from './LandingHeader';

const roles = [
  { id: 'backend', title: 'Backend Developer', icon: Code, desc: 'Scaling our Python/Django infrastructure and API security.' },
  { id: 'mobile', title: 'Mobile Developer', icon: Smartphone, desc: 'Building cross-platform experiences with React Native & Expo.' },
  { id: 'design', title: 'UI/UX Designer', icon: PenTool, desc: 'Crafting intuitive and beautiful academic interfaces.' },
  { id: 'social', title: 'Social Media Creator', icon: Share2, desc: 'Building our brand presence across academic communities.' }
];

export const VolunteersPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    portfolio: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cardackgroundlack flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} />
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
    <div className="min-h-screen bg-cardackgroundlack text-textMuted font-sans selection:bg-primary selection:text-on-primary-fixedlack overflow-x-hidden">
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
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedRole === role.id
                    ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(184,134,11,0.2)]'
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <role.icon className={`mb-4 ${selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'}`} size={28} />
                <h3 className="font-headline font-bold text-text mb-2">{role.title}</h3>
                <p className="text-sm text-textMuted">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface/50 border border-outline p-8 md:p-12 rounded-[32px] sticky top-32"
        >
          <h2 className="font-headline text-2xl font-bold mb-8">Volunteer Application</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Full Name</label>
                <Input
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Email Address</label>
                <Input
                  type="email"
                  placeholder="john@university.edu"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-textMuted">Portfolio / LinkedIn / GitHub</label>
              <Input
                placeholder="https://..."
                value={formData.portfolio}
                onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-textMuted">Why do you want to join?</label>
              <textarea
                className="w-full bg-cardackgroundlack border border-outline rounded-xl p-4 text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-none"
                placeholder="Tell us a bit about yourself and your motivation..."
                required
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>

            <Button type="submit" className="w-full h-14 text-lg" disabled={!selectedRole}>
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
