import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../Button';
import { Input } from '../Input';
import { Logo } from '../Logo';
import { useResetPassword, useVerifyResetToken } from '../../hooks/useAuth';

type PageState = 'form' | 'success' | 'error' | 'loading' | 'invalid-link';

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const verifyTokenMutation = useVerifyResetToken();
  const resetPasswordMutation = useResetPassword();

  useEffect(() => {
    if (uid && token) {
      verifyTokenMutation.mutate({ uid, token }, {
        onSuccess: (data) => {
          if (data.valid) {
            setPageState('form');
          } else {
            setPageState('invalid-link');
          }
        },
        onError: () => {
          setPageState('invalid-link');
        },
      });
    } else {
      setPageState('invalid-link');
    }
  }, [uid, token]);

  const validatePassword = (pwd: string) => {
    setPassword(pwd);
    setPasswordValidation({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*]/.test(pwd),
    });
  };

  const isPasswordValid =
    Object.values(passwordValidation).every(v => v) &&
    password === confirmPassword &&
    password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || !uid || !token) {
      resetPasswordMutation.reset(); // Clear any old error state
      return;
    }
    resetPasswordMutation.mutate({ uid, token, newPassword: password }, {
      onSuccess: () => setPageState('success'),
      onError: () => setPageState('error'),
    });
  };

  const handleBackToLogin = () => navigate('/login', { replace: true });

  if (pageState === 'loading' || verifyTokenMutation.isPending) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid-link') {
    // ... render invalid link UI
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
       {/* UI for form, success, and error states */}
    </div>
  );
};
