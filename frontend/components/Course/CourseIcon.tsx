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
  category?: string;
  className?: string;
  variant?: CourseIconVariant;
}

const getIconConfig = (title: string = '', category: string = '') => {
  const t = title.toLowerCase();
  
  // Technology & Programming
  if (t.includes('web') || t.includes('program') || t.includes('code') || t.includes('software') || t.includes('comput') || category === 'technology') {
    if (t.includes('web')) return { Icon: Code, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('data') || t.includes('analysis')) return { Icon: BarChart, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('cyber') || t.includes('security')) return { Icon: ShieldCheck, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('mobile') || t.includes('app')) return { Icon: Smartphone, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('ai') || t.includes('machine')) return { Icon: Brain, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    return { Icon: Binary, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
  }

  // Business & Management
  if (t.includes('market') || t.includes('business') || t.includes('manage') || t.includes('econ') || t.includes('account') || category === 'business') {
    if (t.includes('market')) return { Icon: Megaphone, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    if (t.includes('finance') || t.includes('account')) return { Icon: CreditCard, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    if (t.includes('entrep')) return { Icon: Lightbulb, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    return { Icon: Briefcase, color: 'text-amber-600', bgColor: 'bg-amber-100' };
  }

  // Science & Academics
  if (t.includes('bio') || t.includes('health') || t.includes('math') || t.includes('science') || t.includes('chem') || t.includes('physic') || category === 'science') {
    if (t.includes('bio') || t.includes('medic')) return { Icon: Dna, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (t.includes('math') || t.includes('calc')) return { Icon: Calculator, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (t.includes('physic')) return { Icon: Atom, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    return { Icon: Microscope, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
  }

  // Humanities
  if (t.includes('hist') || t.includes('liter') || t.includes('geo') || t.includes('soc') || t.includes('phil') || t.includes('lang') || category === 'humanities') {
    if (t.includes('hist')) return { Icon: History, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (t.includes('liter') || t.includes('book')) return { Icon: Book, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (t.includes('geo')) return { Icon: Globe, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { Icon: BookOpen, color: 'text-orange-600', bgColor: 'bg-orange-100' };
  }

  // Default
  return { Icon: GraduationCap, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
};

export default function CourseIcon({ 
  title = '', 
  category = '', 
  className = '', 
  variant = 'square' 
}: CourseIconProps) {
  const { Icon, color, bgColor } = getIconConfig(title, category);
  const shapeClass = variant === 'circle' ? 'rounded-full' : 'rounded-2xl';
  
  return (
    <div className={`flex items-center justify-center shrink-0 w-10 h-10 ${shapeClass} ${bgColor} ${color} ${className}`}>
      <Icon size={20} />
    </div>
  );
}
