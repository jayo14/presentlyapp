import React, { useState } from 'react';
import { X, AlertCircle, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { authApi } from '../../services/api/auth';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    let label = '';
    let color = '';

    if (score <= 1) {
      label = 'Weak';
      color = 'text-red-500';
    } else if (score === 2) {
      label = 'Fair';
      color = 'text-orange-500';
    } else if (score === 3) {
      label = 'Good';
      color = 'text-yellow-500';
    } else if (score === 4) {
      label = 'Strong';
      color = 'text-green-500';
    } else {
      label = 'Very Strong';
      color = 'text-green-600';
    }

    return { score, label, color };
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, newPassword: value }));
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const validateForm = () => {
    if (!formData.oldPassword) {
      setError('Current password is required');
      return false;
    }
    if (!formData.newPassword) {
      setError('New password is required');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    if (formData.newPassword === formData.oldPassword) {
      setError('New password must be different from current password');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authApi.changePassword(formData.oldPassword, formData.newPassword);
      setSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to change password. Please check your current password and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Change Password</h2>
              <p className="text-sm text-zinc-500">Update your account password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {success ? (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-600 dark:text-green-500 font-semibold">Password Changed Successfully!</p>
                <p className="text-green-600/80 dark:text-green-500/80 text-sm mt-1">
                  Your password has been updated. You can now use it to log in.
                </p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <Input
                    type={showOldPassword ? 'text' : 'password'}
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                    placeholder="Enter your current password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter your new password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-500">Password Strength:</span>
                      <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score <= 1
                            ? 'bg-red-500 w-1/5'
                            : passwordStrength.score === 2
                            ? 'bg-orange-500 w-2/5'
                            : passwordStrength.score === 3
                            ? 'bg-yellow-500 w-3/5'
                            : passwordStrength.score === 4
                            ? 'bg-green-500 w-4/5'
                            : 'bg-green-600 w-full'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1.5">
                      Use at least 8 characters with a mix of letters, numbers, and symbols.
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
