import React from 'react';
import { FileQuestion, ArrowLeft, Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { motion } from 'framer-motion';
import { SEO } from './SEO';

export const NotFound: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-surface text-text flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* SEO: Prevent indexing of not-found page. */}
                <SEO
                    title="Page Not Found"
                    description="The page you requested does not exist on Presently."
                    canonicalPath="/404"
                    noIndex
                />
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center text-center max-w-md w-full"
        >
            <div className="relative mb-10">
                <div className="text-[10rem] font-bold text-text leading-none select-none tracking-tighter">404</div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-surface p-6 rounded-3xl border border-outline shadow-2xl"
                    >
                        <FileQuestion size={48} className="text-primary" />
                    </motion.div>
                </div>
            </div>

            <h2 className="font-headline text-3xl font-bold mb-3 text-text">Page Not Found</h2>
            <p className="text-textMuted mb-8 leading-relaxed">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <div className="flex flex-col w-full gap-3">
                 <div className="relative w-full mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search for pages..." 
                        className="w-full bg-surface border border-outline rounded-xl py-3 pl-10 pr-4 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button onClick={onBack} size="lg" className="flex-1 h-12">
                        <ArrowLeft size={18} className="mr-2" />
                        Go Back
                    </Button>
                    <Button variant="secondary" size="lg" className="flex-1 h-12" onClick={() => window.location.href = '/'}>
                        <Home size={18} className="mr-2" />
                        Home
                    </Button>
                </div>
                                <div className="text-sm mt-3">
                                    <Link to="/universities" className="text-primary hover:underline">
                                        Browse University Pages
                                    </Link>
                                </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-outline w-full flex justify-between items-center text-xs text-textMuted font-mono">
                <span>ERR_404_NOT_FOUND</span>
                <span>ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            </div>
        </motion.div>
    </div>
  );
};