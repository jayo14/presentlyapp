import React from 'react';
import { motion } from 'framer-motion';
import {
  IconQrcode,
  IconBell,
  IconCheck,
  IconBrandApple,
  IconBrandGooglePlay,
  IconMapPin,
  IconShieldCheck,
  IconFingerprint,
  IconArrowRight
} from '@tabler/icons-react';

export const LandingMobileApp: React.FC = () => {
  return (
    <section id="mobile-app" className="py-40 bg-white overflow-hidden relative">
      <div className="orb w-[800px] h-[800px] bg-sungold/5 top-1/2 right-0" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 grid lg:grid-cols-2 gap-24 items-center relative z-10">

        {/* Content Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className="inline-flex items-center gap-3 mb-8 px-4 py-1.5 bg-sungold/10 rounded-full border border-sungold/20"
          >
            <span className="text-sungold text-[11px] font-medium tracking-tight">Mobility framework</span>
          </motion.div>

          <h2 className="text-[clamp(2.5rem,5vw,5rem)] tracking-[-0.04em] text-neutral-900 leading-[0.9] font-medium mb-12">
            Accountability in the<br />
            <span className="text-sungold italic ">palm of their hand.</span>
          </h2>

          <p className="text-xl md:text-2xl text-neutral-500 mb-16 max-w-xl leading-relaxed ">
            Presently's mobile core provides students with a seamless, location-verified experience while giving administrators real-time visibility.
          </p>

          <div className="space-y-10 mb-16">
            {[
              { title: 'Biometric verification', desc: 'Secure, hardware-backed identity verification that eliminates proxy check-ins.', icon: <IconFingerprint size={28} /> },
              { title: 'Intelligent geofencing', desc: 'Precision location awareness that only activates within authorized lecture venues.', icon: <IconMapPin size={28} /> },
              { title: 'Offline resilience', desc: 'Cryptographically signed records that sync even in zero-bandwidth environments.', icon: <IconShieldCheck size={28} /> },
            ].map(({ title, desc, icon }, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-black/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-500 shadow-sm">
                  <div className="text-sungold">{icon}</div>
                </div>
                <div>
                  <h5 className="text-xl font-medium mb-2 text-neutral-900 tracking-tight">{title}</h5>
                  <p className="text-neutral-500 text-base leading-relaxed  max-w-md">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-6">
            <button className="bg-[#231F0F] text-white px-8 py-4 rounded-full font-medium flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl border border-white/5 group">
              <IconBrandApple size={24} className="group-hover:text-sungold transition-colors" />
              <div className="text-left">
                <p className="text-[10px] font-medium opacity-40 leading-none mb-1">Download on</p>
                <p className="text-base leading-none font-medium tracking-tight">App store</p>
              </div>
            </button>
            <button className="bg-[#231F0F] text-white px-8 py-4 rounded-full font-medium flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl border border-white/5 group">
              <IconBrandGooglePlay size={24} className="group-hover:text-sungold transition-colors" />
              <div className="text-left">
                <p className="text-[10px] font-medium opacity-40 leading-none mb-1">Get it on</p>
                <p className="text-base leading-none font-medium tracking-tight">Google play</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Device Side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="orb w-[500px] h-[500px] bg-sungold/10 rounded-full -inset-20" />

          {/* High-End Device Frame - Savage Aesthetic */}
          <div className="relative w-[340px] h-[700px] bg-neutral-900 p-4 rounded-[60px] shadow-2xl border-[8px] border-neutral-800">
            {/* Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20" />

            <div className="bg-white h-full rounded-[44px] overflow-hidden relative flex flex-col">

              <div className="p-8 flex-1">
                <div className="flex justify-between items-center mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-sungold/10 flex items-center justify-center">
                    <IconShieldCheck size={28} className="text-sungold" />
                  </div>
                  <div className="w-10 h-10 rounded-full border border-black/5 overflow-hidden">
                     <img src="https://i.pravatar.cc/150?img=12" alt="Profile" />
                  </div>
                </div>

                <h4 className="text-3xl font-medium mb-3 text-neutral-900 tracking-tight leading-tight">
                  Welcome back,<br />Uche.
                </h4>
                <p className="text-neutral-400 text-xs font-medium mb-10">University of Lagos · Hall 1</p>

                <div className="bg-neutral-50 border border-black/5 rounded-[2rem] p-6 mb-8 relative overflow-hidden group shadow-sm">
                   <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                      <IconMapPin size={60} />
                   </div>
                  <p className="text-[10px] text-neutral-400 font-medium tracking-tight mb-2">Verification stream</p>
                  <p className="font-medium text-green-600 flex items-center gap-2 text-base tracking-tight">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    GPS lock established
                  </p>
                  <p className="mt-3 text-[11px]  text-neutral-400 leading-relaxed">Multi-source triangulation verified your presence at Hall 1 with 99.9% fidelity.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <IconQrcode size={32} />, label: 'Id card' },
                    { icon: <IconBell size={32} />, label: 'Alerts' },
                  ].map(({ icon, label }, i) => (
                    <div key={i} className="bg-neutral-50 aspect-square rounded-[2rem] border border-black/5 flex flex-col items-center justify-center gap-3 hover:bg-neutral-100 transition-colors cursor-pointer group">
                      <div className="text-sungold group-hover:scale-110 transition-transform">{icon}</div>
                      <span className="text-[10px] font-medium tracking-tight text-neutral-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-white pt-10">
                <button className="skeuo-button-gold w-full py-5 rounded-2xl font-medium text-center text-base hover:scale-[1.02] transition-transform">
                  Instant check-in
                </button>
              </div>

              {/* Home Indicator */}
              <div className="w-28 h-1 bg-neutral-200 rounded-full mx-auto mb-2" />
            </div>
          </div>

          {/* Floating Verification Indicator - Savage Glass */}
          <motion.div
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -left-10 top-1/4 glass p-5 rounded-2xl shadow-2xl z-30 flex items-center gap-3"
          >
             <div className="w-8 h-8 rounded-full bg-sungold flex items-center justify-center shadow-lg shadow-sungold/20">
                <IconCheck size={18} className="text-neutral-900" />
             </div>
             <div>
                <p className="text-[10px] font-medium text-neutral-400 leading-none mb-1">Check-in</p>
                <p className="text-xs font-medium text-neutral-900">Verified 0.2s</p>
             </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};
