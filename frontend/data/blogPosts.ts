// SEO: Blog post metadata for dynamic article routes and Article JSON-LD.
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  datePublished: string;
  author: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'why-gps-attendance-matters-in-nigerian-universities',
    title: 'Why GPS Attendance Matters in Nigerian Universities',
    description: 'How GPS-verified attendance solves proxy sign-ins and improves academic integrity.',
    content:
      'Proxy attendance remains one of the biggest gaps in campus compliance workflows. GPS verification helps institutions tie presence to physical classroom context, reducing fraud and giving lecturers reliable, real-time attendance data.',
    datePublished: '2026-03-20',
    author: 'John, Software Engineer at Presently',
  },
  {
    slug: 'how-to-roll-out-digital-attendance-in-one-semester',
    title: 'How to Roll Out Digital Attendance in One Semester',
    description: 'A practical rollout guide for faculties moving from paper registers to digital check-in.',
    content:
      'Successful deployments begin with faculty onboarding, course mapping, and clear communication to students. A phased launch by department usually outperforms a campus-wide big-bang rollout and reduces support overhead.',
    datePublished: '2026-03-15',
    author: 'Ayobami, Product Manager at Presently',
  },
];

export const blogPostBySlug = Object.fromEntries(blogPosts.map((p) => [p.slug, p]));
