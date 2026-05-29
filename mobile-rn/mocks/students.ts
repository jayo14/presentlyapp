export interface Student {
  id: string;
  fullName: string;
  matricNumber: string;
  department: string;
  level: string;
}

export const mockStudents: Student[] = [
  { id: '1', fullName: 'John Doe', matricNumber: '240303010001', department: 'Computer Science', level: '400' },
  { id: '2', fullName: 'Jane Smith', matricNumber: '240303010002', department: 'Computer Science', level: '400' },
  { id: '3', fullName: 'Alice Johnson', matricNumber: '240303020001', department: 'Mathematics', level: '300' },
  { id: '4', fullName: 'Bob Williams', matricNumber: '240303010005', department: 'Computer Science', level: '200' },
  { id: '5', fullName: 'Charlie Brown', matricNumber: '240303030001', department: 'Physics', level: '100' },
  { id: '6', fullName: 'David Wilson', matricNumber: '240303010010', department: 'Computer Science', level: '400' },
  { id: '7', fullName: 'Eve Davis', matricNumber: '240303020005', department: 'Mathematics', level: '300' },
  { id: '8', fullName: 'Frank Miller', matricNumber: '240303010008', department: 'Computer Science', level: '400' },
];