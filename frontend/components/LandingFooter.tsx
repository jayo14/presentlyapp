import React from 'react';
import { Twitter, Instagram, Linkedin } from 'lucide-react';
import { Logo } from './Logo';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#141414] text-white py-20 border-t border-[#2A2A2A]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          <div className="lg:col-span-2 space-y-6">
            <Logo showText={true} variant="dark" />
            <div className="flex gap-4">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-sungold transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><button className="hover:text-sungold transition-colors">How it Works</button></li>
              <li><button className="hover:text-sungold transition-colors">For Schools</button></li>
              <li><button className="hover:text-sungold transition-colors">Pricing</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><button className="hover:text-sungold transition-colors">About</button></li>
              <li><button className="hover:text-sungold transition-colors">Contact</button></li>
              <li><button className="hover:text-sungold transition-colors">Careers</button></li>
              <li><button className="hover:text-sungold transition-colors">Help Center</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><button className="hover:text-sungold transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-sungold transition-colors">Terms of Service</button></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[#2A2A2A] flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
          <p>
            © {new Date().getFullYear()} Presently. <span className="text-sungold">GPS-Verified Attendance.</span>
          </p>
          <p>Made with care in Lagos, Nigeria. 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
};
