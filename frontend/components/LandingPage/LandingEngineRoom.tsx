import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Database, Zap, ShieldCheck, Activity,
  Server, Cpu, Network, Lock
} from 'lucide-react';
import { ModernCard } from '../ModernCard';

const STATS = [
  { label: 'Uptime', value: '99.9%' },
  { label: 'Latency', value: '12ms' },
  { label: 'Security', value: 'E2EE' }
];

export const LandingEngineRoom: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);

  return (
    <section ref={containerRef} className="py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* VISUAL SIDE */}
          <div className="relative group perspective-2000">
            <motion.div
              style={{ rotateY: rotate }}
              className="relative w-full aspect-square bg-surface border border-outline rounded-[4rem] p-12 shadow-premium overflow-hidden group-hover:border-primary/20 transition-colors"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-6 bg-surfaceContainer rounded-[2rem] border border-outline shadow-soft">
                    <Activity className="text-primary w-8 h-8 animate-status-pulse" />
                  </div>
                  <div className="p-6 bg-surfaceContainer rounded-[2rem] border border-outline shadow-soft">
                    <Database className="text-textMuted w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-8">
                  {STATS.map((stat, i) => (
                    <div key={stat.label}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-textMuted text-[10px] font-black uppercase tracking-[0.3em]">{stat.label}</span>
                        <span className="text-text font-black text-xl">{stat.value}</span>
                      </div>
                      <div className="h-2 bg-surfaceContainer rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "100%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: i * 0.2, ease: "circOut" }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            </motion.div>

            {/* Floating Detail */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-10 p-8 bg-surface border border-outline rounded-[2.5rem] shadow-premium z-20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                  <Zap size={24} className="fill-success" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">Latency</p>
                  <p className="text-2xl text-text font-black">Fast</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CONTENT SIDE */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Built for Scale</span>
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-black text-text tracking-tighter leading-[0.85]">
              Institutional <br />
              <span className="text-primary">Grade Power.</span>
            </h2>

            <p className="text-textMuted text-xl font-medium leading-relaxed max-w-xl">
              Presently provides the high-performance verification backbone for Nigerian universities. Reliable, secure, and built for thousands of concurrent users.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { title: 'Audit Ready', desc: 'Secure logs for every session.' },
                { title: 'Rapid Deploy', desc: 'Faculty-wide in hours.' }
              ].map((item, i) => (
                <ModernCard key={i} variant="outline" className="p-6 space-y-2 hover:bg-surfaceContainer transition-colors">
                  <h4 className="text-text font-black text-lg tracking-tight">{item.title}</h4>
                  <p className="text-textMuted text-xs leading-relaxed">{item.desc}</p>
                </ModernCard>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
