import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

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

    return (
        <nav className="fixed mx-auto top-0 w-full z-50 flex justify-center transition-all duration-700 pointer-events-none">
            <div
                className={`
          transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-auto
          flex items-center justify-between px-4
          ${isScrolled
                        ? 'mt-6 w-[90%] md:w-[80%] py-4  rounded-full bg-surface border border-outline shadow-[0_10px_30px_rgba(2,6,23,0.35)]'
                        : 'mt-4 w-full md:w-[90%] py-8 bg-transparent border-transparent'
                    }
        `}
            >
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-[200px] h-[80px] pointer-events-none">
                    <div className="absolute left-2 top-0 w-40 h-40 bg-primary/6 rounded-full blur-3xl" />
                </div>
                <div className="flex items-center gap-3 group cursor-pointer ml-2">
                    <img src="/logo.png" alt="Logo" className="w-32" />
                    <span className="text-xl font-black tracking-tight text-on-surface">
                        Presently
                    </span>
                </div>

                <div className={`hidden md:flex items-center gap-10 font-semibold transition-all duration-500 ${isScrolled ? 'opacity-90 scale-95' : 'opacity-100 scale-100'}`}>
                    {['How it Works', 'Pricing', 'Blog'].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="text-on-surface/80 hover:text-primary transition-colors text-[14px] tracking-tight leading-relaxed py-2 px-2"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                <div className="hidden sm:flex items-center gap-8">
                    <a href="/login" className="hidden sm:block font-bold text-sm text-on-surface hover:text-primary transition-colors py-2 px-4 leading-relaxed">
                        Log In
                    </a>
                    <a href="/register" className="bg-primary text-on-primary-fixed px-7 py-3 rounded-full hover:shadow-[0_10px_30px_rgba(245,197,24,0.18)] transition-all active:scale-95 text-sm uppercase tracking-tighter flex items-center gap-2 leading-relaxed inline-flex">
                        Join <ArrowUpRight size={24} weight="duotone" />
                    </a>
                </div>

                <div className="sm:hidden flex items-center">
                    <button onClick={() => setMobileOpen((s) => !s)} aria-label={mobileOpen ? "Close menu" : "Open menu"} className="p-2 rounded-md bg-transparent hover:bg-surface-container/50">
                        {mobileOpen ? <X size={24} weight="duotone" className="text-on-surface" /> : <List size={24} weight="duotone" className="text-on-surface" />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown panel directly under header */}
            <div className="absolute left-0 right-0 top-full flex justify-center pointer-events-none">
                <div className={`w-[85%] md:w-[75%] mt-2 px-2 pointer-events-auto md:hidden transition-all duration-200 ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    <div className="bg-surface border border-outline rounded-2xl shadow-lg p-">

                        <nav className="flex flex-col gap-2 mb-4 p-4">
                            <a href="#" className="py-2 text-on-surface hover:text-primary">How it Works</a>
                            <a href="#" className="py-2 text-on-surface hover:text-primary">Pricing</a>
                            <a href="#" className="py-2 text-on-surface hover:text-primary">Blog</a>
                        </nav>

                        <div className="flex flex-col gap-3 px-2">
                            <a href="/login" className="w-full text-center py-3 rounded-xl border border-outline text-on-surface">Log in</a>
                            <a href="/register" className="bg-primary text-on-primary-fixed px-7 py-3 rounded-full hover:shadow-[0_10px_30px_rgba(245,197,24,0.18)] transition-all active:scale-95 text-sm uppercase tracking-tighter flex items-center justify-center gap-2 leading-relaxed inline-flex">
                                Join <ArrowUpRight size={24} weight="duotone" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};