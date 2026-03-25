import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showRequirements = true,
}) => {
  // Calculate password strength
  const requirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const metRequirements = requirements.filter(req => req.met).length;
  const strength = (metRequirements / requirements.length) * 100;

  // Determine strength level and color
  let strengthText = '';
  let strengthColor = '';
  
  if (strength === 0) {
    strengthText = '';
    strengthColor = 'bg-border-light';
  } else if (strength < 40) {
    strengthText = 'Weak';
    strengthColor = 'bg-error dark:bg-error-dark';
  } else if (strength < 60) {
    strengthText = 'Fair';
    strengthColor = 'bg-warning dark:bg-warning-dark';
  } else if (strength < 80) {
    strengthText = 'Good';
    strengthColor = 'bg-primary';
  } else {
    strengthText = 'Strong';
    strengthColor = 'bg-success dark:bg-success-dark';
  }

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      {password && (
        <div className="space-y-1.5">
          <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strengthColor}`}
              style={{ width: `${strength}%` }}
            />
          </div>
          {strengthText && (
            <p className={`text-sm font-medium ${
              strength < 40 ? 'text-error dark:text-error-dark' :
              strength < 60 ? 'text-warning dark:text-warning-dark' :
              strength < 80 ? 'text-primary' :
              'text-success dark:text-success-dark'
            }`}>
              {strengthText} password {strength >= 80 && '✓'}
            </p>
          )}
        </div>
      )}

      {/* Requirements checklist */}
      {showRequirements && password && (
        <ul className="space-y-2">
          {requirements.map((req, index) => (
            <li
              key={index}
              className={`flex items-center gap-2 text-sm transition-colors ${
                req.met
                  ? 'text-success dark:text-success-dark'
                  : 'text-tertiary dark:text-dark-text-tertiary'
              }`}
            >
              {req.met ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
