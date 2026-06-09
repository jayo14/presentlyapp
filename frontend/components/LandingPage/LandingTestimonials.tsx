import React from 'react';
import { motion } from 'framer-motion';
import { IconQuote, IconCircleCheck } from '@tabler/icons-react';

const TESTIMONIALS = [
  {
    quote: "Presently transformed our NUC accreditation from a manual nightmare into a gold standard of automated integrity.",
    name: "Prof. Ifeanyi K.",
    role: "Deputy vice chancellor",
    institution: "Federal University of Technology",
    img: "https://i.pravatar.cc/200?img=11",
  },
  {
    quote: "The proxy attendance problem vanished overnight. Lecturers have reclaimed nearly 20% of their contact hours.",
    name: "Dr. Amaka O.",
    role: "Dean of science",
    institution: "University of Lagos",
    img: "https://i.pravatar.cc/200?img=32",
  },
  {
    quote: "As an administrator, having cryptographically signed attendance records gives us absolute confidence during audits.",
    name: "Musa Ibrahim",
    role: "Registrar",
    institution: "Ahmadu Bello University",
    img: "https://i.pravatar.cc/200?img=53",
  },
];

export const LandingTestimonials: React.FC = () => {
  return (
    <section className="py-40 bg-[#FDF9F0] relative overflow-hidden">
      {/* Background Accent */}
      <div className="orb w-[800px] h-[800px] bg-sungold/5 bottom-0 right-0" />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 relative z-10">

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-24">
          <div className="max-w-4xl">
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="flex items-center gap-4 mb-8"
            >
               <div className="w-10 h-px bg-sungold" />
               <span className="text-sungold font-medium text-[11px] tracking-tight">Voices of authority</span>
            </motion.div>
            <h2 className="text-[clamp(2.5rem,5vw,5rem)] tracking-[-0.04em] text-neutral-900 leading-[0.9] font-medium">
              Validated by<br />
              <span className="text-neutral-400 italic ">academic leadership.</span>
            </h2>
          </div>
          <p className="text-xl text-neutral-500 max-w-md leading-relaxed  lg:mb-4">
            Institutional integrity is the core of our mission. Read how Presently is reshaping Nigerian academia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white p-12 rounded-[2.5rem] border border-black/5 flex flex-col justify-between group hover:border-sungold/40 transition-all duration-700 hover:shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-sungold/10 flex items-center justify-center mb-10">
                   <IconQuote size={28} className="text-sungold fill-sungold" />
                </div>
                <p className="text-xl font-medium text-neutral-900 leading-relaxed italic mb-12">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-5 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] border-2 border-neutral-100 overflow-hidden">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
                <div>
                  <h4 className="font-medium text-lg text-neutral-900 tracking-tight mb-0.5">{t.name}</h4>
                  <p className="text-[11px] font-medium text-sungold tracking-tight mb-0.5">{t.role}</p>
                  <p className="text-[11px] font-medium text-neutral-400 tracking-tight flex items-center gap-1.5">
                     <IconCircleCheck size={14} className="text-green-500" /> {t.institution}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 pt-16 border-t border-black/5 flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale contrast-125">
           {['Fut minna', 'Unilag', 'Abu zaria', 'Ui ibadan', 'Oau ife'].map(uni => (
             <span key={uni} className="font-medium text-xl tracking-tighter text-neutral-400">{uni}</span>
           ))}
        </div>
      </div>
    </section>
  );
};
