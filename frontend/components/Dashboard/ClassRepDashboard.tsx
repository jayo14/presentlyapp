import React, { useState, useRef } from 'react';
import { StudentDashboard } from './StudentDashboard';
import { Users, CheckCircle2, XCircle, Search, FileText, Calendar, Plus, Trash2, Clock, MapPin, Upload, Sparkles, Loader2, Save, X } from 'lucide-react';
import { analyzeTimetableImage } from '../../services/geminiService';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface ClassRepDashboardProps {
  userName: string;
  view?: string;
}

interface TimetableEntry {
    id: string;
    courseCode: string;
    day: string;
    startTime: string;
    endTime: string;
    venue: string;
}

export const ClassRepDashboard: React.FC<ClassRepDashboardProps> = ({ userName, view = 'dashboard' }) => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([
      { id: '1', courseCode: 'CS402', day: 'Monday', startTime: '10:00', endTime: '12:00', venue: 'LH 1' },
      { id: '2', courseCode: 'CS301', day: 'Tuesday', startTime: '14:00', endTime: '16:00', venue: 'Lab 3' },
  ]);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isAiScanOpen, setIsAiScanOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [newEntry, setNewEntry] = useState({
      courseCode: '',
      day: 'Monday',
      startTime: '',
      endTime: '',
      venue: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { modalProps: manualEntryProps } = useModalAccessibility(isTimetableModalOpen, () => setIsTimetableModalOpen(false));
  const { modalProps: aiScanProps } = useModalAccessibility(isAiScanOpen, () => setIsAiScanOpen(false));

  const handleAddEntry = (e: React.FormEvent) => {
      e.preventDefault();
      const entry: TimetableEntry = { id: Date.now().toString(), ...newEntry };
      setTimetable([...timetable, entry]);
      setIsTimetableModalOpen(false);
      setNewEntry({ courseCode: '', day: 'Monday', startTime: '', endTime: '', venue: '' });
  };

  const handleDeleteEntry = (id: string) => {
      setTimetable(timetable.filter(t => t.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsScanning(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
          if (event.target?.result) {
              try {
                  const base64 = event.target.result as string;
                  const scannedEntries = await analyzeTimetableImage(base64);
                  if (scannedEntries && Array.isArray(scannedEntries)) {
                      const newEntries = scannedEntries.map((entry: any) => ({
                          id: Date.now().toString() + Math.random().toString(),
                          courseCode: entry.courseCode || 'Unknown',
                          day: entry.day || 'Monday',
                          startTime: entry.startTime || '09:00',
                          endTime: entry.endTime || '10:00',
                          venue: entry.venue || 'TBA'
                      }));
                      setTimetable(prev => [...prev, ...newEntries]);
                      setIsAiScanOpen(false);
                  }
              } catch (error) {
                  alert("Failed to scan timetable. Please try again.");
              } finally {
                  setIsScanning(false);
              }
          }
      };
      reader.readAsDataURL(file);
  };

  const handleSaveTimetable = () => {
      alert("Timetable saved successfully!");
  };

  // Dashboard/history: reuse student view with class rep banner
  if (view === 'dashboard' || view === 'history') {
      return (
          <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/15 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                      <h3 className="font-headline text-sm font-semibold text-primary">Class Representative Mode</h3>
                      <p className="text-xs text-textMuted mt-0.5">You have extra privileges to manage class attendance and timetables.</p>
                  </div>
                  <button className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-textMuted bg-surface text-text border border-outline rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors">
                      View Class Report
                  </button>
              </div>
              <StudentDashboard userName={userName} view={view} />
          </div>
      );
  }

  // Timetable view (editable for class rep)
  if (view === 'timetable') {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="font-headline text-xl font-semibold text-text">Manage Class Timetable</h2>
                    <p className="text-sm text-textMuted mt-0.5">View, edit, or auto-generate your class schedule.</p>
                </div>
                <div className="flex gap-2">
                    <button
                      onClick={() => setIsAiScanOpen(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted bg-surface text-text border border-outline rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors"
                    >
                        <Sparkles size={14} className="text-primary" />
                        AI Scan
                    </button>
                    <button
                      onClick={() => setIsTimetableModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-on-primary-fixedlack rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={14} />
                        Add Class
                    </button>
                    <button
                      onClick={handleSaveTimetable}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted bg-surface text-text border border-outline rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors"
                    >
                        <Save size={14} />
                        Save
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const dayEntries = timetable.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                    return (
                        <div key={day} className="bg-surface text-text border border-outline rounded-xl p-4">
                            <h3 className="font-headline text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Calendar size={14} />
                                {day}
                            </h3>
                            {dayEntries.length > 0 ? (
                                <div className="space-y-2">
                                    {dayEntries.map(entry => (
                                        <div key={entry.id} className="bg-surfaceLow/50 border border-outline p-3 rounded-lg flex items-center justify-between group">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-surfaceHigh flex items-center justify-center text-textMuted">
                                                    <Clock size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-text">{entry.courseCode}</p>
                                                    <p className="text-xs text-textMuted">{entry.startTime} – {entry.endTime}</p>
                                                </div>
                                                <div className="hidden sm:flex items-center text-textMuted text-xs gap-1">
                                                    <MapPin size={12} />
                                                    {entry.venue}
                                                </div>
                                                {/* Mobile venue */}
                                                <p className="sm:hidden text-xs text-textMuted flex items-center gap-1">
                                                    <MapPin size={10} /> {entry.venue}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                className="ml-2 p-1.5 text-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-textMuted italic">No classes scheduled.</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Manual Entry Modal */}
            {isTimetableModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-cardackgroundlack/60 backdrop-blur-sm p-4">
                    <div
                        {...manualEntryProps}
                        aria-labelledby="manual-entry-title"
                        className="bg-surface text-text border border-outline rounded-xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 outline-none"
                    >
                        <div className="mb-5 flex justify-between items-center">
                            <h3 id="manual-entry-title" className="font-headline text-on-primary-fixedase font-semibold text-text">Add Timetable Entry</h3>
                            <button onClick={() => setIsTimetableModalOpen(false)} aria-label="Close dialog" className="p-1 text-textMuted hover:text-text rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAddEntry} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-1.5">Course Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. CS402"
                                    value={newEntry.courseCode}
                                    onChange={e => setNewEntry({...newEntry, courseCode: e.target.value})}
                                    required
                                    className="w-full bg-surfaceLow border border-outline rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-textMuted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-1.5">Day</label>
                                <select
                                    className="w-full bg-surfaceLow border border-outline rounded-lg px-3 py-2.5 text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    value={newEntry.day}
                                    onChange={e => setNewEntry({...newEntry, day: e.target.value})}
                                >
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-textMuted mb-1.5">Start Time</label>
                                    <input
                                        type="time"
                                        value={newEntry.startTime}
                                        onChange={e => setNewEntry({...newEntry, startTime: e.target.value})}
                                        required
                                        className="w-full bg-surfaceLow border border-outline rounded-lg px-3 py-2.5 text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textMuted mb-1.5">End Time</label>
                                    <input
                                        type="time"
                                        value={newEntry.endTime}
                                        onChange={e => setNewEntry({...newEntry, endTime: e.target.value})}
                                        required
                                        className="w-full bg-surfaceLow border border-outline rounded-lg px-3 py-2.5 text-sm text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-1.5">Venue</label>
                                <input
                                    type="text"
                                    placeholder="e.g. LH 1"
                                    value={newEntry.venue}
                                    onChange={e => setNewEntry({...newEntry, venue: e.target.value})}
                                    required
                                    className="w-full bg-surfaceLow border border-outline rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-textMuted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsTimetableModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-textMuted bg-surfaceHigh rounded-lg hover:bg-surfaceHigh transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-on-primary-fixedlack rounded-lg hover:bg-primary/90 transition-colors">Add Class</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Scan Modal */}
            {isAiScanOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-cardackgroundlack/60 backdrop-blur-sm p-4">
                    <div
                        {...aiScanProps}
                        aria-labelledby="ai-scan-title"
                        className="bg-surface text-text border border-outline rounded-xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 text-center outline-none"
                    >
                        <div className="flex justify-end">
                            <button onClick={() => setIsAiScanOpen(false)} aria-label="Close dialog" className="p-1 text-textMuted hover:text-text rounded-lg hover:bg-surfaceHigh hover:text-text transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="mb-5">
                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                                <Sparkles size={28} />
                            </div>
                            <h3 id="ai-scan-title" className="font-headline text-on-primary-fixedase font-semibold text-text mb-1">Scan Timetable</h3>
                            <p className="text-sm text-textMuted">Upload a photo of your class schedule, and AI will extract the details.</p>
                        </div>

                        {isScanning ? (
                            <div className="py-8">
                                <Loader2 size={36} className="animate-spin text-primary mx-auto mb-3" />
                                <p className="text-sm font-medium text-text">Analyzing Image...</p>
                                <p className="text-xs text-textMuted mt-1">Using Gemini Pro Vision</p>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-outline border-dashed border-outline bg-surfaceLow/50 rounded-xl p-8 cursor-pointer hover:bg-surfaceHigh hover:text-text hover:border-primary/50 transition-all group"
                            >
                                <Upload size={28} className="text-textMuted group-hover:text-primary mx-auto mb-3 transition-colors" />
                                <p className="text-sm font-medium text-text">Click to Upload Image</p>
                                <p className="text-xs text-textMuted mt-1">Supports JPG, PNG</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        )}
                        <p className="mt-4 text-[11px] text-textMuted">Make sure the image is clear and text is legible for best results.</p>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // Class Management view
  if (view === 'class-mgmt') {
      return (
          <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                  <h2 className="font-headline text-xl font-semibold text-text">Class Management</h2>
                  <p className="text-sm text-textMuted mt-0.5">Manage attendance and reports for your class.</p>
              </div>

              {/* Mark Attendance Card */}
              <div className="bg-surface text-text border border-outline rounded-xl p-5">
                  <h3 className="font-headline text-sm font-semibold text-text mb-3">Mark Attendance for Absent Students</h3>
                  <div className="flex gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={15} />
                        <input
                          type="text"
                          placeholder="Search student by name or matric..."
                          className="w-full bg-surfaceLow border border-outline rounded-lg pl-9 pr-4 py-2 text-sm text-text placeholder:text-textMuted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </div>
                      <button className="px-4 py-2 text-sm font-medium bg-primary text-on-primary-fixedlack rounded-lg hover:bg-primary/90 transition-colors">
                        Search
                      </button>
                  </div>

                  <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center justify-between p-3 bg-surfaceLow/50 rounded-lg border border-outline">
                              <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-surfaceHigh flex items-center justify-center text-xs font-bold text-textMuted">JD</div>
                                  <div>
                                      <p className="text-sm font-medium text-text">John Doe</p>
                                      <p className="text-xs text-textMuted">ENG/2021/00{i}</p>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                      <CheckCircle2 size={13} />
                                      Present
                                  </button>
                                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                      <XCircle size={13} />
                                      Absent
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Class Reports Card */}
              <div className="bg-surface text-text border border-outline rounded-xl p-5">
                  <h3 className="font-headline text-sm font-semibold text-text mb-1">Class Reports</h3>
                  <p className="text-xs text-textMuted mb-4">Generate attendance sheets for lecturers.</p>
                  <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-textMuted bg-surfaceLow border border-outline rounded-lg hover:bg-surfaceLow transition-colors">
                      <span>Download Weekly Summary (PDF)</span>
                      <FileText size={16} className="text-textMuted" />
                  </button>
              </div>
          </div>
      );
  }

  return <StudentDashboard userName={userName} />;
};
