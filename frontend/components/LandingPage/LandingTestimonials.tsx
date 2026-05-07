import React from 'react';
import { Quote, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModernCard } from '../ModernCard';

const TESTIMONIALS = [
  {
    quote: "Presently has eliminated the chaos of manual roll calls. My lectures now start with 100% focus on teaching.",
    name: "Prof. Chinedu Okafor",
    role: "UNILAG",
    img: "https://i.pravatar.cc/150?u=chinedu",
    rating: 5
  },
  {
    quote: "The geofencing is incredibly accurate. No more proxy attendance from the dorms.",
    name: "Dr. Funke Adeyemi",
    role: "OAU",
    img: "https://i.pravatar.cc/150?u=funke",
    rating: 5
  },
  {
    quote: "Real-time verification means I can trust the data. The analytics are superb.",
    name: "Mr. Ibrahim Musa",
    role: "BUK",
    img: "https://i.pravatar.cc/150?u=ibrahim",
    rating: 5
  }
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof TESTIMONIALS[0] }) => (
  <ModernCard className="flex flex-col justify-between h-full hover:border-primary/30 transition-all group">
    <div>
      <div className="flex items-center gap-1 mb-6">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} size={14} className="fill-primary text-primary" />
        ))}
      </div>
      <p className="text-text text-xl font-medium leading-relaxed italic">
        \"{testimonial.quote}\"
      </p>
    </div>
    <div className="flex items-center gap-4 mt-8">
      <img
        src={testimonial.img}
        alt={testimonial.name}
        className="w-12 h-12 rounded-full border border-outline object-cover shadow-soft"
      />
      <div>
        <p className="text-text font-black text-sm tracking-tight leading-none mb-1">{testimonial.name}</p>
        <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">{testimonial.role}</p>
      </div>
    </div>
  </ModernCard>
);

export const LandingTestimonials: React.FC = () => {
  return (
    <section className="py-40 bg-background overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Quote size={16} className="text-primary" />
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Testimonials</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-text tracking-tighter mb-8 leading-[0.9]">
            Trusted by <br /><span className="text-primary">Leading Minds.</span>
          </h2>
          <p className="text-textMuted text-xl md:text-2xl font-medium leading-relaxed">
            See how Nigerian universities are reclaiming lecture integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <TestimonialCard testimonial={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
