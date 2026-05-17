import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  QrCode,
  House,
  BookOpen,
  ChartLineUp,
  User,
  Monitor,
  GraduationCap
} from '@phosphor-icons/react';

export const StudentCoursesMobile: React.FC = () => {
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      name: 'Data Structures',
      code: 'CS101',
      prof: 'Prof. Alan Turing',
      attendance: 85,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=256&h=256&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'UI/UX Design',
      code: 'DES202',
      prof: 'Prof. Don Norman',
      attendance: 92,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=256&h=256&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Algorithms',
      code: 'CS301',
      prof: 'Prof. Grace Hopper',
      attendance: 70,
      status: 'Warning',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=256&h=256&auto=format&fit=crop'
    },
    {
      id: 4,
      name: 'Database Systems',
      code: 'CS401',
      prof: 'Prof. Edgar Codd',
      attendance: 45,
      status: 'Low',
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=256&h=256&auto=format&fit=crop'
    },
    {
      id: 5,
      name: 'Computer Networks',
      code: 'CS402',
      prof: 'Prof. Vint Cerf',
      attendance: 88,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=256&h=256&auto=format&fit=crop'
    }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white antialiased min-h-screen flex flex-col overflow-hidden pb-24">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer text-gray-900 dark:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-gray-900 dark:text-white">My Courses</h2>
        <button
          onClick={() => navigate('/dashboard/courses/register')}
          className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer text-gray-900 dark:text-white"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6">
        {/* Course List */}
        <div className="flex flex-col gap-6 py-3">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col p-6 bg-surface-light dark:bg-surface-dark rounded-[24px] shadow-sm border border-gray-200 dark:border-white/5">
              <div className="flex gap-4">
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-xl w-[80px] h-[80px] shrink-0"
                  style={{ backgroundImage: `url(${course.image})` }}
                ></div>
                <div className="flex flex-1 flex-col justify-center min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-gray-900 dark:text-white text-base font-bold leading-normal truncate">{course.name}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${course.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      course.status === 'Warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {course.status}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-[#ccbf8e] text-sm font-normal leading-normal truncate">{course.code} • {course.prof}</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-gray-500 dark:text-[#ccbf8e] text-xs font-medium">Attendance</span>
                  <span className="text-gray-900 dark:text-white text-sm font-bold">{course.attendance}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-[#4a4225] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${course.attendance < 50 ? 'bg-red-500' : 'bg-primary'}`}
                    style={{ width: `${course.attendance}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-20">
        <button
          onClick={() => navigate('/dashboard/courses/register')}
          className="flex items-center justify-center size-14 rounded-full bg-primary text-background-dark shadow-lg hover:bg-primary/90 transition-transform active:scale-95"
        >
          <Plus size={32} weight="bold" />
        </button>
      </div>
    </div>
  );
};
