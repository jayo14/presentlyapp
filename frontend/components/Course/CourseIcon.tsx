import React from 'react';
import { 
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
  BookOpen,
  Atom,
  Microscope,
  Globe,
  Briefcase
} from 'lucide-react';

export type CourseCategory = 'technology' | 'business' | 'creative' | 'science' | 'humanities' | 'other';

interface IconConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export const getCourseIcon = (title: string, category?: CourseCategory): IconConfig => {
  const t = title.toLowerCase();
  
  // Technology & Programming
  if (t.includes('web') || t.includes('program') || t.includes('code') || t.includes('software') || t.includes('comput') || category === 'technology') {
    if (t.includes('web')) return { icon: <Code size={24} />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('data') || t.includes('analysis')) return { icon: <BarChart size={24} />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('cyber') || t.includes('security')) return { icon: <ShieldCheck size={24} />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('mobile') || t.includes('app')) return { icon: <Smartphone size={24} />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    if (t.includes('ai') || t.includes('machine') || t.includes('intelligence')) return { icon: <Brain size={24} />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    return { icon: <Binary size={24} />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
  }

  // Business & Management
  if (t.includes('market') || t.includes('business') || t.includes('manage') || t.includes('econ') || t.includes('account') || category === 'business') {
    if (t.includes('market')) return { icon: <Megaphone size={24} />, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    if (t.includes('finance') || t.includes('account') || t.includes('bank')) return { icon: <CreditCard size={24} />, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    if (t.includes('entrep')) return { icon: <Lightbulb size={24} />, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    if (t.includes('lead')) return { icon: <Users size={24} />, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    return { icon: <Briefcase size={24} />, color: 'text-amber-600', bgColor: 'bg-amber-100' };
  }

  // Creative Arts
  if (t.includes('design') || t.includes('art') || t.includes('music') || t.includes('photo') || t.includes('arch') || category === 'creative') {
    if (t.includes('design') || t.includes('graphic')) return { icon: <Palette size={24} />, color: 'text-rose-600', bgColor: 'bg-rose-100' };
    if (t.includes('photo')) return { icon: <Camera size={24} />, color: 'text-rose-600', bgColor: 'bg-rose-100' };
    if (t.includes('music')) return { icon: <Music size={24} />, color: 'text-rose-600', bgColor: 'bg-rose-100' };
    if (t.includes('arch')) return { icon: <Ruler size={24} />, color: 'text-rose-600', bgColor: 'bg-rose-100' };
    return { icon: <Palette size={24} />, color: 'text-rose-600', bgColor: 'bg-rose-100' };
  }

  // Science & Academics
  if (t.includes('bio') || t.includes('health') || t.includes('math') || t.includes('envir') || t.includes('science') || t.includes('chem') || t.includes('physic') || category === 'science') {
    if (t.includes('bio') || t.includes('health') || t.includes('medic')) return { icon: <Dna size={24} />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (t.includes('math') || t.includes('calc') || t.includes('stat')) return { icon: <Calculator size={24} />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (t.includes('envir') || t.includes('eco') || t.includes('leaf')) return { icon: <Leaf size={24} />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (t.includes('physic')) return { icon: <Atom size={24} />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    return { icon: <Microscope size={24} />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
  }

  // Humanities
  if (t.includes('hist') || t.includes('liter') || t.includes('geo') || t.includes('soc') || t.includes('phil') || t.includes('lang') || category === 'humanities') {
    if (t.includes('hist')) return { icon: <History size={24} />, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (t.includes('liter') || t.includes('book')) return { icon: <Book size={24} />, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (t.includes('geo')) return { icon: <Globe size={24} />, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { icon: <BookOpen size={24} />, color: 'text-orange-600', bgColor: 'bg-orange-100' };
  }

  // Default
  return { icon: <BookOpen size={24} />, color: 'text-primary', bgColor: 'bg-primary/10' };
};

interface CourseIconProps {
  title: string;
  category?: CourseCategory;
  className?: string;
  variant?: 'circle' | 'square';
}

const CourseIcon: React.FC<CourseIconProps> = ({ title, category, className = '', variant = 'square' }) => {
  const { icon, color, bgColor } = getCourseIcon(title, category);
  
  const shapeClass = variant === 'circle' ? 'rounded-full' : 'rounded-2xl';
  
  return (
    <div className={`flex items-center justify-center ${shapeClass} ${bgColor} ${color} ${className}`}>
      {icon}
    </div>
  );
};

export default CourseIcon;
