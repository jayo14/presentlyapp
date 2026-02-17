export interface School {
  id: string;
  name: string;
  colleges: College[];
}

export interface College {
  id: string;
  name: string;
  departments: string[];
}

export const schools: School[] = [
  {
    id: '1',
    name: 'University of Lagos',
    colleges: [
      {
        id: 'c1',
        name: 'College of Medicine',
        departments: ['Medicine & Surgery', 'Nursing', 'Pharmacy', 'Physiotherapy'],
      },
      {
        id: 'c2',
        name: 'Faculty of Science',
        departments: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
      },
      {
        id: 'c3',
        name: 'Faculty of Engineering',
        departments: ['Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering'],
      },
      {
        id: 'c4',
        name: 'Faculty of Arts',
        departments: ['English', 'History', 'Philosophy', 'Creative Arts'],
      },
    ],
  },
  {
    id: '2',
    name: 'Obafemi Awolowo University',
    colleges: [
      {
        id: 'c1',
        name: 'Faculty of Technology',
        departments: ['Computer Science', 'Electronic & Electrical Engineering', 'Food Science & Technology'],
      },
      {
        id: 'c2',
        name: 'Faculty of Social Sciences',
        departments: ['Economics', 'Psychology', 'Sociology', 'Political Science'],
      },
      {
        id: 'c3',
        name: 'Faculty of Basic Medical Sciences',
        departments: ['Anatomy', 'Physiology', 'Biochemistry'],
      },
    ],
  },
  {
    id: '3',
    name: 'University of Ibadan',
    colleges: [
      {
        id: 'c1',
        name: 'Faculty of Science',
        departments: ['Computer Science', 'Mathematics', 'Statistics', 'Physics', 'Chemistry'],
      },
      {
        id: 'c2',
        name: 'Faculty of Law',
        departments: ['Common Law', 'Jurisprudence'],
      },
      {
        id: 'c3',
        name: 'Faculty of Agriculture',
        departments: ['Agricultural Economics', 'Crop Production', 'Animal Science'],
      },
    ],
  },
  {
    id: '4',
    name: 'Covenant University',
    colleges: [
      {
        id: 'c1',
        name: 'College of Science & Technology',
        departments: ['Computer Science', 'Software Engineering', 'Information Technology', 'Biochemistry'],
      },
      {
        id: 'c2',
        name: 'College of Business & Social Sciences',
        departments: ['Accounting', 'Business Administration', 'Economics'],
      },
    ],
  },
  {
    id: '5',
    name: 'Ahmadu Bello University',
    colleges: [
      {
        id: 'c1',
        name: 'Faculty of Engineering',
        departments: ['Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering'],
      },
      {
        id: 'c2',
        name: 'Faculty of Science',
        departments: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry'],
      },
    ],
  },
  {
    id: '6',
    name: 'Lagos State University of Science and Technology',
    colleges: [
      {
        id: 'c1',
        name: 'College of Applied Sciences',
        departments: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Microbiology'],
      },
      {
        id: 'c2',
        name: 'College of Engineering',
        departments: ['Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Mechatronics'],
      },
      {
        id: 'c3',
        name: 'College of Environmental Design',
        departments: ['Architecture', 'Urban & Regional Planning', 'Estate Management'],
      },
    ],
  },
];
