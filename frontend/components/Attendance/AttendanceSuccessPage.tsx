import React from 'react';
import { Check, MapPin, Clock, ArrowLeft, Share2, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AttendanceSuccessPageProps {
  courseCode?: string;
  courseName?: string;
  location?: string;
  time?: string;
  onBackToHome?: () => void;
}

export const AttendanceSuccessPage: React.FC<AttendanceSuccessPageProps> = ({
  courseCode = 'CSC301',
  courseName = 'Distributed Systems',
  location = 'Main Auditorium · Block B',
  time = '10:05 AM',
  onBackToHome,
}) => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Header */}
      <header className="p-6 flex items-center justify-between relative z-10">
        <button 
          onClick={handleBackToHome}
          className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Verification Success</span>
        <div className="w-12 h-12"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {/* Success Visual */}
        <div className="relative mb-12">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="w-32 h-32 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_60px_rgba(var(--primary-rgb),0.4)] relative z-20"
            >
               <Check size={64} strokeWidth={4} className="text-[#111111]" />
            </motion.div>
            
            {/* Animated Rings */}
            <motion.div 
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-primary rounded-[2.5rem] z-10"
            />
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-8 -right-8 w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10"
            >
               <Award size={24} className="text-primary" />
            </motion.div>
        </div>

        {/* Text Details */}
        <div className="text-center space-y-4 mb-12">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-headline font-black tracking-tight"
          >
            Attendance<br/>Marked!
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-primary font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2"
          >
             <Zap size={14} fill="currentColor" />
             Mission Accomplished
          </motion.p>
        </div>

        {/* Session Card */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 space-y-6"
        >
          <div className="flex justify-between items-start">
             <div>
                <span className="text-[10px] font-black tracking-widest opacity-40 uppercase mb-1 block">Course Detail</span>
                <h3 className="text-2xl font-headline font-black leading-tight">
                  {courseCode}<br/>{courseName}
                </h3>
             </div>
             <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                <span className="text-[10px] font-black text-primary">VERIFIED</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-white/5 rounded-2xl space-y-1">
                <MapPin size={16} className="text-primary" />
                <p className="text-[10px] font-bold opacity-40 uppercase">Venue</p>
                <p className="text-xs font-black truncate">{location}</p>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl space-y-1">
                <Clock size={16} className="text-primary" />
                <p className="text-[10px] font-bold opacity-40 uppercase">Timestamp</p>
                <p className="text-xs font-black">{time}</p>
             </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Actions */}
      <footer className="p-8 space-y-4 relative z-10">
         <motion.button 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.6 }}
           onClick={handleBackToHome}
           className="w-full h-16 bg-white text-[#111111] rounded-[1.5rem] font-headline font-black text-lg shadow-xl active:scale-[0.98] transition-all"
         >
            Close
         </motion.button>
         
         <motion.button 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.7 }}
           className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] font-headline font-black text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
         >
            <Share2 size={20} />
            Share Proof
         </motion.button>
      </footer>
    </div>
  );
};

export default AttendanceSuccessPage;
