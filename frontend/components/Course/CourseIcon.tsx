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
    let Icon = Binary;
    if (t.includes('web')) Icon = Code;
    else if (t.includes('data') || t.includes('analys')) Icon = BarChart;
    else if (t.includes('cyber') || t.includes('secur')) Icon = ShieldCheck;
    else if (t.includes('mobile') || t.includes('app')) Icon = Smartphone;
    else if (t.includes('ai') || t.includes('intell') || t.includes('brain') || t.includes('machine')) Icon = Brain;
    else if (t.includes('code') || t.includes('program')) Icon = Code;

    return { Icon, color: 'text-primary', bgColor: 'bg-primary/10', ringColor: 'ring-primary/20' };
  }

  // Business, Economics & Management
  const isBusiness = t.includes('market') || t.includes('busin') || t.includes('manag') ||
    t.includes('econ') || t.includes('accoun') || t.includes('finan') ||
    t.includes('entrepr') || t.includes('bank') || t.includes('commerc') ||
    c.startsWith('acc') || c.startsWith('bus') || c.startsWith('eco') ||
    c.startsWith('mgt') || c.startsWith('fin') || category === 'business';

  if (isBusiness) {
    let Icon = Briefcase;
    if (t.includes('market') || t.includes('advert')) Icon = Megaphone;
    else if (t.includes('finan') || t.includes('accoun') || t.includes('bank')) Icon = CreditCard;
    else if (t.includes('entrepr') || t.includes('lead') || t.includes('innov')) Icon = Lightbulb;

    return { Icon, color: 'text-textMuted', bgColor: 'bg-textMuted/10', ringColor: 'ring-textMuted/20' };
  }

  // Science & Engineering
  const isScience = t.includes('bio') || t.includes('health') || t.includes('math') ||
    t.includes('scien') || t.includes('chem') || t.includes('physic') ||
    t.includes('medic') || t.includes('engin') || t.includes('envir') ||
    c.startsWith('mat') || c.startsWith('chm') || c.startsWith('phy') ||
    c.startsWith('bio') || c.startsWith('mcb') || c.startsWith('mec') ||
    c.startsWith('eee') || c.startsWith('cve') || category === 'science';

  if (isScience) {
    let Icon = Microscope;
    if (t.includes('bio') || t.includes('medic') || t.includes('health')) Icon = Dna;
    else if (t.includes('math') || t.includes('calc') || t.includes('stat')) Icon = Calculator;
    else if (t.includes('physic') || t.includes('atom') || t.includes('nuclear')) Icon = Atom;
    else if (t.includes('envir') || t.includes('ecol') || t.includes('plant')) Icon = Leaf;
    else if (t.includes('engin') || t.includes('arch') || t.includes('const')) Icon = Ruler;

    return { Icon, color: 'text-primary', bgColor: 'bg-textMuted/10', ringColor: 'ring-primary/10' };
  }

  // Humanities & Arts
  const isHumanities = t.includes('hist') || t.includes('liter') || t.includes('geo') ||
    t.includes('soc') || t.includes('phil') || t.includes('lang') ||
    t.includes('art') || t.includes('music') || t.includes('design') ||
    t.includes('psych') || t.includes('law') || t.includes('politi') ||
    c.startsWith('gst') || c.startsWith('gns') || c.startsWith('eng') ||
    c.startsWith('his') || c.startsWith('law') || category === 'humanities';

  if (isHumanities) {
    let Icon = BookOpen;
    if (t.includes('hist') || t.includes('antiq')) Icon = History;
    else if (t.includes('liter') || t.includes('book') || t.includes('lang') || t.includes('engl')) Icon = Book;
    else if (t.includes('geo') || t.includes('map') || t.includes('globe')) Icon = Globe;
    else if (t.includes('art') || t.includes('design') || t.includes('paint')) Icon = Palette;
    else if (t.includes('music')) Icon = Music;
    else if (t.includes('psych') || t.includes('sociol') || t.includes('human')) Icon = Users;

    return { Icon, color: 'text-textMuted', bgColor: 'bg-primary/10', ringColor: 'ring-textMuted/10' };
  }

  // Default
  return { Icon: GraduationCap, color: 'text-primary', bgColor: 'bg-primary/10', ringColor: 'ring-primary/20' };
};

export default function CourseIcon({
  title = '',
  code = '',
  category = '',
  className = '',
  variant = 'square'
}: CourseIconProps) {
  const { Icon, color, bgColor, ringColor } = getIconConfig(title, code, category);
  const shapeClass = variant === 'circle' ? 'rounded-full' : 'rounded-2xl';

  return (
    <div className={`flex items-center justify-center shrink-0 w-10 h-10 ring-4 ${ringColor} ${shapeClass} ${bgColor} ${color} ${className}`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
  );
}
