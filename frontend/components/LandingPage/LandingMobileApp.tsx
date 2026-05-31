import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Bell, Check, AppleLogo, Play } from '@phosphor-icons/react';

export const LandingMobileApp: React.FC = () => {
  return (
    <section className="py-64 bg-surface/30 overflow-hidden relative">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[85%] md:max-w-[80%] mx-auto grid lg:grid-cols-2 gap-32 items-center">
        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex justify-center relative"
        >
          <div className="absolute -inset-20 bg-primary/5 rounded-full blur-[100px] animate-pulse-glow" />

          <div className="relative w-[320px] h-[650px] bg-on-surface p-4 rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[8px] border-outline/20">
            {/* Dynamic island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

            <div className="bg-background h-full rounded-[48px] overflow-hidden relative border border-white/5">
              <div className="p-8 pt-12">
                <div className="flex justify-between items-center mb-10">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary rounded-full shadow-lg shadow-primary/20" />
                  </div>
                  <Bell size={28} weight="duotone" className="text-textMuted" />
                </div>

                <h4 className="font-headline text-3xl font-black mb-8 text-on-surface tracking-tight">
                  Welcome back,<br />Alex
                </h4>

                <div className="bg-surface/50 border border-outline/10 rounded-3xl p-6 mb-8 skeuo-card">
                  <p className="text-[10px] uppercase text-textMuted font-black tracking-widest mb-2">Current Status</p>
                  <p className="font-black text-primary flex items-center gap-3 text-sm tracking-tight">
                    <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(245,197,24,0.5)]" />
                    Verified at Science Block
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: <QrCode size={32} weight="duotone" />, label: 'My ID' },
                    { icon: <Play size={32} weight="fill" />, label: 'Active' },
                  ].map(({ icon, label }, i) => (
                    <div key={i} className="bg-surface/30 aspect-square rounded-[32px] border border-outline/5 flex flex-col items-center justify-center gap-3 shadow-sm">
                      <div className="text-primary">{icon}</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/60">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background via-background to-transparent">
                <div className="skeuo-button-gold w-full py-5 rounded-2xl font-black text-center shadow-lg text-sm">
                  QUICK CHECK-IN
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-primary text-[10px] font-black tracking-[0.3em] uppercase leading-relaxed">Companion App</span>
          </div>

          <h2 className="font-headline text-5xl md:text-7xl tracking-tighter text-on-surface leading-[0.95] font-black mb-12">
            Precision in <br />
            <span className="text-primary italic">Your Pocket.</span>
          </h2>

          <p className="text-xl md:text-2xl text-textMuted mb-16 max-w-lg leading-relaxed font-medium">
            Stay connected to your institutional flow from anywhere. Our companion app brings verified attendance and real-time alerts to your mobile device.
          </p>

          <div className="space-y-10 mb-16">
            {[
              { title: 'Real-time Check-in', desc: 'Seamless NFC or QR-based check-ins that sync in milliseconds.' },
              { title: 'Instant Notifications', desc: 'Critical alerts and presence updates delivered straight to your lock screen.' },
              { title: 'Secure Digital ID', desc: 'Hardware-backed biometric identity for immutable verification.' },
            ].map(({ title, desc }, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Check size={24} weight="bold" className="text-primary" />
                </div>
                <div>
                  <h5 className="font-headline font-black text-xl mb-2 text-on-surface tracking-tight">{title}</h5>
                  <p className="text-textMuted text-lg leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-6">
            <button className="bg-presently-black text-white px-10 py-5 rounded-2xl font-black flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl">
              <AppleLogo size={32} weight="fill" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold opacity-60 leading-none mb-1">Download on</p>
                <p className="text-lg leading-none font-black">App Store</p>
              </div>
            </button>
            <button className="bg-presently-black text-white px-10 py-5 rounded-2xl font-black flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl">
              <Play size={32} weight="fill" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold opacity-60 leading-none mb-1">Get it on</p>
                <p className="text-lg leading-none font-black">Google Play</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
