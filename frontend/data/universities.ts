// SEO: Programmatic university landing data used for route generation and page metadata.
export interface University {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  studentCount: number;
  founded: number;
  description: string;
}

export const universities: University[] = [
  {
    slug: 'lasustech',
    name: 'Lagos State University of Science and Technology',
    shortName: 'LASUSTECH',
    city: 'Ikorodu',
    state: 'Lagos',
    studentCount: 32000,
    founded: 2022,
    description: 'A technology-focused public university requiring reliable and verifiable attendance tracking at scale.',
  },
  {
    slug: 'unilag',
    name: 'University of Lagos',
    shortName: 'UNILAG',
    city: 'Akoka',
    state: 'Lagos',
    studentCount: 570000,
    founded: 1962,
    description: 'A leading federal university with dense lecture schedules where proxy attendance must be eliminated.',
  },
  {
    slug: 'lasu',
    name: 'Lagos State University',
    shortName: 'LASU',
    city: 'Ojo',
    state: 'Lagos',
    studentCount: 45000,
    founded: 1983,
    description: 'A multi-campus institution that benefits from GPS-verified attendance and centralized compliance reporting.',
  },
  {
    slug: 'futa',
    name: 'Federal University of Technology Akure',
    shortName: 'FUTA',
    city: 'Akure',
    state: 'Ondo',
    studentCount: 28000,
    founded: 1981,
    description: 'A STEM-driven university where practical sessions and labs need accurate, location-based attendance records.',
  },
  {
    slug: 'oau',
    name: 'Obafemi Awolowo University',
    shortName: 'OAU',
    city: 'Ile-Ife',
    state: 'Osun',
    studentCount: 39000,
    founded: 1961,
    description: 'A legacy university needing modern anti-proxy controls and real-time attendance analytics for departments.',
  },
  {
    slug: 'ui',
    name: 'University of Ibadan',
    shortName: 'UI',
    city: 'Ibadan',
    state: 'Oyo',
    studentCount: 41000,
    founded: 1948,
    description: 'Nigeria’s premier university requiring scalable attendance infrastructure for large and diverse faculties.',
  },
  {
    slug: 'uniport',
    name: 'University of Port Harcourt',
    shortName: 'UNIPORT',
    city: 'Port Harcourt',
    state: 'Rivers',
    studentCount: 36000,
    founded: 1975,
    description: 'A major southern institution where secure, automated attendance improves integrity and operational oversight.',
  },
  {
    slug: 'uniben',
    name: 'University of Benin',
    shortName: 'UNIBEN',
    city: 'Benin City',
    state: 'Edo',
    studentCount: 48000,
    founded: 1970,
    description: 'A high-volume public university that needs consistent lecture attendance verification across faculties.',
  },
];

export const universityBySlug = Object.fromEntries(universities.map((u) => [u.slug, u]));
