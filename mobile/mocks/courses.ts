export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  schedule: string;
  units: number;
}

export interface RegisteredCourse extends Course {
  attendance: number;
  status: 'active' | 'at-risk' | 'inactive';
  nextClass: string;
}

export const availableCourses: Course[] = [
  {
    id: '1',
    code: 'CSC301',
    name: 'Data Structures & Algorithms',
    instructor: 'Dr. Sarah Johnson',
    schedule: 'Mon, Wed 10:00 AM',
    units: 3,
  },
  {
    id: '2',
    code: 'CSC302',
    name: 'Database Management Systems',
    instructor: 'Prof. Michael Chen',
    schedule: 'Tue, Thu 2:00 PM',
    units: 3,
  },
  {
    id: '3',
    code: 'CSC303',
    name: 'Software Engineering',
    instructor: 'Dr. Emily Rodriguez',
    schedule: 'Wed, Fri 11:30 AM',
    units: 3,
  },
  {
    id: '4',
    code: 'CSC304',
    name: 'Computer Networks',
    instructor: 'Prof. James Wilson',
    schedule: 'Mon, Thu 3:00 PM',
    units: 3,
  },
  {
    id: '5',
    code: 'CSC305',
    name: 'Operating Systems',
    instructor: 'Dr. Amanda Lee',
    schedule: 'Tue, Fri 9:00 AM',
    units: 4,
  },
  {
    id: '6',
    code: 'CSC306',
    name: 'Web Development',
    instructor: 'Prof. Robert Taylor',
    schedule: 'Mon, Wed 2:00 PM',
    units: 3,
  },
];

export const mockRegisteredCourses: RegisteredCourse[] = [
  {
    id: '1',
    code: 'CSC301',
    name: 'Data Structures & Algorithms',
    instructor: 'Dr. Sarah Johnson',
    schedule: 'Mon, Wed 10:00 AM',
    units: 3,
    attendance: 85,
    status: 'active',
    nextClass: 'Today, 10:00 AM',
  },
  {
    id: '2',
    code: 'CSC302',
    name: 'Database Management Systems',
    instructor: 'Prof. Michael Chen',
    schedule: 'Tue, Thu 2:00 PM',
    units: 3,
    attendance: 92,
    status: 'active',
    nextClass: 'Tomorrow, 2:00 PM',
  },
  {
    id: '3',
    code: 'CSC303',
    name: 'Software Engineering',
    instructor: 'Dr. Emily Rodriguez',
    schedule: 'Wed, Fri 11:30 AM',
    units: 3,
    attendance: 78,
    status: 'at-risk',
    nextClass: 'Wed, 11:30 AM',
  },
  {
    id: '4',
    code: 'CSC304',
    name: 'Computer Networks',
    instructor: 'Prof. James Wilson',
    schedule: 'Mon, Thu 3:00 PM',
    units: 3,
    attendance: 95,
    status: 'active',
    nextClass: 'Thu, 3:00 PM',
  },
];
