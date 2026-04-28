import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, ShieldCheck, Database } from 'lucide-react';

const STATS = [
  { label: "Active Sessions", value: "2.4k+", color: "#D4AF37" },
  { label: "Verification Speed", value: "0.8s", color: "#22c55e" },
  { label: "Accuracy Rate", value: "99.9%", color: "#D4AF37" }
];

export const LandingEngineRoom: React.FC = () => {
  return (
    <section className="py-40 bg-[#0A0A0A] relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-center">

          <div className="relative group">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square liquid-glass-gold rounded-[4.5rem] p-16 border-white/10 flex items-center justify-center overflow-hidden shadow-[0_60px_120px_rgba(212,175,55,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/15 to-transparent opacity-50" />

              {/* Central Core Visualization */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="p-5 bg-black/50 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 shadow-2xl">
                    <Activity className="text-[#D4AF37] w-8 h-8 animate-pulse" />
                  </div>
                  <div className="p-5 bg-black/50 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 shadow-2xl">
                    <Database className="text-zinc-500 w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-10">
                  {STATS.map((stat, i) => (
                    <div key={stat.label}>
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">{stat.label}</span>
                        <span className="text-white font-black text-xl">{stat.value}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "100%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: i * 0.2, ease: "circOut" }}
                          className="h-full bg-gradient-to-r from-[#D4AF37] via-[#D4AF37] to-white opacity-90"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar Effect */}
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-[40%] h-[40%] bg-[#D4AF37] rounded-full blur-[100px]"
              />
            </motion.div>

            {/* Floating Info Tag */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-12 -right-12 p-8 bg-zinc-950/90 backdrop-blur-[40px] border border-white/15 rounded-[2.5rem] shadow-2xl z-20 group-hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                  <Zap className="text-[#D4AF37] w-6 h-6 fill-[#D4AF37] animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">System Latency</p>
                  <p className="text-2xl text-white font-black tracking-tight leading-none">12ms</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 backdrop-blur-md"
            >
              <ShieldCheck size={16} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">Institutional Infrastructure</span>
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.85]">
              Built for <br />
              <span className="text-gradient-gold">Campus Efficiency.</span>
            </h2>

            <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-xl">
              Presently provides the high-performance verification backbone for Nigerian universities. From real-time engagement tracking to automated result audits, we empower departments with absolute clarity.
            </p>

            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-3 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-[#D4AF37]/5 transition-colors">
                <h4 className="text-white font-black text-lg tracking-tight">Audit-Ready Data</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">Every record is timestamped and geolocated, eliminating attendance disputes during results.</p>
              </div>
              <div className="space-y-3 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-[#D4AF37]/5 transition-colors">
                <h4 className="text-white font-black text-lg tracking-tight">Rapid Deployment</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">Onboard an entire faculty in hours. Our system integrates with your existing course structures.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Background Blobs */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#D4AF37]/3 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};
