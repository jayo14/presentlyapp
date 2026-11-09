import { IconArrowUpRight, IconMenu2, IconX, IconBuildingBank, IconSparkles } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { Logo } from "../Logo";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Product', href: '#product' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'LASUSTECH Story', href: '#lasustech-story' },
        { label: 'For Institutions', href: '#institutions' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
    ];

    return (
        <nav className="fixed mx-auto top-0 w-full z-50 flex justify-center transition-all duration-300 pointer-events-none" aria-label="Primary Navigation">
            <div
                className={cn(
                  "transition-all duration-300 pointer-events-auto flex items-center justify-between px-6 md:px-10",
                   isScrolled
                     ? "mt-4 w-[96%] md:w-[90%] lg:w-[88%] py-3 rounded-2xl bg-white/90 dark:bg-[#181612]/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg"
                     : "mt-0 w-full py-6 bg-transparent border-transparent"
                )}
            >
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center gap-2 group cursor-pointer" aria-label="Presently Homepage">
                        <Logo className="scale-105 origin-left" />
                    </a>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sungold/15 text-charcoal-900 dark:text-sungold border border-sungold/30 tracking-tight">
                        Tertiary EdTech
                    </span>
                </div>

                <div className="hidden lg:flex items-center gap-8 font-medium">
                    {navLinks.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors text-[13px] tracking-tight font-medium"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                <div className="hidden sm:flex items-center gap-3">
                    <a
                        href="/login"
                        className="font-medium text-[13px] text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors px-3 py-2 rounded-lg"
                    >
                        Sign in
                    </a>
                    <a
                        href="#institutions"
                        className="hidden xl:inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all border border-black/5 dark:border-white/5"
                    >
                        <IconBuildingBank size={15} className="text-sungold" />
                        Request Demo
                    </a>
                    <a
                        href="/register"
                        className="bg-[#231F0F] text-white hover:bg-sungold hover:text-[#231F0F] px-4 py-2 rounded-xl transition-all active:scale-95 text-[12px] font-semibold tracking-tight flex items-center gap-1.5 shadow-sm border border-black/10"
                    >
                        Start Free <IconArrowUpRight size={16} />
                    </a>
                </div>

                <div className="lg:hidden flex items-center">
                    <button
                        onClick={() => setMobileOpen((s) => !s)}
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        className="p-2.5 rounded-xl bg-neutral-100 dark:bg-white/10 border border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-100 active:scale-95 transition-all"
                    >
                        {mobileOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown drawer */}
            <div
                className={cn(
                    "absolute left-0 right-0 top-full flex justify-center pointer-events-none transition-all duration-300",
                    mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
                )}
            >
                <div className="w-[94%] mt-2 pointer-events-auto lg:hidden">
                    <div className="bg-white dark:bg-[#1A1813] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10 mb-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Navigation</span>
                            <span className="text-[11px] font-medium text-sungold bg-sungold/10 px-2 py-0.5 rounded-md">Nigerian Universities</span>
                        </div>
                        <nav className="flex flex-col gap-2 mb-6">
                            {navLinks.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="py-2.5 px-3 rounded-lg text-base font-medium text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                        <div className="flex flex-col gap-2.5 pt-4 border-t border-black/5 dark:border-white/10">
                            <a
                                href="/register"
                                className="w-full bg-[#231F0F] text-white py-3 rounded-xl text-sm font-semibold tracking-tight flex items-center justify-center gap-2 hover:bg-sungold hover:text-[#231F0F] transition-all"
                                onClick={() => setMobileOpen(false)}
                            >
                                Start Free as Lecturer <IconArrowUpRight size={16} />
                            </a>
                            <a
                                href="#institutions"
                                className="w-full text-center py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 font-medium tracking-tight text-sm hover:bg-neutral-50 dark:hover:bg-white/5 transition-all"
                                onClick={() => setMobileOpen(false)}
                            >
                                Request Campus Demo
                            </a>
                            <a
                                href="/login"
                                className="w-full text-center py-2 text-neutral-600 dark:text-neutral-400 font-medium tracking-tight text-xs hover:text-neutral-900 dark:hover:text-white transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                Already have an account? Sign In
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
