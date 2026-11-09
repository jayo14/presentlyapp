import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPlus,
  IconMinus,
  IconHelpCircle,
  IconMapPin,
  IconWifi,
  IconDeviceMobile,
  IconShieldLock,
  IconUsers,
  IconFileSpreadsheet
} from '@tabler/icons-react';

interface FAQItemProps {
  question: string;
  answer: string;
  icon?: any;
}

const FAQAccordionItem: React.FC<FAQItemProps> = ({ question, answer, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 py-6 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between text-left group gap-4 cursor-pointer"
      >
        <div className="flex items-center gap-4 flex-1">
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-sungold/10 text-sungold flex items-center justify-center shrink-0 group-hover:bg-sungold group-hover:text-[#231F0F] transition-colors">
              <Icon size={18} />
            </div>
          )}
          <span className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-sungold transition-colors">
            {question}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0">
          {isOpen ? <IconMinus size={16} /> : <IconPlus size={16} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pl-13">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQSection: React.FC = () => {
  const faqs = [
    {
      icon: IconMapPin,
      question: 'How does location verification work inside a university classroom?',
      answer:
        'When the lecturer launches a session at the lectern, Presently captures their coordinates and sets a boundary radius (typically 25m to 60m). When students submit the session PIN on their smartphones, their browser checks proximity against the lecturer’s geofence. If they are within the boundary, their check-in is authenticated.',
    },
    {
      icon: IconWifi,
      question: 'What happens when indoor GPS accuracy fluctuates inside concrete lecture halls?',
      answer:
        'Multi-story concrete buildings and metallic roofs can cause satellite signal drift. We designed Presently with configurable boundary buffers: lecturers can expand the radius (e.g. from 30m to 60m) to encompass the whole amphitheater. Furthermore, if a student experiences temporary GPS sensor drift, the lecturer has a 1-tap manual verification tool.',
    },
    {
      icon: IconDeviceMobile,
      question: 'What happens if a student’s phone battery is dead or they lack a smartphone?',
      answer:
        'Presently does not penalize students for technical hurdles. The lecturer’s live dashboard includes a search-and-add tool. The student simply approaches the lecturer or course representative, identifies themselves, and the lecturer manually marks them present with an internal audit tag.',
    },
    {
      icon: IconUsers,
      question: 'Can students check in from their hostel or from outside the classroom?',
      answer:
        'No. Attendance requires simultaneous verification: the student must enter the temporary 4-digit PIN (displayed only inside the physical classroom) AND their device’s GPS coordinates must fall within the designated venue boundary. Remote check-ins outside the perimeter are flagged and blocked.',
    },
    {
      icon: IconShieldLock,
      question: 'Does Presently continuously track student location outside class hours?',
      answer:
        'Absolutely not. Presently performs a strict point-in-time verification solely at the instant the student presses "Check In". The application does not monitor location in the background, does not store movement paths, and immediately releases the GPS sensor once verified.',
    },
    {
      icon: IconFileSpreadsheet,
      question: 'How does Presently assist with semester examination clearance?',
      answer:
        'Presently automatically computes every student’s cumulative attendance percentage throughout the 12–15 weeks of teaching. Lecturers and HODs can export certified lists with a single click, instantly highlighting students who have attained the mandatory 70% or 75% attendance threshold to sit for semester examinations.',
    },
    {
      icon: IconHelpCircle,
      question: 'Can an individual lecturer start using Presently without formal institutional approval?',
      answer:
        'Yes. An individual lecturer can create an account, register their courses, and begin running verified attendance immediately on the Free Starter plan or Lecturer Pro tier without requiring IT department procurement.',
    },
    {
      icon: IconUsers,
      question: 'How can an academic department or faculty request a demonstration or pilot?',
      answer:
        'Deans, Heads of Department, and ICT Directors can click "Request Campus Demo" below or email our team. We provide a 15-minute walkthrough, assist in mapping your campus venues, and guide you through running a departmental trial.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-neutral-50 dark:bg-[#12110D] border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-[1000px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sungold block mb-3">
            Clear Answers
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-4">
            Frequently asked questions.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Direct, factual answers to technical, operational, and privacy questions regarding Presently on Nigerian campuses.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-white dark:bg-[#1A1813] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm">
          {faqs.map((faq, idx) => (
            <FAQAccordionItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              icon={faq.icon}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
