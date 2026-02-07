import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, CheckCircle2, AlertCircle, Clock, BookOpen, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '../Button';
import { useCurrentUser } from '../../hooks/useAuth';
import { sessionApi, attendanceApi, courseApi } from '../../services/api/attendance';
import { toast } from 'sonner';
import { geolocationService } from '../../services/geolocation';

export const PublicCheckInPage: React.FC = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading: authLoading } = useCurrentUser();

  // State
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  
  // Registration Timer State
  const [showEnrollPrompt, setShowEnrollPrompt] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [autoEnrolling, setAutoEnrolling] = useState(false);

  // 1. Fetch Session Details & Check Enrollment
  const fetchSessionData = useCallback(async () => {
    if (!sessionCode) return;
    
    // Check if user is logged in
    if (!user && !authLoading) {
      localStorage.setItem('pending_checkin', sessionCode);
      toast.error('Please log in to mark attendance.');
      navigate(`/login?redirect_to=/check-in/${sessionCode}&message=Please log in to mark attendance.`, { replace: true });
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Using the public endpoint which returns session details
      const API_URL = import.meta.env.VITE_API_URL || 'https://presently.koyeb.app/api';
      const response = await fetch(`${API_URL}/check-in/${sessionCode}/`, {
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
      });
      
      if (response.status === 401) {
          localStorage.setItem('pending_checkin', sessionCode);
          toast.error('Please log in to mark attendance.');
          navigate(`/login?redirect_to=/check-in/${sessionCode}&message=Please log in to mark attendance.`, { replace: true });
          return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch session');
      
      setSession(data.session);

      // Clear pending checkin if we've successfully reached the intended session
      if (localStorage.getItem('pending_checkin') === sessionCode) {
        localStorage.removeItem('pending_checkin');
      }

      // Check if user is a student
      if (user.role !== 'STUDENT' && user.role !== 'CLASS_REP') {
          setError('Only students can mark attendance. You are logged in as a ' + user.role.toLowerCase() + '.');
          return;
      }

      // Check if user is enrolled in the course
      try {
          const enrollments = await courseApi.getAllEnrollments({ 
              student: user.id, 
              course: data.session.course 
          });
          const enrolled = enrollments.length > 0 && enrollments[0].is_active;
          setIsEnrolled(enrolled);
          
          if (!enrolled) {
              setShowEnrollPrompt(true);
          }
      } catch (err) {
          console.error('Error checking enrollment:', err);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionCode, user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading) {
        fetchSessionData();
    }
  }, [authLoading, fetchSessionData]);

  // 2. Handle 10s Countdown for Enrollment
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showEnrollPrompt && countdown > 0 && !autoEnrolling) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showEnrollPrompt && countdown === 0 && !autoEnrolling) {
      handleEnroll();
    }
    return () => clearInterval(timer);
  }, [showEnrollPrompt, countdown, autoEnrolling]);

  const handleEnroll = async () => {
    if (!session || autoEnrolling) return;
    
    try {
      setAutoEnrolling(true);
      toast.info('Automatically enrolling you in the course...');
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://presently.koyeb.app/api';
      const response = await fetch(`${API_URL}/course-enrollments/enroll/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ course_id: session.course })
      });

      if (!response.ok) throw new Error('Enrollment failed');
      
      setIsEnrolled(true);
      setShowEnrollPrompt(false);
      toast.success('Successfully enrolled in the course');
      
      // Proceed to check-in automatically
      performCheckIn();
    } catch (err) {
      toast.error('Failed to auto-enroll. Please try again.');
      setAutoEnrolling(false);
    }
  };

  // 3. Perform Check-in (with Location Verification)
  const performCheckIn = async () => {
    if (!session) return;
    
    try {
      setCheckingIn(true);
      setError(null);

      // Get current position
      const position = await geolocationService.getCurrentPosition();
      
      const checkInData = {
        code: sessionCode,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        elevation: position.coords.altitude || undefined
      };

      const result = await sessionApi.checkIn(session.id, checkInData);
      
      toast.success('Attendance marked successfully!', {
          description: `Status: ${result.status}`
      });
      
      // Success - redirect to dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 2000);
      
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Check-in failed';
      setError(msg);
      toast.error('Check-in Failed', { description: msg });
    } finally {
      setCheckingIn(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-zinc-400 font-medium">Preparing attendance check-in...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-500/10 p-6 rounded-full text-red-500 mb-6">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Invalid Session</h2>
        <p className="text-zinc-400 mb-8 max-w-md">{error}</p>
        <Button onClick={() => navigate('/dashboard')} variant="secondary">
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  // If loading failed but we don't have error, show generic error
  if (!loading && !session && !authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-500/10 p-6 rounded-full text-red-500 mb-6">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Session Not Found</h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          The attendance session you're trying to access could not be found or is no longer available.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/dashboard')} variant="secondary">
            Back to Dashboard
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        {/* Course Header */}
        <div className="p-8 border-b border-zinc-900 bg-zinc-900/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <BookOpen size={28} />
            </div>
            <div>
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{session?.course_code}</div>
              <h1 className="text-xl font-bold text-white">{session?.course_name}</h1>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Clock size={16} className="text-zinc-500" />
              <span>Ends at {session && new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400 justify-end">
              <MapPin size={16} className="text-zinc-500" />
              <span>{session?.venue_name}</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {showEnrollPrompt ? (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-4 animate-in slide-in-from-bottom-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary relative">
                  <UserPlus size={32} />
                  <div className="absolute -top-1 -right-1 bg-primary text-black text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-black">
                    {countdown}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-lg">Not Registered for Course</h3>
                <p className="text-zinc-400 text-sm">You need to be registered for this course to mark attendance.</p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <Button className="w-full h-12" onClick={handleEnroll} isLoading={autoEnrolling}>
                  Register & Continue
                </Button>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  Auto-registering in {countdown} seconds...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${checkingIn ? 'bg-zinc-800' : 'bg-green-500/10 text-green-500'}`}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Location Verification</h4>
                    <p className="text-xs text-zinc-500 mt-1">We'll verify you are within {session?.location_radius}m of the venue.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Identity Verified</h4>
                    <p className="text-xs text-zinc-500 mt-1">Marking attendance as <span className="text-zinc-300 font-medium">{user?.full_name}</span></p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/10"
                onClick={performCheckIn}
                isLoading={checkingIn}
                disabled={!isEnrolled || checkingIn}
              >
                Mark Attendance <ArrowRight className="ml-2" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-zinc-600 text-sm font-medium">
        Powered by <span className="text-zinc-400">Presently Smart Attendance</span>
      </p>
    </div>
  );
};
