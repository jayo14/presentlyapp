import React from 'react';
import { motion } from 'framer-motion';

export const LandingTestimonials: React.FC = () => {
  const stats = [
    { value: '200+', label: 'Students' },
    { value: '94.7%', label: 'Avg attend. rate' },
    { value: '3 sec', label: 'Check-in time' },
    { value: '1', label: 'University' },
  ];

  return (
    <section className="py-32 bg-presently-black text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-32">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-5xl md:text-6xl text-sungold mb-2">
                {stat.value}
              </div>
              <div className="font-sans text-slate-400 text-sm uppercase tracking-widest">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-5xl italic leading-tight mb-8"
          >
            "Presently didn't just fix attendance tracking.<br />
            It changed how we think about student accountability."
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 font-sans tracking-wide"
          >
            — Dr. [Name], Dean of Student Affairs
          </motion.div>
        </div>
      </div>
    </section>
  );
};
