import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'INITIALIZING' }) => {
  return (
    <div className="fixed inset-0 z-[1000] bg-white dark:bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="relative flex flex-col items-center gap-16">
        {/* Central Kinetic Loader */}
        <div className="relative w-32 h-32">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 rounded-[2.5rem] border-[3px] border-primary/10 shadow-[0_0_40px_rgba(0,0,0,0.05)]"
           />
           <motion.div 
             animate={{ rotate: -360 }}
             transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
             className="absolute inset-4 rounded-[2rem] border-[2px] border-primary/20"
           />
           <motion.div 
             animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute inset-8 rounded-full bg-primary/10 blur-xl"
           />
           
           <div className="absolute inset-0 flex items-center justify-center">
              <motion.img 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                src="/logo.png" 
                alt="Logo" 
                className="w-16 h-16 object-contain z-10 drop-shadow-2xl"
              />
           </div>
        </div>

        {/* Intelligence Telemetry */}
        <div className="flex flex-col items-center gap-6">
           <div className="flex flex-col items-center gap-2">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-black tracking-[0.4em] text-primary uppercase"
              >
                Presently Identity Protocol
              </motion.div>
              <h1 className="text-3xl font-headline font-black text-text dark:text-white tracking-tighter">
                {message.toUpperCase()}
              </h1>
           </div>

           {/* Animated Data Stream */}
           <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: [4, 16, 4],
                    opacity: [0.2, 1, 0.2]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  className="w-1 bg-primary rounded-full"
                />
              ))}
           </div>
        </div>
      </div>

      {/* Footer Metadata */}
      <div className="absolute bottom-12 flex gap-12 text-[8px] font-black uppercase tracking-[0.3em] text-textMuted/40">
         <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
            Core: Established
         </div>
         <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
            Security: Active
         </div>
         <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
            V: 2.0.4 Premium
         </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
