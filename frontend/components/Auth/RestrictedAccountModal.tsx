import React from 'react';
import { ShieldAlert, Mail, LogOut } from 'lucide-react';
import { Button } from '../Button';
import { useLogout } from '../../hooks/useAuth';


interface RestrictedAccountModalProps {
  reason?: string;
  note?: string;
  restrictedAt?: string;
  userEmail?: string;
  userName?: string;
}

const REASON_MESSAGES: Record<string, { title: string; description: string }> = {
  SUSPICIOUS_ACTIVITY: {
    title: 'Anomalous Activity Detected',
    description:
      'Our automated security monitoring system detected unusual or suspicious patterns associated with your account session. To safeguard platform data and prevent potential unauthorized access, your access has been temporarily restricted.',
  },
  SECURITY_FLAG: {
    title: 'Security Verification Flag',
    description:
      'Your account has been flagged during a routine security verification check due to credentials or identity information requiring manual verification.',
  },
  POTENTIAL_FRAUD: {
    title: 'Security Policy Review Required',
    description:
      'Our risk and safety systems flagged activity that potentially violates system terms of service or security guidelines.',
  },
  ACADEMIC_MISCONDUCT: {
    title: 'Academic Integrity Hold',
    description:
      'Your account access has been paused pending an administrative review related to course attendance or academic integrity guidelines.',
  },
  ADMINISTRATIVE_HOLD: {
    title: 'Administrative Hold Placed',
    description:
      'An administrative hold has been applied to your account by institutional administrators or platform managers.',
  },
  OTHER: {
    title: 'Account Access Restricted',
    description:
      'Access to your account dashboard and platform features is currently restricted by system administrators.',
  },
};

export const RestrictedAccountModal: React.FC<RestrictedAccountModalProps> = ({
  reason = 'SUSPICIOUS_ACTIVITY',
  note,
  restrictedAt,
  userEmail,
  userName,
}) => {
  const logoutMutation = useLogout();

  const details = REASON_MESSAGES[reason] || REASON_MESSAGES['SUSPICIOUS_ACTIVITY'];
  const supportEmail = 'help@getpresently.com.ng';
  const mailtoSubject = encodeURIComponent(`Account Restriction Appeal - ${userEmail || 'User'}`);
  const mailtoBody = encodeURIComponent(
    `Hello Support Team,\n\nMy account (${userEmail || ''}) was restricted due to: ${details.title}.\nI believe this restriction was placed in error. Please help review and restore my account access.\n\nThank you,\n${userName || ''}`
  );
  const supportMailto = `mailto:${supportEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-red-100 dark:border-red-900/40 overflow-hidden text-slate-800 dark:text-slate-100 transition-all">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white text-center relative">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
            <ShieldAlert className="w-9 h-9 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Account Access Restricted</h2>
          <p className="text-red-100 text-sm mt-1">Your account privileges are currently paused</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-4 text-left">
            <h3 className="text-base font-semibold text-red-900 dark:text-red-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
              {details.title}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300/90 mt-2 leading-relaxed">
              {details.description}
            </p>
            {note && (
              <div className="mt-3 pt-3 border-t border-red-200/80 dark:border-red-800/60 text-xs text-red-800 dark:text-red-300 italic">
                <span className="font-semibold not-italic text-red-900 dark:text-red-200">Note from Admin: </span>
                "{note}"
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Account:</span>
              <span className="font-medium text-slate-900 dark:text-slate-200">{userEmail || 'N/A'}</span>
            </div>
            {restrictedAt && (
              <div className="flex justify-between">
                <span>Restricted On:</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {new Date(restrictedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            If you believe this restriction was applied by mistake, please contact our support team immediately to verify your identity and restore access.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={supportMailto}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-5 py-3 rounded-xl font-medium text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>

            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              isLoading={logoutMutation.isPending}
              className="px-5 py-3 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
