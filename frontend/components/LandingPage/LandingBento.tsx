import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, BarChart3, Zap, Lock, Users } from 'lucide-react';

const BENTO_ITEMS = [
  {
    title: "Anti-Proxy Verification",
    desc: "Our triple-check system uses GPS, device fingerprinting, and biometric verification to ensure only students physically present can mark attendance.",
    icon: <Shield className="w-8 h-8 text-[#D4AF37]" />,
    className: "lg:col-span-2 lg:row-span-2 bg-[#D4AF37]/5 border-[#D4AF37]/20",
    visual: (
      <div className="mt-8 relative h-48 w-full bg-black/40 rounded-3xl border border-white/5 overflow-hidden p-6 flex flex-col justify-center items-center">
         <motion.div
           animate={{ scale: [1, 1.2, 1] }}
           transition={{ duration: 3, repeat: Infinity }}
           className="w-24 h-24 rounded-full border-4 border-[#D4AF37]/30 flex items-center justify-center"
         >
           <Lock className="w-10 h-10 text-[#D4AF37]" />
         </motion.div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/10 to-transparent" />
      </div>
    )
  },
  {
    title: "Instant Analytics",
    desc: "Real-time dashboards showing course health and student engagement metrics.",
    icon: <BarChart3 className="w-8 h-8 text-[#D4AF37]" />,
    className: "lg:col-span-1 lg:row-span-1 bg-white/5 border-white/10",
  },
  {
    title: "Mobile First",
    desc: "Optimized for the Nigerian campus connectivity landscape.",
    icon: <Smartphone className="w-8 h-8 text-[#D4AF37]" />,
    className: "lg:col-span-1 lg:row-span-2 bg-white/5 border-white/10 flex flex-col justify-between",
    visual: (
      <div className="mt-4 flex gap-2 overflow-hidden opacity-50">
        {[1,2,3].map(i => <div key={i} className="min-w-[80px] h-32 bg-white/5 rounded-2xl border border-white/5" />)}
      </div>
    )
  },
  {
    title: "Zero Latency",
    desc: "Fast, reliable sync even on 2G networks.",
    icon: <Zap className="w-8 h-8 text-[#D4AF37]" />,
    className: "lg:col-span-1 lg:row-span-1 bg-white/5 border-white/10",
  }
];

export const LandingBento: React.FC = () => {
  return (
    <section className="py-32 bg-[#0A0A0A]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
            Everything you need to <span className="text-gradient-gold">restore integrity.</span>
          </h2>
          <p className="text-zinc-400 text-lg font-medium leading-relaxed">
            We've built a suite of tools specifically for the unique challenges of the Nigerian educational system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
          {BENTO_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-[2.5rem] border backdrop-blur-3xl ${item.className} group hover:border-[#D4AF37]/30 transition-all`}
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-[#D4AF37] transition-colors">{item.title}</h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              {item.visual}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
