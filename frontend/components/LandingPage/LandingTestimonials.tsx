import React from 'react';
import { Quote, Star } from 'lucide-react';
import { InfiniteSlider } from './components/InfiniteSlider';

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
  <div className="w-[450px] p-8 rounded-[2.5rem] liquid-glass-gold border-white/5 mx-4 flex flex-col justify-between h-[300px] hover:border-[#D4AF37]/30 transition-all group">
    <div>
      <div className="flex items-center gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} size={14} className="fill-[#D4AF37] text-[#D4AF37]" />
        ))}
      </div>
      <p className="text-zinc-300 italic leading-relaxed text-lg font-medium group-hover:text-white transition-colors">
        "{testimonial.quote}"
      </p>
    </div>
    <div className="flex items-center gap-4 mt-6">
      <div className="relative">
        <div className="absolute inset-0 bg-[#D4AF37] blur-md opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
        <img
          src={testimonial.img}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/30 relative z-10 object-cover"
        />
      </div>
      <div>
        <p className="text-white font-black tracking-tight">{testimonial.name}</p>
        <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">{testimonial.role}</p>
      </div>
    </div>
  </div>
);

export const LandingTestimonials: React.FC = () => {
  const firstRow = TESTIMONIALS.slice(0, 2);
  const secondRow = TESTIMONIALS.slice(2, 4);

  return (
    <section className="py-32 bg-[#0A0A0A] overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-6">
          <Quote size={16} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em]">Wall of Love</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
          Trusted by <span className="text-gradient-gold">Leading Institutions</span>
        </h2>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
          See how Nigerian universities are reclaiming lecture time and ensuring academic integrity with Presently.
        </p>
      </div>

      <div className="space-y-8">
        <InfiniteSlider
          items={TESTIMONIALS.map((t, i) => <TestimonialCard key={i} testimonial={t} />)}
          direction="left"
          speed={50}
        />
        <InfiniteSlider
          items={[...TESTIMONIALS].reverse().map((t, i) => <TestimonialCard key={i} testimonial={t} />)}
          direction="right"
          speed={60}
        />
      </div>
    </section>
  );
};
