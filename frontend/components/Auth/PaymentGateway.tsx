import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, ShieldCheck, CheckCircle2, Loader2, X, Smartphone, Globe, Copy, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { UserRole } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface PaymentGatewayProps {
  role: UserRole;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({ role, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  
  const { modalProps } = useModalAccessibility(true, onCancel);
  
  // Form States
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Pricing Logic
  const isStudentRate = role === UserRole.STUDENT || role === UserRole.CLASS_REP;
  const amount = isStudentRate ? '1,000' : '3,000';
  const planName = isStudentRate ? 'Student Semester Plan' : 'Lecturer Semester Plan';

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handlePay = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStep('processing');
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      
      // Auto close after success
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 4000);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      // Could add a toast here, but simple interaction for now
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        {...modalProps}
        aria-labelledby="payment-title"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface border border-outline rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden outline-none"
      >
        {/* Left Side: Order Summary */}
        <div className="w-full md:w-5/12 bg-background p-6 md:p-8 border-b md:border-b-0 md:border-r border-outline flex flex-col relative overflow-hidden shrink-0">
           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-primary font-bold mb-6 md:mb-8">
                  <div className="bg-primary/20 p-2 rounded-lg"><CreditCard size={20} /></div>
                  <span>Presently Checkout</span>
              </div>

              <div className="mb-6 md:mb-8">
                  <p className="text-textMuted text-sm mb-1">Amount to pay</p>
                  <h2 className="font-headline text-3xl md:text-4xl font-bold text-text">₦{amount}<span className="text-lg text-textMuted font-normal">.00</span></h2>
                  <div className="inline-block bg-surface border border-outline rounded-full px-3 py-1 text-xs text-textMuted mt-3">
                     Per Semester
                  </div>
              </div>

              <div className="space-y-4 mb-8 flex-1 hidden md:block">
                  <div className="flex justify-between items-center py-3 border-b border-outline">
                      <span className="text-textMuted text-sm">Plan</span>
                      <span className="text-text font-medium">{planName}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-outline">
                      <span className="text-textMuted text-sm">Billing Cycle</span>
                      <span className="text-text font-medium">Semester (4 Months)</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-outline">
                      <span className="text-textMuted text-sm">Access Level</span>
                      <span className="text-text font-medium">Full Access</span>
                  </div>
              </div>
              
              {/* Mobile Only Compact Plan Info */}
              <div className="md:hidden mb-6 flex justify-between items-center bg-surface/50 p-3 rounded-lg border border-outline/50">
                  <span className="text-textMuted text-sm">Plan</span>
                  <span className="text-text font-medium text-sm">{planName}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-textMuted bg-surface p-3 rounded-lg border border-outline">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span>Payments are secure and encrypted.</span>
              </div>
           </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-full md:w-7/12 p-6 md:p-8 bg-surface relative flex flex-col md:overflow-y-auto">
            <button onClick={onCancel} className="absolute top-4 right-4 text-textMuted hover:text-text p-2 z-10" aria-label="Close dialog">
                <X size={20} />
            </button>

            {step === 'details' && (
                <div className="h-full flex flex-col">
                    <h3 id="payment-title" className="font-headline text-xl font-bold text-text mb-6">Payment Details</h3>
                    
                    {/* Payment Method Tabs */}
                    <div className="flex gap-3 mb-6">
                        <button 
                            type="button" 
                            onClick={() => setPaymentMethod('card')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-white text-black shadow-lg shadow-white/10 ring-2 ring-white' : 'bg-zinc-800 text-muted-foreground hover:bg-zinc-700'}`}
                        >
                            <CreditCard size={16} /> Card
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setPaymentMethod('transfer')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'transfer' ? 'bg-white text-black shadow-lg shadow-white/10 ring-2 ring-white' : 'bg-zinc-800 text-muted-foreground hover:bg-zinc-700'}`}
                        >
                            <Smartphone size={16} /> Transfer
                        </button>
                         <button 
                            type="button" 
                            onClick={() => setPaymentMethod('ussd')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'ussd' ? 'bg-white text-black shadow-lg shadow-white/10 ring-2 ring-white' : 'bg-zinc-800 text-muted-foreground hover:bg-zinc-700'}`}
                        >
                            <Globe size={16} /> USSD
                        </button>
                    </div>

                    {paymentMethod === 'card' && (
                        <form onSubmit={handlePay} className="flex-1 flex flex-col space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-xs font-medium text-textMuted mb-1.5 uppercase tracking-wider">Card Number</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="0000 0000 0000 0000" 
                                        className="w-full bg-background border border-outline rounded-xl px-4 py-3.5 text-text placeholder:text-textMuted focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        maxLength={19}
                                        required
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                        <div className="w-8 h-5 bg-surfaceHigh rounded flex items-center justify-center text-[8px] text-textMuted font-bold border border-outline">VISA</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-medium text-textMuted mb-1.5 uppercase tracking-wider">Expiry Date</label>
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY" 
                                        className="w-full bg-background border border-outline rounded-xl px-4 py-3.5 text-text placeholder:text-textMuted focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono text-center"
                                        value={expiry}
                                        onChange={(e) => {
                                            let v = e.target.value.replace(/[^0-9]/g, '');
                                            if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                            setExpiry(v);
                                        }}
                                        maxLength={5}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-textMuted mb-1.5 uppercase tracking-wider">CVV / CVC</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            placeholder="123" 
                                            className="w-full bg-background border border-outline rounded-xl px-4 py-3.5 text-text placeholder:text-textMuted focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono text-center"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                                            maxLength={3}
                                            required
                                        />
                                        <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted" />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-textMuted mb-1.5 uppercase tracking-wider">Cardholder Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter name on card" 
                                    className="w-full bg-background border border-outline rounded-xl px-4 py-3.5 text-text placeholder:text-textMuted focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div className="pt-6 mt-auto border-t border-outline">
                                <Button type="submit" className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all">
                                    Pay ₦{amount}
                                </Button>
                                <p className="text-center text-xs text-textMuted mt-4">
                                    By clicking Pay, you agree to our <a href="#" className="underline hover:text-text">Terms of Service</a>.
                                </p>
                            </div>
                        </form>
                    )}

                    {paymentMethod === 'transfer' && (
                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-background border border-outline rounded-2xl p-6 text-center mb-6 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-white to-primary"></div>
                                
                                <p className="text-textMuted text-sm mb-2">Transfer <span className="text-text font-bold">₦{amount}</span> to:</p>
                                <h3 className="font-headline text-2xl font-bold text-text mb-1">Presently Limited</h3>
                                <p className="text-textMuted text-sm mb-6">Zenith Bank</p>
                                
                                <div 
                                    className="bg-surface border border-outline rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-primary hover:bg-surfaceHigh transition-all active:scale-[0.98]"
                                    onClick={() => copyToClipboard('1012345678')}
                                >
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-wider text-textMuted font-semibold mb-1">Account Number</p>
                                        <p className="text-2xl font-mono font-bold text-primary tracking-widest">1012345678</p>
                                    </div>
                                    <div className="bg-surfaceHigh p-2 rounded-lg group-hover:bg-primary group-hover:text-black transition-colors">
                                        <Copy size={20} />
                                    </div>
                                </div>
                                
                                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 py-2 rounded-lg border border-yellow-500/20">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                    Account expires in 30:00
                                </div>
                            </div>

                            <div className="bg-surface/50 p-4 rounded-xl border border-outline mb-6 text-xs text-textMuted leading-relaxed flex gap-3">
                                <AlertCircle size={16} className="text-textMuted shrink-0 mt-0.5" />
                                <p>Please ensure you transfer the exact amount. Your account will be activated automatically once the transfer is confirmed.</p>
                            </div>
                            
                            <div className="mt-auto pt-4">
                                <Button onClick={() => handlePay()} className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20">
                                    I have sent the money
                                </Button>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'ussd' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="w-24 h-24 bg-surfaceHigh/50 rounded-full flex items-center justify-center mb-6">
                                <Globe size={40} className="text-textMuted" />
                            </div>
                            <h3 className="font-headline text-xl font-bold text-text mb-2">USSD Payment</h3>
                            <p className="text-textMuted text-sm max-w-xs mx-auto mb-8">
                                Select your bank to generate a USSD code for quick payment.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {['GTBank', 'Zenith', 'UBA', 'Access'].map(bank => (
                                    <button key={bank} className="p-3 bg-background border border-outline rounded-xl hover:border-primary hover:text-primary transition-colors text-sm font-medium text-textMuted">
                                        *{Math.floor(Math.random() * 900) + 100}# <span className="block text-xs text-textMuted font-normal">{bank}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {step === 'processing' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 border-2 border-outline rounded-full"></div>
                        <div className="w-24 h-24 border-2 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                        <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-textMuted" size={24} />
                    </div>
                    <div>
                        <h3 className="font-headline text-xl font-bold text-text mb-2">
                            {paymentMethod === 'transfer' ? 'Verifying Transfer...' : 'Processing Payment...'}
                        </h3>
                        <p className="text-textMuted text-sm">Please do not close this window.</p>
                    </div>
                    <div className="w-full max-w-xs bg-surfaceHigh h-1.5 rounded-full overflow-hidden mt-8">
                        <div className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite] w-1/3 rounded-full"></div>
                    </div>
                </div>
            )}

            {step === 'success' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                    >
                        <CheckCircle2 size={48} className="text-black" />
                    </motion.div>
                    <div>
                        <h3 className="font-headline text-2xl font-bold text-text mb-2">Payment Successful!</h3>
                        <p className="text-textMuted text-sm">Your {planName} is now active.</p>
                    </div>
                    <div className="bg-surfaceHigh/50 p-4 rounded-xl border border-outline w-full max-w-xs">
                        <div className="flex justify-between text-sm mb-2">
                             <span className="text-textMuted">Transaction Ref</span>
                             <span className="text-text font-mono">#PRS-{Math.floor(Math.random() * 1000000)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                             <span className="text-textMuted">Amount Paid</span>
                             <span className="text-text font-bold">₦{amount}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};