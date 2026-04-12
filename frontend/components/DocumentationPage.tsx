import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Play,
  HelpCircle,
  CheckCircle2,
  Book,
  Shield,
  Zap,
  Search,
  ChevronRight,
  MessageCircle,
  X,
  GraduationCap,
  ServerCog,
  LifeBuoy,
  Workflow,
  Lock,
  Globe,
  Link2,
  Database,
} from 'lucide-react';
import { Button } from './Button';
import { LandingHeader } from './LandingHeader';
import { SEO } from './SEO';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

type VideoItem = {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
};

type SearchEntry = {
  id: string;
  targetId: string;
  sectionId: string;
  title: string;
  detail: string;
  kind: 'video' | 'quick-start' | 'guide' | 'faq' | 'troubleshooting' | 'security' | 'integration' | 'resource';
};

const videos: VideoItem[] = [
  {
    id: 'video-getting-started',
    title: 'Getting Started with Presently',
    description: 'Set up your account, assign your role, and configure institutional defaults.',
    duration: '3:45',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'video-lecturer-sessions',
    title: 'For Lecturers: Creating Sessions',
    description: 'Create geofenced sessions, enforce location checks, and resolve exceptions quickly.',
    duration: '5:20',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=60',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 'video-students-attendance',
    title: 'For Students: Marking Attendance',
    description: 'Verify attendance with GPS, check status, and recover from common mobile issues.',
    duration: '2:15',
    thumbnail: 'https://images.unsplash.com/photo-1523240715639-99a2d0211281?w=800&auto=format&fit=crop&q=60',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'video-admin-analytics',
    title: 'Admin Dashboard & Analytics',
    description: 'Use institutional reports, compliance logs, and exports for accreditation workflows.',
    duration: '7:10',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
];

const quickStartTracks = [
  {
    id: 'quick-lecturer',
    title: 'Lecturer Quick Start',
    intro: 'Get attendance running in under 10 minutes.',
    steps: [
      { id: 'quick-lecturer-1', text: 'Create your first course and class roster.' },
      { id: 'quick-lecturer-2', text: 'Start a location-verified session with time limits.' },
      { id: 'quick-lecturer-3', text: 'Monitor live check-ins and resolve edge cases.' },
    ],
  },
  {
    id: 'quick-student',
    title: 'Student Quick Start',
    intro: 'Never miss a valid check-in again.',
    steps: [
      { id: 'quick-student-1', text: 'Complete device registration and location permission setup.' },
      { id: 'quick-student-2', text: 'Open active sessions and verify attendance in one tap.' },
      { id: 'quick-student-3', text: 'Review attendance history and eligibility warnings.' },
    ],
  },
  {
    id: 'quick-admin',
    title: 'Admin Quick Start',
    intro: 'Launch institution-wide attendance standards.',
    steps: [
      { id: 'quick-admin-1', text: 'Configure departments, courses, and lecturer permissions.' },
      { id: 'quick-admin-2', text: 'Enable policy rules for attendance compliance.' },
      { id: 'quick-admin-3', text: 'Export audit-ready reports for management and accreditation.' },
    ],
  },
];

const guideSections = [
  {
    id: 'guide-lecturer',
    title: 'Lecturer Masterclass',
    items: [
      { id: 'guide-lecturer-1', text: 'Initializing geofenced classrooms' },
      { id: 'guide-lecturer-2', text: 'Managing manual exceptions responsibly' },
      { id: 'guide-lecturer-3', text: 'Exporting accreditation-ready reports' },
      { id: 'guide-lecturer-4', text: 'Analyzing student engagement trends' },
    ],
  },
  {
    id: 'guide-student',
    title: 'Student Success Guide',
    items: [
      { id: 'guide-student-1', text: 'Resolving GPS accuracy issues' },
      { id: 'guide-student-2', text: 'Viewing course eligibility status' },
      { id: 'guide-student-3', text: 'Handling device registration safely' },
      { id: 'guide-student-4', text: 'Customizing notifications for classes' },
    ],
  },
  {
    id: 'guide-admin',
    title: 'Administrator Operations',
    items: [
      { id: 'guide-admin-1', text: 'Managing institutions, departments, and user roles' },
      { id: 'guide-admin-2', text: 'Reviewing system logs and attendance anomalies' },
      { id: 'guide-admin-3', text: 'Applying policy changes across cohorts' },
      { id: 'guide-admin-4', text: 'Preparing term-end compliance packs' },
    ],
  },
];

const implementationModules = [
  {
    id: 'impl-auth',
    title: 'Authentication & Access Control',
    detail: 'Role-aware onboarding, protected routes, and session lifecycle management.',
  },
  {
    id: 'impl-attendance',
    title: 'Attendance Engine',
    detail: 'Session creation, geofence validation, check-in processing, and exception handling.',
  },
  {
    id: 'impl-analytics',
    title: 'Analytics & Reporting',
    detail: 'Student trends, course performance, exports, and accreditation evidence trails.',
  },
  {
    id: 'impl-notifications',
    title: 'Notifications & Messaging',
    detail: 'Critical reminders, attendance alerts, and institutional communication workflows.',
  },
];

const faqItems = [
  {
    id: 'faq-gps',
    q: 'How accurate is the GPS verification?',
    a: 'Presently uses multi-source geolocation (GPS, cell, and WiFi) to improve reliability in dense campus environments.',
  },
  {
    id: 'faq-battery',
    q: "What happens if a student's battery dies?",
    a: 'Lecturers can apply a short manual verification window for physically present students.',
  },
  {
    id: 'faq-tracking',
    q: 'Is student location tracked all day?',
    a: 'No. Location access is used only during check-in verification windows.',
  },
  {
    id: 'faq-proxy',
    q: 'How does the platform prevent proxy check-ins?',
    a: 'Device fingerprint checks and session consistency checks help identify suspicious activity.',
  },
  {
    id: 'faq-late',
    q: 'Can lecturers allow late attendance?',
    a: 'Yes. Session rules can define late windows and attendance status outcomes.',
  },
  {
    id: 'faq-export',
    q: 'Can we export reports for audits?',
    a: 'Yes. Reports can be exported in formats suitable for audit, compliance, and administrative review.',
  },
];

const troubleshootingItems = [
  {
    id: 'trouble-location',
    title: 'Location Not Found',
    description: 'Enable high-accuracy mode, disable spoofing tools, and retry from inside the class geofence.',
    icon: Zap,
  },
  {
    id: 'trouble-session',
    title: 'Session Not Appearing',
    description: 'Confirm your enrollment and verify that the session is active for your course group.',
    icon: Search,
  },
  {
    id: 'trouble-device',
    title: 'Device Registration Issue',
    description: 'Refresh your auth session and re-bind your device from profile security settings.',
    icon: Shield,
  },
  {
    id: 'trouble-support',
    title: 'Support Escalation',
    description: 'Generate a debug token in settings and send it with screenshots to support.',
    icon: MessageCircle,
  },
];

const securityStandards = [
  { id: 'security-1', title: 'Verified sessions', detail: 'Only authorized roles can create and manage attendance sessions.' },
  { id: 'security-2', title: 'Least-privilege access', detail: 'Role boundaries reduce accidental access to sensitive records.' },
  { id: 'security-3', title: 'Tamper-aware logs', detail: 'Administrative events are captured for review and investigations.' },
  { id: 'security-4', title: 'Privacy-respecting location checks', detail: 'Location is used for attendance validation only, not continuous tracking.' },
];

const integrations = [
  { id: 'integration-1', title: 'LMS-ready workflows', detail: 'Map attendance outcomes into learning and grading pipelines.' },
  { id: 'integration-2', title: 'CSV and report exports', detail: 'Deliver reports into existing institutional governance processes.' },
  { id: 'integration-3', title: 'Notification channels', detail: 'Coordinate reminders through push and institutional communication layers.' },
  { id: 'integration-4', title: 'Operational analytics feeds', detail: 'Track usage, trends, and compliance over the academic term.' },
];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const DocumentationPage: React.FC = () => {
  const targetRefs = useRef<Record<string, HTMLElement | null>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [highlightedTargetId, setHighlightedTargetId] = useState<string>('');
  const [highlightedTerm, setHighlightedTerm] = useState<string>('');
  const { modalProps } = useModalAccessibility(Boolean(activeVideo), () => setActiveVideo(null));

  const searchEntries = useMemo<SearchEntry[]>(
    () => [
      { id: 'hero-title', targetId: 'hero-title', sectionId: 'hero', title: 'Documentation and Resources', detail: 'Central help hub for Presently.', kind: 'resource' },
      { id: 'hero-subtitle', targetId: 'hero-subtitle', sectionId: 'hero', title: 'Quick start guides, tutorials, and references', detail: 'Deploy and operate Presently with confidence.', kind: 'resource' },
      ...videos.map((video) => ({
        id: `search-${video.id}`,
        targetId: video.id,
        sectionId: 'training-videos',
        title: video.title,
        detail: `${video.description} (${video.duration})`,
        kind: 'video' as const,
      })),
      ...quickStartTracks.flatMap((track) => [
        {
          id: `search-${track.id}`,
          targetId: track.id,
          sectionId: 'quick-start',
          title: track.title,
          detail: track.intro,
          kind: 'quick-start' as const,
        },
        ...track.steps.map((step) => ({
          id: `search-${step.id}`,
          targetId: step.id,
          sectionId: 'quick-start',
          title: step.text,
          detail: track.title,
          kind: 'quick-start' as const,
        })),
      ]),
      ...guideSections.flatMap((guide) => [
        {
          id: `search-${guide.id}`,
          targetId: guide.id,
          sectionId: 'user-guides',
          title: guide.title,
          detail: 'Comprehensive role-based documentation.',
          kind: 'guide' as const,
        },
        ...guide.items.map((item) => ({
          id: `search-${item.id}`,
          targetId: item.id,
          sectionId: 'user-guides',
          title: item.text,
          detail: guide.title,
          kind: 'guide' as const,
        })),
      ]),
      ...implementationModules.map((module) => ({
        id: `search-${module.id}`,
        targetId: module.id,
        sectionId: 'implementation',
        title: module.title,
        detail: module.detail,
        kind: 'resource' as const,
      })),
      ...faqItems.map((faq) => ({
        id: `search-${faq.id}`,
        targetId: faq.id,
        sectionId: 'faq',
        title: faq.q,
        detail: faq.a,
        kind: 'faq' as const,
      })),
      ...troubleshootingItems.map((item) => ({
        id: `search-${item.id}`,
        targetId: item.id,
        sectionId: 'troubleshooting',
        title: item.title,
        detail: item.description,
        kind: 'troubleshooting' as const,
      })),
      ...securityStandards.map((item) => ({
        id: `search-${item.id}`,
        targetId: item.id,
        sectionId: 'security',
        title: item.title,
        detail: item.detail,
        kind: 'security' as const,
      })),
      ...integrations.map((item) => ({
        id: `search-${item.id}`,
        targetId: item.id,
        sectionId: 'integrations',
        title: item.title,
        detail: item.detail,
        kind: 'integration' as const,
      })),
      { id: 'search-resource-kb', targetId: 'resource-kb', sectionId: 'resources', title: 'Read Knowledge Base', detail: 'Technical setup and platform operations references.', kind: 'resource' },
      { id: 'search-resource-support', targetId: 'resource-support', sectionId: 'resources', title: 'Contact Support', detail: 'Raise support tickets and operational questions.', kind: 'resource' },
    ],
    []
  );

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return searchEntries.slice(0, 8);
    }

    return searchEntries
      .map((entry) => {
        const haystack = `${entry.title} ${entry.detail}`.toLowerCase();
        const score = haystack.includes(normalized)
          ? (entry.title.toLowerCase().includes(normalized) ? 3 : 1)
          : 0;
        return { entry, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.entry)
      .slice(0, 10);
  }, [query, searchEntries]);

  const registerTargetRef = (id: string) => (element: HTMLElement | null) => {
    targetRefs.current[id] = element;
  };

  const isExpanded = isSearchFocused || query.length > 0;

  const getMarkedCopy = (text: string, targetId: string) => {
    const shouldMark = highlightedTargetId === targetId && highlightedTerm.trim();
    if (!shouldMark) return text;

    const matcher = new RegExp(`(${escapeRegExp(highlightedTerm)})`, 'ig');
    const parts = text.split(matcher);

    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === highlightedTerm.toLowerCase() ? (
            <mark key={`${targetId}-${index}`} className="bg-primary/35 text-text px-1 rounded">
              {part}
            </mark>
          ) : (
            <React.Fragment key={`${targetId}-${index}`}>{part}</React.Fragment>
          )
        )}
      </>
    );
  };

  const getTargetClass = (targetId: string) =>
    highlightedTargetId === targetId ? 'ring-2 ring-primary/50 bg-primary/5 transition-all' : '';

  const handleSearchSelect = (entry: SearchEntry) => {
    const target = targetRefs.current[entry.targetId];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setHighlightedTargetId(entry.targetId);
    setHighlightedTerm(query.trim() || entry.title);
    setIsSearchFocused(false);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchFocused(true);
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-textMuted font-sans selection:bg-primary selection:text-black">
      <SEO
        title="Documentation"
        description="Product documentation for Presently: onboarding, lecturer workflows, student check-in, and reporting guides."
        canonicalPath="/documentation"
      />
      <LandingHeader />

      <main className="pt-32 pb-44 px-6 max-w-7xl mx-auto">
        <section id="hero" ref={registerTargetRef('hero')} className="mb-14">
          <h1 id="hero-title" ref={registerTargetRef('hero-title')} className={`font-headline text-4xl md:text-6xl font-bold mb-5 tracking-tight scroll-mt-40 rounded-xl ${getTargetClass('hero-title')}`}>
            {getMarkedCopy('Documentation & Resources', 'hero-title')}
          </h1>
          <p id="hero-subtitle" ref={registerTargetRef('hero-subtitle')} className={`text-lg md:text-xl text-textMuted max-w-3xl leading-relaxed scroll-mt-40 rounded-xl ${getTargetClass('hero-subtitle')}`}>
            {getMarkedCopy('Everything you need to deploy, operate, troubleshoot, and scale Presently across institutions.', 'hero-subtitle')}
          </p>
        </section>

        <section id="resources" ref={registerTargetRef('resources')} className="scroll-mt-40 bg-surface/50 border border-outline rounded-2xl p-6 mb-14 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex items-start gap-4 text-textMuted">
            <div className="bg-surfaceHigh p-2.5 rounded-lg"><HelpCircle size={20} /></div>
            <div>
              <p className="text-text font-semibold mb-1">Need help quickly?</p>
              <p>Search with <span className="text-primary font-semibold">Find</span>, open video walkthroughs, or jump into role-based guides.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div id="resource-kb" ref={registerTargetRef('resource-kb')} className={`rounded-full ${getTargetClass('resource-kb')}`}>
              <Button variant="outline" className="border-outline text-textMuted">
                {getMarkedCopy('Read Knowledge Base', 'resource-kb')}
              </Button>
            </div>
            <div id="resource-support" ref={registerTargetRef('resource-support')} className={`rounded-full ${getTargetClass('resource-support')}`}>
              <Button className="bg-primary text-black">
                {getMarkedCopy('Contact Support', 'resource-support')}
              </Button>
            </div>
          </div>
        </section>

        <section id="training-videos" ref={registerTargetRef('training-videos')} className="scroll-mt-40 mb-20">
          <h2 className="font-headline text-2xl font-bold mb-8 flex items-center gap-3">
            <Play size={22} className="text-primary" />
            Training & Onboarding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <motion.article
                key={video.id}
                ref={registerTargetRef(video.id)}
                whileHover={{ scale: 1.02 }}
                className={`group bg-surface/40 border border-outline rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 ${getTargetClass(video.id)}`}
              >
                <button type="button" onClick={() => setActiveVideo(video)} className="w-full text-left" aria-label={`Play ${video.title}`}>
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={`${video.title} - Presently documentation`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-primary text-black rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play fill="currentColor" size={20} />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-xs font-mono">{video.duration}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-headline font-bold text-lg mb-2 text-text">{getMarkedCopy(video.title, video.id)}</h3>
                    <p className="text-textMuted text-sm leading-relaxed">{getMarkedCopy(video.description, video.id)}</p>
                  </div>
                </button>
              </motion.article>
            ))}
          </div>
        </section>

        <div className="space-y-24">
          <section id="quick-start" ref={registerTargetRef('quick-start')} className="scroll-mt-40">
            <h2 className="font-headline text-3xl font-bold mb-8 flex items-center gap-3">
              <Workflow size={24} className="text-primary" />
              Quick Start Pathways
            </h2>
            <div className="grid lg:grid-cols-3 gap-6">
              {quickStartTracks.map((track, index) => (
                <article key={track.id} ref={registerTargetRef(track.id)} className={`rounded-3xl border border-outline bg-surface/40 p-7 ${getTargetClass(track.id)}`}>
                  <div className="flex items-center gap-3 mb-4">
                    {index === 0 && <GraduationCap size={20} className="text-primary" />}
                    {index === 1 && <Book size={20} className="text-primary" />}
                    {index === 2 && <ServerCog size={20} className="text-primary" />}
                    <h3 className="font-headline text-xl font-bold text-text">{getMarkedCopy(track.title, track.id)}</h3>
                  </div>
                  <p className="text-sm text-textMuted mb-5">{getMarkedCopy(track.intro, track.id)}</p>
                  <ul className="space-y-3">
                    {track.steps.map((step) => (
                      <li key={step.id} ref={registerTargetRef(step.id)} className={`text-sm flex gap-2 items-start rounded-lg p-2 ${getTargetClass(step.id)}`}>
                        <CheckCircle2 size={15} className="text-primary mt-0.5" />
                        <span>{getMarkedCopy(step.text, step.id)}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section id="user-guides" ref={registerTargetRef('user-guides')} className="scroll-mt-40">
            <h2 className="font-headline text-3xl font-bold mb-8 flex items-center gap-3">
              <Book size={24} className="text-primary" />
              Comprehensive Guides
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {guideSections.map((guide) => (
                <article key={guide.id} ref={registerTargetRef(guide.id)} className={`p-8 bg-surface/30 border border-white/10 rounded-3xl ${getTargetClass(guide.id)}`}>
                  <h3 className="font-headline text-xl font-bold mb-4 flex items-center justify-between text-text">
                    {getMarkedCopy(guide.title, guide.id)}
                    <ChevronRight size={18} className="text-textMuted" />
                  </h3>
                  <ul className="space-y-3 text-sm text-textMuted">
                    {guide.items.map((item) => (
                      <li key={item.id} ref={registerTargetRef(item.id)} className={`flex gap-2 items-start rounded-lg p-2 ${getTargetClass(item.id)}`}>
                        <CheckCircle2 size={15} className="text-primary mt-0.5" />
                        <span>{getMarkedCopy(item.text, item.id)}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section id="implementation" ref={registerTargetRef('implementation')} className="scroll-mt-40">
            <h2 className="font-headline text-3xl font-bold mb-8 flex items-center gap-3">
              <Database size={24} className="text-primary" />
              Implementation Blueprint
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {implementationModules.map((module) => (
                <article key={module.id} ref={registerTargetRef(module.id)} className={`rounded-2xl border border-outline bg-surface/30 p-6 ${getTargetClass(module.id)}`}>
                  <h3 className="font-bold text-text mb-2">{getMarkedCopy(module.title, module.id)}</h3>
                  <p className="text-sm">{getMarkedCopy(module.detail, module.id)}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="faq" ref={registerTargetRef('faq')} className="scroll-mt-40 bg-background -mx-6 px-6 py-20 border-y border-white/5">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-5">
                {faqItems.map((item) => (
                  <article key={item.id} ref={registerTargetRef(item.id)} className={`bg-surface/10 border border-white/10 p-6 rounded-2xl ${getTargetClass(item.id)}`}>
                    <h4 className="font-headline font-bold text-base mb-3 flex items-start gap-2 text-text">
                      <HelpCircle size={16} className="text-primary mt-1" />
                      <span>{getMarkedCopy(item.q, item.id)}</span>
                    </h4>
                    <p className="text-sm leading-relaxed">{getMarkedCopy(item.a, item.id)}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="troubleshooting" ref={registerTargetRef('troubleshooting')} className="scroll-mt-40">
            <h2 className="font-headline text-3xl font-bold mb-8 flex items-center gap-3">
              <LifeBuoy size={24} className="text-primary" />
              Troubleshooting
            </h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {troubleshootingItems.map((item) => (
                <article key={item.id} ref={registerTargetRef(item.id)} className={`p-6 bg-surface/50 border border-white/10 rounded-2xl ${getTargetClass(item.id)}`}>
                  <item.icon size={24} className="text-primary mb-4" />
                  <h4 className="font-headline font-bold mb-2 text-text">{getMarkedCopy(item.title, item.id)}</h4>
                  <p className="text-sm">{getMarkedCopy(item.description, item.id)}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="security" ref={registerTargetRef('security')} className="scroll-mt-40">
            <h2 className="font-headline text-3xl font-bold mb-8 flex items-center gap-3">
              <Lock size={24} className="text-primary" />
              Security & Compliance Foundations
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {securityStandards.map((item) => (
                <article key={item.id} ref={registerTargetRef(item.id)} className={`rounded-2xl border border-outline bg-surface/30 p-6 ${getTargetClass(item.id)}`}>
                  <h4 className="font-semibold text-text mb-2">{getMarkedCopy(item.title, item.id)}</h4>
                  <p className="text-sm">{getMarkedCopy(item.detail, item.id)}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="integrations" ref={registerTargetRef('integrations')} className="scroll-mt-40">
            <h2 className="font-headline text-3xl font-bold mb-8 flex items-center gap-3">
              <Globe size={24} className="text-primary" />
              Integrations & Operational Extensions
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {integrations.map((item) => (
                <article key={item.id} ref={registerTargetRef(item.id)} className={`rounded-2xl border border-outline bg-surface/30 p-6 ${getTargetClass(item.id)}`}>
                  <div className="flex items-center gap-2 mb-2 text-text">
                    <Link2 size={15} className="text-primary" />
                    <h4 className="font-semibold">{getMarkedCopy(item.title, item.id)}</h4>
                  </div>
                  <p className="text-sm">{getMarkedCopy(item.detail, item.id)}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {activeVideo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              {...modalProps}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2 }}
              className="fixed z-[140] inset-4 sm:inset-10 lg:inset-x-[12%] lg:inset-y-[10%] rounded-3xl border border-outline bg-surface shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-b border-outline">
                <div>
                  <h3 className="font-headline text-xl sm:text-2xl font-bold text-text">{activeVideo.title}</h3>
                  <p className="text-xs sm:text-sm text-textMuted">{activeVideo.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  aria-label="Close video"
                  className="w-10 h-10 rounded-full bg-surfaceHigh text-textMuted hover:text-text transition-colors flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 p-4 sm:p-6">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-black">
                  <video
                    className="w-full h-full"
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    poster={activeVideo.thumbnail}
                    src={activeVideo.videoUrl}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[120] transition-all duration-300 ${isExpanded ? 'w-[min(94vw,760px)]' : 'w-36'}`}>
        <div className="relative">
          {(isSearchFocused || query) && (
            <div className="absolute bottom-full mb-3 w-full rounded-2xl border border-outline bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-outline text-xs text-textMuted">
                {query ? `Results for "${query}"` : 'Search all documentation'}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {results.length > 0 ? (
                  results.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleSearchSelect(result)}
                      className="w-full px-4 py-3 text-left hover:bg-surfaceHigh/60 transition-colors border-b border-outline/40 last:border-b-0"
                    >
                      <p className="text-sm font-semibold text-text">{result.title}</p>
                      <p className="text-xs text-textMuted mt-0.5">{result.detail}</p>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-4 text-sm text-textMuted">No matches found. Try terms like "attendance", "GPS", "analytics", or "security".</p>
                )}
              </div>
            </div>
          )}

          <div className="rounded-full border border-primary/30 bg-surface/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] px-2.5 h-12 flex items-center">
            <button
              type="button"
              onClick={() => {
                setIsSearchFocused(true);
                searchInputRef.current?.focus();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary shrink-0"
              aria-label="Focus find search input"
            >
              <Search size={14} />
              <span className="text-xs font-semibold tracking-wide">Find</span>
            </button>
            <input
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
              className={`bg-transparent outline-none text-sm text-text placeholder:text-textMuted transition-all duration-300 ${
                isExpanded ? 'w-full opacity-100 ml-2 pr-2' : 'w-0 opacity-0 pointer-events-none ml-0 pr-0'
              }`}
              placeholder="Search everything in documentation... (Ctrl/Cmd + K)"
              aria-label="Find documentation content"
            />
            {query && isExpanded && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="w-8 h-8 rounded-full hover:bg-surfaceHigh/80 text-textMuted hover:text-text flex items-center justify-center shrink-0"
                aria-label="Clear find query"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <footer className="py-12 border-t border-outline text-center text-textMuted text-sm">
        <p>&copy; {new Date().getFullYear()} Presently Inc. Documentation Portal.</p>
      </footer>
    </div>
  );
};
