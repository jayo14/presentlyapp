import React from 'react';
import { Quote, Star } from 'lucide-react';
import { InfiniteSlider } from './components/InfiniteSlider';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote: "Presently has eliminated the chaos of manual roll calls. My lectures now start with 100% focus on teaching, not attendance logistics.",
    name: "Prof. Chinedu Okafor",
    role: "Faculty of Engineering, UNILAG",
    img: "https://i.pravatar.cc/150?u=chinedu",
    rating: 5
  },
  {
    quote: "The geofencing is incredibly accurate. No more proxy attendance from the dorms. It's a game changer for Nigerian universities.",
    name: "Dr. Funke Adeyemi",
    role: "Department of Computer Science, OAU",
    img: "https://i.pravatar.cc/150?u=funke",
    rating: 5
  },
  {
    quote: "Real-time verification means I can trust the data. The visual analytics help us identify student engagement patterns early.",
    name: "Mr. Ibrahim Musa",
    role: "Registrar's Office, BUK",
    img: "https://i.pravatar.cc/150?u=ibrahim",
    rating: 5
  },
  {
    quote: "Seamless integration with our existing systems. The students love the ease of check-in, and we love the zero-tolerance for proxies.",
    name: "Dr. Ngozi Okeke",
    role: "College of Medicine, UNN",
    img: "https://i.pravatar.cc/150?u=ngozi",
    rating: 5
  }
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof TESTIMONIALS[0] }) => (
  <div className="w-[480px] p-10 rounded-[3.5rem] liquid-glass-gold border-white/5 mx-6 flex flex-col justify-between h-[340px] hover:border-[#D4AF37]/40 transition-all group shadow-2xl relative overflow-hidden">
    <div>
      <div className="flex items-center gap-1.5 mb-6">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} size={16} className="fill-[#D4AF37] text-[#D4AF37]" />
        ))}
      </div>
      <p className="text-zinc-200 italic leading-relaxed text-xl font-medium group-hover:text-white transition-colors relative z-10">
        "{testimonial.quote}"
      </p>
    </div>
    <div className="flex items-center gap-5 mt-8 relative z-10">
      <div className="relative">
        <div className="absolute inset-0 bg-[#D4AF37] blur-lg opacity-25 rounded-full group-hover:opacity-50 transition-opacity"></div>
        <img
          src={testimonial.img}
          alt={testimonial.name}
          className="w-14 h-14 rounded-full border-2 border-[#D4AF37]/40 relative z-10 object-cover shadow-lg"
        />
      </div>
      <div>
        <p className="text-white text-lg font-black tracking-tight leading-none mb-1">{testimonial.name}</p>
        <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em]">{testimonial.role}</p>
      </div>
    </div>

    {/* Abstract Glow */}
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#D4AF37]/5 blur-[60px] rounded-full group-hover:bg-[#D4AF37]/10 transition-colors" />
  </div>
);

export const LandingTestimonials: React.FC = () => {
  return (
    <section className="py-40 bg-[#0A0A0A] overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-8"
        >
          <Quote size={16} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">Wall of Love</span>
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
          Trusted by <span className="text-gradient-gold">Leading Minds.</span>
        </h2>
        <p className="text-zinc-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
          See how Nigerian universities are reclaiming lecture time and ensuring academic integrity with Presently.
        </p>
      </div>

      <div className="space-y-12">
        <InfiniteSlider
          items={TESTIMONIALS.map((t, i) => <TestimonialCard key={i} testimonial={t} />)}
          direction="left"
          speed={60}
        />
        <InfiniteSlider
          items={[...TESTIMONIALS].reverse().map((t, i) => <TestimonialCard key={i} testimonial={t} />)}
          direction="right"
          speed={70}
        />
      </div>
    </section>
  );
};
