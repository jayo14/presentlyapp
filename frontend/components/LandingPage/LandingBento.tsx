import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, BarChart3, Zap, Lock, Users } from 'lucide-react';
import { ModernCard } from '../ModernCard';

const BENTO_ITEMS = [
  {
    title: "No More Lost Sheets",
    desc: "Everything is backed up to the cloud instantly. Your attendance data is secure, always available for results processing.",
    icon: <Shield className="w-10 h-10 text-primary" />,
    className: "lg:col-span-2 lg:row-span-2 bg-primary/5 border-primary/10",
    visual: (
      <div className="mt-10 relative h-56 w-full bg-surfaceContainer rounded-[3rem] border border-outline overflow-hidden p-8 flex flex-col justify-center items-center group-hover:scale-[1.02] transition-transform">
         <motion.div
           animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           className="w-28 h-28 rounded-[2rem] border-4 border-primary/20 flex items-center justify-center relative shadow-soft bg-surface"
         >
           <Lock className="w-12 h-12 text-primary" />
           <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
         </motion.div>
      </div>
    )
  },
  {
    title: "Exam Clearance",
    desc: "Export your 75% attendance status with one click.",
    icon: <Zap className="w-10 h-10 text-primary" />,
    className: "lg:col-span-1 lg:row-span-1 bg-surface border-outline hover:border-primary/50",
  },
  {
    title: "Real-time Sync",
    desc: "Built for campus connectivity. Mark attendance instantly, even on 2G.",
    icon: <Smartphone className="w-10 h-10 text-primary" />,
    className: "lg:col-span-1 lg:row-span-2 bg-surface border-outline flex flex-col justify-between overflow-hidden",
    visual: (
      <div className="mt-6 flex gap-4 opacity-40 group-hover:opacity-100 transition-all translate-x-4">
        {[1,2,3].map(i => <div key={i} className="min-w-[100px] h-40 bg-surfaceContainer rounded-[1.5rem] border border-outline shadow-sm" />)}
      </div>
    )
  },
  {
    title: "Transparency",
    desc: "Know exactly where you stand with personal dashboards.",
    icon: <BarChart3 className="w-10 h-10 text-primary" />,
    className: "lg:col-span-1 lg:row-span-1 bg-surface border-outline hover:border-primary/50",
  }
];

export const LandingBento: React.FC = () => {
  return (
    <section className="py-40 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Built for Modern Campus</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-text tracking-tighter mb-8 leading-[0.9]">
            Everything you need to <br /><span className="text-primary">stay ahead of the curve.</span>
          </h2>
          <p className="text-textMuted text-xl font-medium leading-relaxed max-w-2xl">
            From tackling proxy fraud to eliminating manual signing chaos, Presently is the operating system for your academic journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[280px]">
          {BENTO_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={cn(
                "p-10 rounded-[3rem] border backdrop-blur-3xl group transition-all duration-500 relative overflow-hidden shadow-soft",
                item.className
              )}
            >
              <div className="mb-6 relative z-10">{item.icon}</div>
              <h3 className="text-2xl font-black text-text tracking-tight mb-3 group-hover:text-primary transition-colors relative z-10">{item.title}</h3>
              <p className="text-textMuted text-base font-medium leading-relaxed relative z-10">{item.desc}</p>
              <div className="relative z-10">{item.visual}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
