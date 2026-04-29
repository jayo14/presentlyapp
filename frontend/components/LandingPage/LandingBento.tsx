import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, BarChart3, Zap, Lock, Users } from 'lucide-react';

const BENTO_ITEMS = [
  {
    title: "No More Lost Sheets",
    desc: "Stop worrying about attendance papers getting lost in transit. Everything is backed up to the cloud instantly, ensuring your marks are safe for result processing.",
    icon: <Shield className="w-10 h-10 text-[#D4AF37]" />,
    className: "lg:col-span-2 lg:row-span-2 liquid-glass-gold border-[#D4AF37]/20",
    visual: (
      <div className="mt-10 relative h-56 w-full bg-black/40 rounded-[3rem] border border-white/5 overflow-hidden p-8 flex flex-col justify-center items-center group-hover:scale-[1.02] transition-transform">
         <motion.div
           animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           className="w-28 h-28 rounded-[2rem] border-4 border-[#D4AF37]/30 flex items-center justify-center relative shadow-[0_0_60px_rgba(212,175,55,0.2)] bg-black/50"
         >
           <Lock className="w-12 h-12 text-[#D4AF37]" />
           <div className="absolute inset-0 bg-[#D4AF37]/10 blur-2xl rounded-full" />
         </motion.div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/20 to-transparent" />
      </div>
    )
  },
  {
    title: "Exam Clearance Ease",
    desc: "Export your 70% attendance status with one click. No more long queues or manual verification stress during exams.",
    icon: <Zap className="w-10 h-10 text-[#D4AF37]" />,
    className: "lg:col-span-1 lg:row-span-1 bg-white/5 border-white/10 hover:bg-[#D4AF37]/5 transition-colors",
  },
  {
    title: "Smart Mobile Sync",
    desc: "Built for Nigerian campuses. Mark attendance even on weak 2G networks with our ultra-lightweight sync engine.",
    icon: <Smartphone className="w-10 h-10 text-[#D4AF37]" />,
    className: "lg:col-span-1 lg:row-span-2 bg-white/5 border-white/10 flex flex-col justify-between overflow-hidden",
    visual: (
      <div className="mt-6 flex gap-4 opacity-40 group-hover:opacity-80 transition-all translate-x-4">
        {[1,2,3].map(i => <div key={i} className="min-w-[100px] h-40 bg-gradient-to-b from-[#D4AF37]/30 to-transparent rounded-[1.5rem] border border-white/10 shadow-lg" />)}
      </div>
    )
  },
  {
    title: "Instant Transparency",
    desc: "Know exactly where you stand. Students and lecturers get real-time dashboards for every course and session.",
    icon: <BarChart3 className="w-10 h-10 text-[#D4AF37]" />,
    className: "lg:col-span-1 lg:row-span-1 bg-white/5 border-white/10 hover:bg-[#D4AF37]/5 transition-colors",
  }
];

export const LandingBento: React.FC = () => {
  return (
    <section className="py-40 bg-[#0A0A0A] relative">
      <div className="container mx-auto px-6">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[180px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-8"
          >
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">Built for Campus Life</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
            Everything you need to <br /><span className="text-gradient-gold">stay ahead of the curve.</span>
          </h2>
          <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-2xl">
            From tackling proxy fraud to eliminating manual signing chaos, we've solved the real problems Nigerian students and lecturers face daily.
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
              className={`p-10 rounded-[3.5rem] border backdrop-blur-3xl ${item.className} group hover:border-[#D4AF37]/40 transition-all duration-500 relative overflow-hidden shadow-2xl`}
            >
              <div className="mb-6 relative z-10">{item.icon}</div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-3 group-hover:text-[#D4AF37] transition-colors relative z-10">{item.title}</h3>
              <p className="text-zinc-500 text-base font-medium leading-relaxed relative z-10">{item.desc}</p>
              <div className="relative z-10">{item.visual}</div>

              {/* Glass Reflection Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
