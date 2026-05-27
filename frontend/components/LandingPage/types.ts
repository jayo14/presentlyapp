import { Icon } from '@phosphor-icons/react';

export interface LandingHeaderProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export interface StatCounterProps {
  value: string;
  label: string;
}

export interface AccordionItemProps {
  question: string;
  answer: string;
  icon?: Icon;
}
