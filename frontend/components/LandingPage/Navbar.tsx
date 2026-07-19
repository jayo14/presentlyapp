import { IconArrowUpRight, IconMenu2, IconX } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { Logo } from "../Logo";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'Mobile App', href: '#mobile-app' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Blog', href: '/blog' },
    ];

    return (
        <nav className="fixed mx-auto top-0 w-full z-50 flex justify-center transition-all duration-700 pointer-events-none">
            <div
                className={cn(
                  "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto flex items-center justify-between px-8 md:px-12",
                   isScrolled
                    ? "mt-6 w-[95%] md:w-[85%] py-4 rounded-full bg-white/70 dark:bg-black/15 backdrop-blur-xl border border-black/5 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                    : "mt-0 w-full py-10 bg-transparent border-transparent"
                )}
            >
                <div className="flex items-center gap-4 group cursor-pointer">
                    <Logo className="scale-110" />
                </div>

                <div className={cn(
                  "hidden lg:flex items-center gap-10 font-medium transition-all duration-500",
                  isScrolled ? "opacity-90 scale-95" : "opacity-100 scale-100"
                )}>
                    {navLinks.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors text-[13px] tracking-tight"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                <div className="hidden sm:flex items-center gap-8">
                    <a href="/login" className="font-medium text-[13px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors px-2">
                        Log in
                    </a>
                    <a href="/register" className="bg-[#231F0F] text-white px-6 py-3 rounded-full hover:bg-sungold hover:text-neutral-900 transition-all active:scale-95 text-[12px] font-medium tracking-tight flex items-center gap-2 shadow-lg border border-white/5">
                        Get started free <IconArrowUpRight size={18} />
                    </a>
                </div>

                <div className="lg:hidden flex items-center">
                        <button
                          onClick={() => setMobileOpen((s) => !s)}
                          aria-label={mobileOpen ? "Close menu" : "Open menu"}
                          className="p-2 rounded-full bg-neutral-100 dark:bg-white/10 border border-black/5 dark:border-white/10 text-neutral-700 dark:text-neutral-200"
                        >
                        {mobileOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown panel */}
            <div className={cn(
              "absolute left-0 right-0 top-full flex justify-center pointer-events-none transition-all duration-500",
              mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
            )}>
                <div className="w-[95%] mt-4 pointer-events-auto lg:hidden">
                        <div className="bg-white/95 dark:bg-[#161616]/95 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] shadow-2xl p-8">
                            <nav className="flex flex-col gap-4 mb-8">
                                {navLinks.map((item) => (
                                    <a
                                      key={item.label}
                                      href={item.href}
                                      className="text-2xl font-medium text-neutral-900 dark:text-neutral-100 hover:text-sungold tracking-tight"
                                      onClick={() => setMobileOpen(false)}
                                    >
                                      {item.label}
                                    </a>
                                ))}
                            </nav>
                            <div className="flex flex-col gap-3">
                                <a href="/login" className="w-full text-center py-4 rounded-2xl border border-black/5 dark:border-white/10 text-neutral-900 dark:text-neutral-100 font-medium tracking-tight text-sm">Log in</a>
                            <a href="/register" className="bg-sungold text-neutral-900 px-6 py-4 rounded-2xl text-sm font-medium tracking-tight flex items-center justify-center gap-2">
                                Get started free <IconArrowUpRight size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
