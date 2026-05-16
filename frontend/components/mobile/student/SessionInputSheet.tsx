import React, { useState, useEffect } from 'react';
import { Sheet } from '../../Sheet';
import { CircleNotch } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface SessionInputSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionInputSheet: React.FC<SessionInputSheetProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setStatus('idle');
      setKeyboardOffset(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const offset = window.innerHeight - window.visualViewport.height;
        setKeyboardOffset(offset > 100 ? offset : 0);
      }
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSubmit = async () => {
    if (code.length < 8) return;
    setStatus('loading');
    
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      
      // Simulate success
      toast.success("You're marked present ✓");
      onClose();
    } catch (error) {
      setStatus('error');
      // Shake animation will trigger via error status
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setCode(text.trim().substring(0,8).toUpperCase());
    } catch (e) {}
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} side="bottom">
      <div 
        className="px-6 pb-8 transition-transform duration-300"
        style={{ transform: `translateY(-${keyboardOffset}px)` }}
      >
        <div className="w-10 h-1.5 bg-slate-200 dark:bg-white/20 rounded-full mx-auto mb-6" />
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-presently-black dark:text-white">Enter Session Code</h2>
          <p className="text-slate-400 text-sm mt-1">Type the 8-character code your lecturer shared</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setStatus('idle');
            }}
            maxLength={8}
            autoFocus
            className={`
              w-full h-20 bg-off-white dark:bg-charcoal/60 rounded-[20px] 
              border-2 text-center text-5xl font-mono tracking-[0.3em] 
              text-presently-black dark:text-white uppercase outline-none transition-all
              ${status === 'error' 
                ? 'border-soft-coral animate-[shake_0.4s_ease-in-out]' 
                : 'border-slate-200 dark:border-white/10 focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)]'
              }
            `}
          />

          {status === 'error' && (
            <p className="text-soft-coral text-[13px] font-medium text-center">
              Invalid or expired session code
            </p>
          )}

          <div className="flex gap-3">
            <button 
              onClick={handlePaste}
              className="flex-1 h-12 rounded-xl text-slate-500 font-bold active:bg-slate-100 dark:active:bg-white/5 transition-colors"
            >
              Paste from clipboard
            </button>
            <button 
              onClick={() => setCode('')}
              className="flex-1 h-12 rounded-xl text-slate-500 font-bold active:bg-slate-100 dark:active:bg-white/5 transition-colors"
            >
              Clear
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={code.length < 8 || status === 'loading'}
            className="w-full h-14 bg-sungold text-presently-black rounded-2xl font-black text-lg disabled:opacity-40 flex items-center justify-center transition-all active:scale-[0.98]"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <CircleNotch size={20} className="animate-spin" /> Verifying...
              </span>
            ) : (
              'Verify Attendance'
            )}
          </button>
        </div>
      </div>
    </Sheet>
  );
};
