import React from 'react';
import { Logo } from "../Logo";
import { ThemeToggle } from '../ThemeToggle';

export const Footer = () => (
  <footer className="bg-white pt-40 pb-20 px-8 text-neutral-500 border-t border-black/5">
    <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
      <div className="col-span-1 md:col-span-1">
        <Logo className="mb-8 scale-125 origin-left" />
        <p className="text-lg leading-relaxed text-neutral-400 max-w-xs ">The definitive solution for academic accountability and institutional integrity in the digital age.</p>
      </div>

      <div>
        <h4 className="text-neutral-900 font-medium mb-10 tracking-tight text-[11px]">Infrastructure</h4>
        <ul className="space-y-4 text-[13px]  tracking-tight">
          <li><a href="#" className="hover:text-sungold transition-colors">Verification protocol</a></li>
          <li><a href="#" className="hover:text-sungold transition-colors">Sovereign cloud</a></li>
          <li><a href="#" className="hover:text-sungold transition-colors">Data integrity</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-neutral-900 font-medium mb-10 tracking-tight text-[11px]">Governance</h4>
        <ul className="space-y-4 text-[13px]  tracking-tight">
          <li><a href="#" className="hover:text-sungold transition-colors">NUC compliance</a></li>
          <li><a href="#" className="hover:text-sungold transition-colors">CCMAS ready</a></li>
          <li><a href="#" className="hover:text-sungold transition-colors">Ethics board</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-neutral-900 font-medium mb-10 tracking-tight text-[11px]">Support</h4>
        <ul className="space-y-4 text-[13px]  tracking-tight">
          <li><a href="#" className="hover:text-sungold transition-colors">Documentation</a></li>
          <li><a href="#" className="hover:text-sungold transition-colors">System status</a></li>
          <li><a href="#" className="hover:text-sungold transition-colors">Contact registrar</a></li>
        </ul>
      </div>
    </div>

    <div className="max-w-[1440px] mx-auto pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] tracking-tight font-medium text-neutral-300">
      <div className="flex flex-wrap items-center justify-center gap-6 text-center md:text-left">
         <p>© 2025 Presently.</p>
         <div className="hidden md:block w-1 h-1 rounded-full bg-neutral-200" />
         <p className="text-sungold/40">Sovereign academic infrastructure for Nigeria.</p>
      </div>
      <ThemeToggle />
    </div>
  </footer>
);
