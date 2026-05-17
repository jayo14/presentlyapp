import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CaretDown,
  TrendUp,
  Calculator,
  Science,
  Palette,
  Code
} from '@phosphor-icons/react';

export const AnalyticsMobile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white pb-24 min-h-screen">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-white/10 transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Attendance Analytics</h2>
      </div>

      {/* Filters (Chips) */}
      <div className="flex gap-3 px-4 py-2 overflow-x-auto no-scrollbar">
        <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-gray-200 dark:bg-[#4a4121] pl-4 pr-3 transition-colors active:scale-95">
          <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Semester 1</p>
          <CaretDown size={18} />
        </button>
        <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-gray-200 dark:bg-[#4a4121] pl-4 pr-3 transition-colors active:scale-95">
          <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal">All Courses</p>
          <CaretDown size={18} />
        </button>
      </div>

      {/* Hero Section: Circular Chart */}
      <div className="px-4 py-6 flex flex-col items-center justify-center">
        <div className="relative size-64">
          {/* SVG Ring */}
          <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            {/* Background Ring */}
            <path
              className="text-gray-200 dark:text-[#4a4121]"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeWidth="3"
            />
            {/* Progress Ring (92%) */}
            <path
              className="text-primary drop-shadow-[0_0_10px_rgba(249,196,6,0.5)]"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeDasharray="92, 100" strokeLinecap="round" strokeWidth="3"
            />
          </svg>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-bold text-gray-900 dark:text-white tracking-tighter">92%</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Overall Attendance</span>
          </div>
        </div>
        {/* Quick Stat */}
        <div className="flex items-center gap-2 mt-4 bg-green-500/10 dark:bg-green-500/20 px-3 py-1.5 rounded-lg">
          <TrendUp size={16} className="text-green-600 dark:text-green-400" />
          <p className="text-green-700 dark:text-green-400 text-sm font-medium">+2% vs last month</p>
        </div>
      </div>

      {/* Weekly Trends Chart */}
      <div className="mt-2">
        <h2 className="text-gray-900 dark:text-white tracking-tight text-[22px] font-bold leading-tight px-4 text-left pb-3 pt-2">Weekly Trends</h2>
        <div className="px-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Average</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">18.5 hrs</p>
              </div>
              <div className="bg-primary/20 text-yellow-700 dark:text-primary px-2 py-1 rounded text-xs font-bold">
                Last 4 Weeks
              </div>
            </div>
            {/* Bar Chart Implementation */}
            <div className="grid grid-cols-4 gap-4 h-40 items-end">
              {[
                { label: 'W1', height: '65%', active: false },
                { label: 'W2', height: '85%', active: false },
                { label: 'W3', height: '45%', active: false },
                { label: 'W4', height: '92%', active: true }
              ].map((week) => (
                <div key={week.label} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full bg-gray-100 dark:bg-[#4a4121] rounded-t-lg relative h-full overflow-hidden flex items-end">
                    <div
                      className={`w-full transition-all duration-300 rounded-t-lg ${
                        week.active
                          ? 'bg-primary group-hover:bg-[#ffdc48] shadow-[0_0_15px_rgba(249,196,6,0.3)]'
                          : 'bg-primary/60 group-hover:bg-primary'
                      } ${week.label === 'W3' ? 'bg-gray-300 dark:bg-gray-600' : ''}`}
                      style={{ height: week.height }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium ${week.active ? 'text-primary font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                    {week.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="mt-6 mb-8">
        <div className="flex items-center justify-between px-4 pb-3 pt-2">
          <h2 className="text-gray-900 dark:text-white tracking-tight text-[22px] font-bold leading-tight text-left">Course Breakdown</h2>
          <button className="text-primary text-sm font-medium">See All</button>
        </div>
        <div className="flex flex-col gap-3 px-4">
          {[
            { name: 'Advanced Calculus', icon: Calculator, progress: 95, color: 'primary' },
            { name: 'Physics II', icon: Science, progress: 88, color: 'blue' },
            { name: 'History of Art', icon: Palette, progress: 65, color: 'gray' },
            { name: 'Comp Sci 101', icon: Code, progress: 98, color: 'purple' }
          ].map((course) => (
            <div key={course.name} className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-transparent dark:border-[#4a4121]">
              <div className={`size-10 rounded-full flex items-center justify-center ${
                course.color === 'primary' ? 'bg-primary/20 text-yellow-700 dark:text-primary' :
                course.color === 'blue' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                course.color === 'purple' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                <course.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-gray-900 dark:text-white font-semibold truncate">{course.name}</h3>
                  <span className={`font-bold ${course.progress < 70 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#4a4121] rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${course.progress < 70 ? 'bg-gray-400 dark:bg-gray-500' : 'bg-primary'}`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
