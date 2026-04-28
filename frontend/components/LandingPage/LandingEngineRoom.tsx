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
    <section className="py-32 bg-[#0A0A0A] relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square liquid-glass-gold rounded-[4rem] p-12 border-white/5 flex items-center justify-center overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-transparent opacity-50" />

              {/* Central Core Visualization */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div className="flex justify-between">
                  <Activity className="text-[#D4AF37] w-8 h-8 animate-pulse" />
                  <Database className="text-zinc-500 w-8 h-8" />
                </div>

                <div className="space-y-8">
                  {STATS.map((stat, i) => (
                    <div key={stat.label}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                        <span className="text-white font-black">{stat.value}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "100%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: i * 0.2 }}
                          className="h-full bg-gradient-to-r from-[#D4AF37] to-white opacity-80"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar Effect */}
              <motion.div
                animate={{ scale: [1, 2], opacity: [0.1, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute w-[50%] h-[50%] bg-[#D4AF37] rounded-full blur-[80px]"
              />
            </motion.div>

            {/* Floating Info Tag */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-10 p-6 bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl z-20"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Zap className="text-[#D4AF37] w-5 h-5 fill-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">System Latency</p>
                  <p className="text-lg text-white font-black tracking-tight leading-none">12ms</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-8"
            >
              <ShieldCheck size={16} className="text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em]">Institutional Infrastructure</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
              The Engine Room of <br />
              <span className="text-gradient-gold">Campus Efficiency.</span>
            </h2>

            <p className="text-zinc-400 text-xl font-medium leading-relaxed mb-12">
              Presently isn't just an app; it's a high-performance verification engine built to handle millions of records across Nigerian campuses with enterprise-grade reliability.
            </p>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-black mb-2">Infinite Scalability</h4>
                <p className="text-zinc-500 text-sm">Deployed on resilient cloud architecture capable of handling entire university clusters.</p>
              </div>
              <div>
                <h4 className="text-white font-black mb-2">Military Encryption</h4>
                <p className="text-zinc-500 text-sm">Every data point is encrypted end-to-end, ensuring student privacy and administrative security.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
