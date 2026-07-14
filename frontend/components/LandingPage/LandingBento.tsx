import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  IconShieldCheck,
  IconUsers,
  IconChartBar,
  IconBuildings,
  IconFileText,
  IconLock,
  IconArrowUpRight
} from '@tabler/icons-react';
import { StatCounter } from './StatCounter';

const MiniChart = ({ color = "#F9C406" }) => (
  <svg width="60" height="24" viewBox="0 0 60 24" className="overflow-visible">
    <motion.path
      d="M0 20 Q 15 5, 30 18 T 60 10"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 0.5 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  </svg>
);

const BentoCard = ({ children, className = "", delay = 0 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative group overflow-hidden rounded-[2.5rem] border border-foreground/5 bg-surface hover:border-sungold/40 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] ${className}`}
    >
      <div style={{ transform: "translateZ(50px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

export const LandingBento = () => {
  return (
    <section id="features" className="py-40 bg-background relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-blue-400/5 top-20 -right-20" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 relative z-10">

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-24">
          <div className="max-w-4xl">
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="flex items-center gap-4 mb-8"
            >
               <div className="w-10 h-px bg-sungold" />
               <span className="text-sungold font-medium text-[11px] tracking-tight">Sovereign architecture</span>
            </motion.div>
            <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-medium text-foreground leading-[0.9] tracking-[-0.04em]">
              The core of institutional<br />
              <span className="text-neutral-400 italic ">excellence.</span>
            </h2>
          </div>
          <div className="max-w-md lg:mb-4">
            <p className="text-xl text-neutral-500 leading-relaxed  mb-8">
              Presently is not an app; it is a fundamental layer of academic integrity for the modern university.
            </p>
            <a href="#features" className="inline-flex items-center gap-2 text-foreground font-medium tracking-tight text-[11px] group">
              Explore features <IconArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">

          <BentoCard className="md:col-span-8 p-8 min-h-[500px] flex flex-col justify-between bg-surface group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-sungold/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <IconShieldCheck size={32} className="text-sungold" />
                </div>
                <MiniChart color="#F9C406" />
              </div>
              <h3 className="text-4xl font-medium text-foreground tracking-tight mb-6 leading-tight">NUC-ready compliance.</h3>
              <p className="text-lg text-neutral-500 max-w-xl leading-relaxed ">
                Generating audit-ready attendance reports with cryptographic certainty. Presently ensures your institution meets the 75% attendance threshold mandated for examination eligibility with immutable, location-verified records.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-4 relative z-10">
               {['ISO 27001 certified', 'CCMAS compliant', 'Real-time audit logs', 'Tamper-proof records'].map(tag => (
                 <span key={tag} className="px-6 py-2.5 rounded-full bg-foreground/5 border border-foreground/5 text-[11px] font-medium tracking-tight text-neutral-600 hover:border-sungold/40 transition-colors">
                   {tag}
                 </span>
               ))}
            </div>

            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-105 transition-transform duration-1000 pointer-events-none">
               <IconBuildings size={300} />
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-4 p-8 min-h-[500px] bg-neutral-900 flex flex-col justify-between text-white group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl group-hover:bg-sungold/20 transition-colors duration-700">
                  <IconLock size={32} className="text-sungold" />
                </div>
                <MiniChart color="#FFFFFF" />
              </div>
              <h3 className="text-4xl font-medium tracking-tight mb-6 leading-tight text-white">Proxy elimination.</h3>
              <p className="text-lg text-white/50 leading-relaxed ">
                Multi-factor verification prevents proxies by correlating GPS, Wi-Fi signatures, and hardware-bound device identifiers.
              </p>
            </div>

            <div className="mt-12 pt-12 border-t border-white/5">
               <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium tracking-tight text-white/40">Fidelity rating</span>
                  <span className="text-sm font-medium text-sungold tracking-tight">
                    <StatCounter value={99.99} suffix="%" decimals={2} />
                  </span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "99.99%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-sungold"
                  />
               </div>
               <p className="mt-4 text-[10px] font-medium tracking-tight text-white/20">Secured with AES-256 encryption</p>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-4 p-6 min-h-[400px] bg-surface group">
            <div className="w-14 h-14 rounded-xl bg-sungold/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <IconUsers size={28} className="text-sungold" />
            </div>
            <h4 className="text-2xl font-medium text-foreground tracking-tight mb-4">Classroom authority.</h4>
            <p className="text-base text-neutral-500 leading-relaxed ">
              Lecturers reclaim up to 20% of contact time previously lost to manual roll calls. Presently restores the focus to pedagogy.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-4 p-6 min-h-[400px] bg-surface group">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <IconChartBar size={28} className="text-blue-500" />
            </div>
            <h4 className="text-2xl font-medium text-foreground tracking-tight mb-4">Predictive engagement.</h4>
            <p className="text-base text-neutral-500 leading-relaxed ">
              Monitor student engagement live. Identify at-risk cohorts before they fall behind mandated minimums.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-4 p-6 min-h-[400px] bg-surface group">
            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <IconFileText size={28} className="text-green-500" />
            </div>
            <h4 className="text-2xl font-medium text-foreground tracking-tight mb-4">Examination clearance.</h4>
            <p className="text-base text-neutral-500 leading-relaxed ">
              Seamlessly bridge attendance with exam clearance. Instantly verify eligibility based on secure records.
            </p>
          </BentoCard>

        </div>
      </div>
    </section>
  );
};
