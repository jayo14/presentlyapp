import React, { useEffect } from 'react';
import { CheckCircle2, MapPin, Clock, ArrowLeft, Share2, Home } from 'lucide-react';
import { Button } from '../Button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AttendanceSuccessPageProps {
  courseCode?: string;
  courseName?: string;
  location?: string;
  time?: string;
  mapUrl?: string;
  onBackToHome?: () => void;
  onShare?: () => void;
}

export const AttendanceSuccessPage: React.FC<AttendanceSuccessPageProps> = ({
  courseCode = 'CS101',
  courseName = 'Algorithm Design',
  location = 'Hall A',
  time = '10:05 AM',
  mapUrl,
  onBackToHome,
  onShare
}) => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      navigate('/dashboard');
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality
      if (navigator.share) {
        navigator.share({
          title: 'Attendance Marked!',
          text: `I just marked my attendance for ${courseCode} - ${courseName}`,
        }).catch(() => {});
      }
    }
  };

  // Mobile Layout matching Design 5
  return (
    <div className="min-h-screen bg-[#3A3A2F] dark:bg-[#3A3A2F] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#2A2A25]">
        <button 
          onClick={handleBackToHome}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Success</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Success Icon with Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
          className="mb-8"
        >
          <div className="relative">
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full bg-[#4A4A3F] opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-0 rounded-full bg-[#4A4A3F] opacity-40"></div>
            
            {/* Inner circle */}
            <div className="relative w-32 h-32 bg-[#FFD700] rounded-full flex items-center justify-center">
              <CheckCircle2 size={64} className="text-[#3A3A2F]" strokeWidth={3} />
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Attendance Marked!</h2>
          <p className="text-[#FFD700] text-sm">You're all set for today's lecture.</p>
        </motion.div>

        {/* Course Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md bg-[#2A2A25] rounded-2xl p-6 mb-8"
        >
          {/* Verified Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 bg-[#FFD700]/20 border border-[#FFD700] rounded-lg flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#FFD700]" />
              <span className="text-[#FFD700] text-xs font-bold uppercase">Verified</span>
            </div>
          </div>

          {/* Course Info */}
          <h3 className="text-xl font-bold mb-4">
            {courseCode} - {courseName}
          </h3>

          {/* Location and Time */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={18} className="text-gray-400" />
              <span className="text-gray-300">Location: {location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={18} className="text-gray-400" />
              <span className="text-gray-300">Time: {time}</span>
            </div>
          </div>

          {/* Map Preview */}
          {mapUrl ? (
            <div className="w-full h-32 bg-[#3A3A30] rounded-xl overflow-hidden">
              <img src={mapUrl} alt="Location map" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-32 bg-[#3A3A30] rounded-xl flex items-center justify-center">
              <MapPin size={32} className="text-gray-600" />
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-md space-y-3"
        >
          <button
            onClick={handleBackToHome}
            className="w-full bg-[#FFD700] text-black py-4 rounded-xl font-bold hover:bg-[#FFE44D] transition-colors"
          >
            Back to Home
          </button>
          
          <button
            onClick={handleShare}
            className="w-full bg-[#2A2A25] text-white py-4 rounded-xl font-bold hover:bg-[#3A3A30] transition-colors flex items-center justify-center gap-2 border border-[#3A3A30]"
          >
            <Share2 size={20} />
            Share Progress
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AttendanceSuccessPage;
