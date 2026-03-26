import React, { useState, useEffect } from 'react';
import {
  QrCode, Users, Clock, MapPin, RefreshCw, X, Check, Circle,
  TrendingUp, Play, Pause, StopCircle, Loader,
  Download, AlertCircle, MoreVertical
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { QRCodeSVG } from 'qrcode.react';

interface Student {
  id: number;
  name: string;
  matricNumber: string;
  checkInTime: string | null;
  status: 'present' | 'absent' | 'pending';
  method?: 'qr' | 'gps' | 'code';
}

interface SessionInfo {
  id: number;
  courseCode: string;
  courseName: string;
  venue: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'paused' | 'ended';
  code: string;
  qrData: string;
}

export const AttendanceDashboard: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qrRefreshCountdown, setQrRefreshCountdown] = useState(30);
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'pending'>('all');

  // Mock data
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    id: 1,
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    venue: 'Room 204, Engineering Block',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    status: 'active',
    code: 'ABC123XY',
    qrData: 'https://getpresently.com.ng/check-in/ABC123XY'
  });

  const [students] = useState<Student[]>([
    { id: 1, name: 'John Doe', matricNumber: 'ENG/2021/001', checkInTime: '10:05 AM', status: 'present', method: 'qr' },
    { id: 2, name: 'Jane Smith', matricNumber: 'ENG/2021/002', checkInTime: '10:03 AM', status: 'present', method: 'gps' },
    { id: 3, name: 'Bob Johnson', matricNumber: 'ENG/2021/003', checkInTime: '10:15 AM', status: 'present', method: 'code' },
    { id: 4, name: 'Alice Williams', matricNumber: 'ENG/2021/004', checkInTime: null, status: 'absent' },
    { id: 5, name: 'Charlie Brown', matricNumber: 'ENG/2021/005', checkInTime: null, status: 'pending' },
    { id: 6, name: 'Diana Prince', matricNumber: 'ENG/2021/006', checkInTime: '10:08 AM', status: 'present', method: 'qr' },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);

    const countdownInterval = setInterval(() => {
      setQrRefreshCountdown(prev => {
        if (prev <= 1) {
          refreshQRCode();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  const refreshQRCode = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setSessionInfo(prev => ({
      ...prev,
      code: newCode,
      qrData: `https://getpresently.com.ng/check-in/${newCode}`
    }));
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handlePauseSession = () => {
    setSessionInfo(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'paused' : 'active'
    }));
  };

  const handleEndSession = () => {
    if (confirm('Are you sure you want to end this session?')) {
      setSessionInfo(prev => ({ ...prev, status: 'ended' }));
      setTimeout(() => navigate(`/dashboard/sessions/${sessionId}/report`), 2000);
    }
  };

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const pendingCount = students.filter(s => s.status === 'pending').length;
  const attendanceRate = Math.round((presentCount / students.length) * 100);

  const filteredStudents = filterStatus === 'all'
    ? students
    : students.filter(s => s.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500/10 text-green-600';
      case 'absent': return 'bg-red-500/10 text-red-600';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      default: return 'bg-surface text-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check size={16} className="text-green-600" />;
      case 'absent': return <X size={16} className="text-red-600" />;
      case 'pending': return <Circle size={16} className="text-yellow-600" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 md:pb-8 animate-in fade-in duration-500">
      <div className="mb-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary">
                {sessionInfo.courseCode} - Live Session
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${sessionInfo.status === 'active' ? 'bg-green-500/10 text-green-600' :
                  sessionInfo.status === 'paused' ? 'bg-yellow-500/10 text-yellow-600' :
                    'bg-red-500/10 text-red-600'
                }`}>
                <Circle size={8} className={`fill-current ${sessionInfo.status === 'active' ? 'animate-pulse' : ''}`} />
                {sessionInfo.status === 'active' ? 'Active' : sessionInfo.status === 'paused' ? 'Paused' : 'Ended'}
              </span>
            </div>
            <p className="text-textMuted text-sm">{sessionInfo.courseName}</p>
          </div>
          <Button onClick={handleRefreshData} variant="secondary" size="sm" disabled={refreshing} className="hidden md:flex">
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface border border-outline rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-textMuted text-sm">Present</span>
              <Check className="text-green-600" size={20} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-green-600">{presentCount}</span>
              <span className="text-textMuted text-sm mb-1">/ {students.length}</span>
            </div>
            <p className="text-textMuted text-xs mt-1">{attendanceRate}% attendance</p>
          </div>

          <div className="bg-surface border border-outline rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-textMuted text-sm">Absent</span>
              <X className="text-red-600" size={20} />
            </div>
            <span className="text-3xl font-bold text-red-600">{absentCount}</span>
            <p className="text-textMuted text-xs mt-1">Not checked in</p>
          </div>

          <div className="bg-surface border border-outline rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-textMuted text-sm">Pending</span>
              <Circle className="text-yellow-600" size={20} />
            </div>
            <span className="text-3xl font-bold text-yellow-600">{pendingCount}</span>
            <p className="text-textMuted text-xs mt-1">Processing...</p>
          </div>

          <div className="bg-surface border border-outline rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-textMuted text-sm">Time</span>
              <Clock className="text-primary" size={20} />
            </div>
            <span className="text-2xl font-bold text-primary">{sessionInfo.startTime}</span>
            <p className="text-textMuted text-xs mt-1">Ends at {sessionInfo.endTime}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-outline rounded-2xl p-4">
            <div className="flex gap-2">
              {['all', 'present', 'absent', 'pending'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filterStatus === status
                      ? 'bg-primary text-background'
                      : 'bg-inputccent text-secondary'
                    }`}
                >
                  {status}
                  {status !== 'all' && `(${status === 'present' ? presentCount : status === 'absent' ? absentCount : pendingCount})`}
                </button>
              ))}
            </div>

            <Button onClick={() => alert('Exporting...')} variant="secondary" size="sm">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>

          <div className="space-y-2">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-surface border border-outline rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getStatusColor(student.status)}`}>
                    {getStatusIcon(student.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline text-primary font-semibold text-sm truncate">{student.name}</h4>
                    <p className="text-textMuted text-xs">{student.matricNumber}</p>
                  </div>
                </div>

                {student.checkInTime && (
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-primary">{student.checkInTime}</p>
                    {student.method && <span className="text-xs text-primary capitalize">via {student.method}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface border border-outline rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-primary font-semibold flex items-center gap-2">
                <QrCode size={20} className="text-primary" />
                QR Code
              </h3>
              <button onClick={refreshQRCode} className="p-2 hover:bg-surfaceLow hover:text-textMuted rounded-full">
                <RefreshCw size={16} className="text-primary" />
              </button>
            </div>

            <div className="bg-surface p-4 rounded-xl mb-4 flex items-center justify-center">
              <QRCodeSVG value={sessionInfo.qrData} size={200} level="H" includeMargin={true} />
            </div>

            <div className="bg-primary/10 rounded-lg p-3 mb-3">
              <p className="text-xs text-textMuted mb-1 text-center">Session Code</p>
              <p className="text-2xl font-mono font-bold text-primary text-center">{sessionInfo.code}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-textMuted">
              <Clock size={14} />
              <span>Refreshes in {qrRefreshCountdown}s</span>
            </div>
          </div>

          <div className="bg-surface border border-outline rounded-2xl p-6 space-y-3">
            <h3 className="font-headline text-primary font-semibold mb-4">Session Controls</h3>

            {sessionInfo.status !== 'ended' && (
              <>
                <Button onClick={handlePauseSession} variant="secondary" className="w-full">
                  {sessionInfo.status === 'active' ? <><Pause size={18} className="mr-2" />Pause</> : <><Play size={18} className="mr-2" />Resume</>}
                </Button>
                <Button onClick={() => alert('Extended')} variant="secondary" className="w-full">
                  <Clock size={18} className="mr-2" />Extend Time
                </Button>
                <Button onClick={handleEndSession} variant="secondary" className="w-full text-red-500">
                  <StopCircle size={18} className="mr-2" />End Session
                </Button>
              </>
            )}

            {sessionInfo.status === 'ended' && (
              <div className="text-center py-4">
                <AlertCircle size={48} className="mx-auto text-textMuted mb-3" />
                <p className="text-primary font-semibold mb-1">Session Ended</p>
                <p className="text-textMuted text-sm">Generating report...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
