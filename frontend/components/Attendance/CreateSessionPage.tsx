import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Loader, Plus, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { sessionApi, courseApi } from '../../services/api/attendance';
import { venuesApi } from '../../services/api/admin';
import { Course, Venue } from '../../types';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { Button } from '../Button';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';

export const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    course: '',
    venue: '',
    duration_minutes: 60,
    location_radius: 100
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, venuesRes] = await Promise.all([
        courseApi.getAll(),
        venuesApi.getAll()
      ]);
      setCourses(coursesRes);
      setVenues(venuesRes);
    } catch (err) {
      toast.error('Failed to load required data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course) {
      toast.error('Please select a course');
      return;
    }

    try {
      setSubmitting(true);
      const session = await sessionApi.create({
        course: parseInt(formData.course),
        venue: formData.venue ? parseInt(formData.venue) : undefined,
        duration_minutes: formData.duration_minutes,
        location_radius: formData.location_radius
      });
      toast.success('Session created successfully');
      navigate('/dashboard/sessions');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-10 h-10 animate-spin text-sungold" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <SEO title="New Attendance Session | Presently" />

      <header className="flex flex-col gap-6">
        <button
          onClick={() => navigate('/dashboard/sessions')}
          className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-warm-ivory transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="space-y-2">
           <Badge variant="secondary" className="px-3 py-1">REAL-TIME TRACKING</Badge>
           <h1 className="font-display text-4xl md:text-5xl font-bold text-presently-black">
             Initiate Session
           </h1>
           <p className="text-on-surface-variant font-medium text-lg">
             Create a new attendance window for your students.
           </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <ModernCard padding="lg" className="space-y-8 bg-warm-ivory/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Course Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                Academic Course
              </label>
              <div className="relative">
                <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-sungold" size={20} />
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-2 focus:ring-sungold/20 outline-none appearance-none"
                  required
                >
                  <option value="">Select a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Venue Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                Physical Venue (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-sungold" size={20} />
                <select
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-2 focus:ring-sungold/20 outline-none appearance-none"
                >
                  <option value="">No specific venue (GPS only)</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                Session Duration
              </label>
              <div className="relative">
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-sungold" size={20} />
                <select
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-2 focus:ring-sungold/20 outline-none appearance-none"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={90}>1.5 Hours</option>
                  <option value={120}>2 Hours</option>
                  <option value={180}>3 Hours</option>
                </select>
              </div>
            </div>

            {/* Geofence Radius */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                Geofence Radius (Meters)
              </label>
              <div className="relative">
                <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 text-sungold" size={20} />
                <select
                  value={formData.location_radius}
                  onChange={(e) => setFormData({ ...formData, location_radius: parseInt(e.target.value) })}
                  className="w-full h-16 pl-14 pr-6 bg-white border border-outline rounded-2xl text-sm font-bold text-presently-black focus:ring-2 focus:ring-sungold/20 outline-none appearance-none"
                >
                  <option value={50}>50 Meters (Strict)</option>
                  <option value={100}>100 Meters (Standard)</option>
                  <option value={200}>200 Meters (Large Venue)</option>
                  <option value={500}>500 Meters (Campus-wide)</option>
                </select>
              </div>
            </div>
          </div>
        </ModernCard>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-slate-50 border border-outline rounded-[2rem]">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <AlertCircle size={20} className="text-sungold" />
            <p className="text-xs font-bold uppercase tracking-widest">
              Students must be within the geofence to check in.
            </p>
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-16 px-12 shadow-gold w-full md:w-auto"
            disabled={submitting}
          >
            {submitting ? (
              <Loader className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Plus size={24} className="mr-2" />
            )}
            Launch Session
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSessionPage;
