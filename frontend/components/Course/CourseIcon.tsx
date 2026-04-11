import React from 'react';
import { 
  BookOpen, 
  Code, 
  BarChart, 
  ShieldCheck, 
  Smartphone, 
  Brain, 
  Binary,
  Megaphone,
  CreditCard,
  Lightbulb,
  Users,
  Palette,
  Camera,
  Music,
  Ruler,
  Dna,
  Calculator,
  Leaf,
  Book,
  History,
  Globe,
  Briefcase,
  Atom,
  Microscope,
  GraduationCap
} from 'lucide-react';

export type CourseIconVariant = 'circle' | 'square';

export interface CourseIconProps {
  title?: string;
  code?: string;
  category?: string;
  className?: string;
  variant?: CourseIconVariant;
}

const getIconConfig = (title: string = '', code: string = '', category: string = '') => {
  const t = title.toLowerCase();
  const c = code.toLowerCase();
  
  // Technology & Programming
  const isTech = t.includes('web') || t.includes('program') || t.includes('code') || 
                 t.includes('softw') || t.includes('compu') || t.includes('digit') ||
                 t.includes('data') || t.includes('cyber') || t.includes('network') ||
                 t.includes('tech') || t.includes('system') || t.includes('database') ||
                 c.startsWith('csc') || c.startsWith('cit') || c.startsWith('com') || 
                 c.startsWith('inf') || c.startsWith('sen') || category === 'technology';

  if (isTech) {
    if (t.includes('web')) return { Icon: Code, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('data') || t.includes('analys')) return { Icon: BarChart, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('cyber') || t.includes('secur')) return { Icon: ShieldCheck, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('mobile') || t.includes('app')) return { Icon: Smartphone, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('ai') || t.includes('intell') || t.includes('brain') || t.includes('machine')) return { Icon: Brain, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('code') || t.includes('program')) return { Icon: Code, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    return { Icon: Binary, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
  }

  // Business, Economics & Management
  const isBusiness = t.includes('market') || t.includes('busin') || t.includes('manag') || 
                      t.includes('econ') || t.includes('accoun') || t.includes('finan') ||
                      t.includes('entrepr') || t.includes('bank') || t.includes('commerc') ||
                      c.startsWith('acc') || c.startsWith('bus') || c.startsWith('eco') || 
                      c.startsWith('mgt') || c.startsWith('fin') || category === 'business';

  if (isBusiness) {
    if (t.includes('market') || t.includes('advert')) return { Icon: Megaphone, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    if (t.includes('finan') || t.includes('accoun') || t.includes('bank')) return { Icon: CreditCard, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    if (t.includes('entrepr') || t.includes('lead') || t.includes('innov')) return { Icon: Lightbulb, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    return { Icon: Briefcase, color: 'text-amber-600', bgColor: 'bg-amber-100' };
  }

  // Science & Engineering
  const isScience = t.includes('bio') || t.includes('health') || t.includes('math') || 
                     t.includes('scien') || t.includes('chem') || t.includes('physic') || 
                     t.includes('medic') || t.includes('engin') || t.includes('envir') ||
                     c.startsWith('mat') || c.startsWith('chm') || c.startsWith('phy') || 
                     c.startsWith('bio') || c.startsWith('mcb') || c.startsWith('mec') ||
                     c.startsWith('eee') || c.startsWith('cve') || category === 'science';

  if (isScience) {
    if (t.includes('bio') || t.includes('medic') || t.includes('health')) return { Icon: Dna, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (t.includes('math') || t.includes('calc') || t.includes('stat')) return { Icon: Calculator, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (t.includes('physic') || t.includes('atom') || t.includes('nuclear')) return { Icon: Atom, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (t.includes('envir') || t.includes('ecol') || t.includes('plant')) return { Icon: Leaf, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (t.includes('engin') || t.includes('arch') || t.includes('const')) return { Icon: Ruler, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    return { Icon: Microscope, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
  }

  // Humanities & Arts
  const isHumanities = t.includes('hist') || t.includes('liter') || t.includes('geo') || 
                        t.includes('soc') || t.includes('phil') || t.includes('lang') || 
                        t.includes('art') || t.includes('music') || t.includes('design') ||
                        t.includes('psych') || t.includes('law') || t.includes('politi') ||
                        c.startsWith('gst') || c.startsWith('gns') || c.startsWith('eng') || 
                        c.startsWith('his') || c.startsWith('law') || category === 'humanities';

  if (isHumanities) {
    if (t.includes('hist') || t.includes('antiq')) return { Icon: History, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (t.includes('liter') || t.includes('book') || t.includes('lang') || t.includes('engl')) return { Icon: Book, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (t.includes('geo') || t.includes('map') || t.includes('globe')) return { Icon: Globe, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (t.includes('art') || t.includes('design') || t.includes('paint')) return { Icon: Palette, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (t.includes('music')) return { Icon: Music, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (t.includes('psych') || t.includes('sociol') || t.includes('human')) return { Icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { Icon: BookOpen, color: 'text-orange-600', bgColor: 'bg-orange-100' };
  }

  // Default
  return { Icon: GraduationCap, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
};

export default function CourseIcon({ 
  title = '', 
  code = '',
  category = '', 
  className = '', 
  variant = 'square' 
}: CourseIconProps) {
  const { Icon, color, bgColor } = getIconConfig(title, code, category);
  const shapeClass = variant === 'circle' ? 'rounded-full' : 'rounded-2xl';
  
  return (
    <div className={`flex items-center justify-center shrink-0 w-10 h-10 ${shapeClass} ${bgColor} ${color} ${className}`}>
      <Icon size={20} />
    </div>
  );
}
