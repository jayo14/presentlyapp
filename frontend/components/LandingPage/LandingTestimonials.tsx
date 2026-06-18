import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconQuote, IconCircleCheck, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

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
  const [currentIndex, setCurrentIndex] = useState(0);

  // Responsive items count
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };
  
  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const getVisibleTestimonials = () => {
    const items = [];
    for (let i = 0; i < visibleCount; i++) {
      items.push(TESTIMONIALS[(currentIndex + i) % TESTIMONIALS.length]);
    }
    return items;
  };

  return (
    <section className="py-40 bg-background relative overflow-hidden">
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
          <div className="max-w-md">
            <p className="text-xl text-neutral-500 leading-relaxed mb-6">
              Institutional integrity is the core of our mission. Read how Presently is reshaping Nigerian academia.
            </p>
            <div className="flex gap-4">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border border-black/5 bg-white flex items-center justify-center text-neutral-900 hover:bg-sungold hover:text-white transition-all shadow-sm"
                aria-label="Previous testimonial"
              >
                <IconChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full border border-black/5 bg-white flex items-center justify-center text-neutral-900 hover:bg-sungold hover:text-white transition-all shadow-sm"
                aria-label="Next testimonial"
              >
                <IconChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex gap-8">
            <AnimatePresence mode="popLayout" initial={false}>
              {getVisibleTestimonials().map((testimonial, idx) => (
                <motion.div
                  key={`${testimonial.name}-${currentIndex}-${idx}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 min-w-0"
                >
                  <div
                    className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-black/5 flex flex-col justify-between group hover:border-sungold/40 transition-all duration-700 hover:shadow-2xl relative overflow-hidden h-[480px]"
                  >
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-sungold/10 flex items-center justify-center mb-8">
                         <IconQuote size={28} className="text-sungold fill-sungold" />
                      </div>
                      <p className="text-xl md:text-2xl font-medium text-neutral-900 leading-tight italic mb-8">
                        "{testimonial.quote}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 pt-8 border-t border-black/5">
                      <div className="w-14 h-14 rounded-2xl border-2 border-neutral-100 overflow-hidden shrink-0">
                        <img
                          src={testimonial.img}
                          alt={testimonial.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-base text-neutral-900 tracking-tight mb-0.5 truncate">{testimonial.name}</h4>
                        <p className="text-[10px] font-bold text-sungold uppercase tracking-widest mb-1 truncate">{testimonial.role}</p>
                        <p className="text-[10px] font-medium text-neutral-400 tracking-tight flex items-center gap-1.5 truncate">
                           <IconCircleCheck size={14} className="text-green-500" /> {testimonial.institution}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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
