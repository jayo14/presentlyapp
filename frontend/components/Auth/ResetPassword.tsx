import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword, useVerifyResetToken } from '../../hooks/useAuth';
import { SEO } from '../SEO';
import { ConfettiAnimation } from '../ConfettiAnimation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Box, Input, VStack, HStack, Text, Heading, Spinner, Progress, Button } from '@chakra-ui/react';

type PageState = 'form' | 'success' | 'error' | 'loading' | 'invalid-link';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageState, setPageState] = useState<PageState>('loading');

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

  // Calculate password strength
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 20;
    if (pwd.length >= 12) strength += 15;
    if (/[a-z]/.test(pwd)) strength += 20;
    if (/[A-Z]/.test(pwd)) strength += 20;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(password);
  
  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-[#FDB913]';
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak password';
    if (passwordStrength < 70) return 'Good password';
    return 'Strong password!';
  };

  // Check password requirements
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const allRequirementsMet = requirements.every(req => req.met);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isPasswordValid = allRequirementsMet && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || !uid || !token) return;
    
    resetPasswordMutation.mutate({ uid, token, newPassword: password }, {
      onSuccess: () => {
        setPageState('success');
        toast.success('Password reset successful!');
      },
      onError: (error: any) => {
        setPageState('error');
        const errorMessage = error?.response?.data?.message || 'Failed to reset password';
        toast.error(errorMessage);
      },
    });
  };

  const handleBackToLogin = () => navigate('/login', { replace: true });
  const onBack = () => navigate(-1);

  if (pageState === 'loading' || verifyTokenMutation.isPending) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="#09090b"
      >
        <SEO title="Verifying Reset Link | Presently" />
        <VStack gap={4}>
          <Spinner size="xl" color="yellow.400"  />
          <Text color="gray.400">Verifying reset link...</Text>
        </VStack>
      </Box>
    );
  }

  if (pageState === 'invalid-link') {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="#09090b"
        p={4}
      >
        <SEO title="Invalid Reset Link | Presently" />
        <VStack gap={6} textAlign="center" maxW="md">
          <Heading as="h2" size="xl" color="white">
            Invalid Reset Link
          </Heading>
          <Text color="gray.400">
            This password reset link is invalid or has expired.
          </Text>
          <Button
            onClick={() => navigate('/forgot-password')}
            bg="#FFD700"
            color="#09090b"
            borderRadius="full"
            fontWeight="semibold"
            _hover={{ bg: "#FFE44D" }}
            transition="all 0.2s"
            px={6}
            py={3}
          >
            Request New Link
          </Button>
        </VStack>
      </Box>
    );
  }

  if (pageState === 'success') {
    return <PasswordResetSuccess onBackToLogin={handleBackToLogin} />;
  }

  return (
    <Box 
      minH="100vh" 
      bg="#09090b"
      color="white" 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      p={4}
      position="relative"
    >
      <SEO title="Reset Password | Presently" />
      
      {/* Back Button */}
      <Box
        as="button"
        onClick={onBack}
        position="absolute"
        top={6}
        left={6}
        color="gray.300"
        _hover={{ color: "white" }}
        transition="colors 0.2s"
      >
        <ArrowLeft size={20} />
      </Box>

      <Box w="full" maxW="md">
        {/* Heading */}
        <VStack mb={8} textAlign="center">
          <Heading as="h2" size="3xl" fontWeight="bold" color="white" mb={2}>
            Create new password
          </Heading>
          <Text color="gray.400">
            Your new password must be different from previous used passwords for security.
          </Text>
        </VStack>

        {/* Form Card */}
        <Box 
          bg="#18181b"
          borderWidth={1}
          borderColor="#27272a"
          p={6}
          borderRadius="2xl"
          shadow="lg"
        >
          <form onSubmit={handleSubmit}>
            <VStack gap={5} align="stretch">
              {/* New Password */}
              <Box>
                <Text as="label" fontSize="sm" fontWeight="medium" color="gray.300" mb={2} display="block">
                  New Password
                </Text>
                <Box position="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    pl={4}
                    pr={12}
                    h={14}
                    bg="#27272a"
                    borderColor="#3f3f46"
                    borderRadius="2xl"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "#FFD700", outline: "none", ring: 1, ringColor: "#FFD700" }}
                  />
                  <Box
                    as="button"

                    onClick={() => setShowPassword(!showPassword)}
                    position="absolute"
                    right={4}
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                    _hover={{ color: "white" }}
                    transition="colors 0.2s"
                    zIndex={10}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Box>
                </Box>
              </Box>

              {/* Password Strength Meter */}
              {password && (
                <VStack gap={2} align="stretch">
                  <HStack justify="space-between" fontSize="sm">
                    <Text fontWeight="medium" color="gray.300">
                      Password strength
                    </Text>
                    <Text fontWeight="bold" color="white">
                      {passwordStrength}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={passwordStrength}
                    size="sm"
                    borderRadius="full"
                    sx={{
                      '& > div': {
                        bg: passwordStrength < 40 ? '#ef4444' : 
                            passwordStrength < 70 ? '#eab308' : 
                            '#FFD700'
                      }
                    }}
                  />
                  <Text fontSize="sm" color={
                    passwordStrength >= 70 ? "#FFD700" :
                    passwordStrength >= 40 ? "#eab308" :
                    "#ef4444"
                  }>
                    {password && (passwordStrength >= 70 ? '✓ ' : '') + getStrengthLabel()}
                  </Text>
                </VStack>
              )}

              {/* Confirm Password */}
              <Box>
                <Text as="label" fontSize="sm" fontWeight="medium" color="gray.300" mb={2} display="block">
                  Confirm New Password
                </Text>
                <Box position="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    pl={4}
                    pr={12}
                    h={14}
                    bg="#27272a"
                    borderColor="#3f3f46"
                    borderRadius="2xl"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "#FFD700", outline: "none", ring: 1, ringColor: "#FFD700" }}
                  />
                  <Box
                    as="button"

                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    position="absolute"
                    right={4}
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                    _hover={{ color: "white" }}
                    transition="colors 0.2s"
                    zIndex={10}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Box>
                </Box>
              </Box>

              {/* Error Message */}
              {pageState === 'error' && (
                <Box p={3} bg="rgba(239, 68, 68, 0.1)" borderWidth={1} borderColor="#ef4444" borderRadius="lg">
                  <Text fontSize="sm" color="#ef4444" textAlign="center">
                    Failed to reset password. Please try again.
                  </Text>
                </Box>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={resetPasswordMutation.isPending}
                disabled={!isPasswordValid || resetPasswordMutation.isPending}
                w="full"
                h={14}
                bg="#FFD700"
                color="#09090b"
                borderRadius="2xl"
                fontWeight="bold"
                fontSize="lg"
                _hover={{ bg: "#FFE44D", transform: "translateY(-1px)" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                mt={4}
              >
                Update Password
              </Button>

              {/* Cancel Link */}
              <Text textAlign="center" mt={2}>
                <Box
                  as="button"

                  onClick={handleBackToLogin}
                  color="gray.400"
                  _hover={{ textDecoration: "underline" }}
                  fontWeight="medium"
                  fontSize="sm"
                >
                  Cancel and return to login
                </Box>
              </Text>
            </VStack>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

// Password Reset Success Component
const PasswordResetSuccess: React.FC<{ onBackToLogin: () => void }> = ({ onBackToLogin }) => {
  const [countdown, setCountdown] = useState(5);
  const [showConfetti, setShowConfetti] = useState(true);
  const [cancelRedirect, setCancelRedirect] = useState(false);

  useEffect(() => {
    if (cancelRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onBackToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onBackToLogin, cancelRedirect]);

  const handleCancelRedirect = () => {
    setCancelRedirect(true);
    setCountdown(0);
  };

  return (
    <Box 
      minH="100vh" 
      bg="#09090b"
      color="white" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      p={4}
      position="relative"
    >
      <SEO title="Password Reset Successful | Presently" />
      
      {/* Confetti Animation */}
      <ConfettiAnimation active={showConfetti} duration={3000} count={40} />

      {/* Main Content */}
      <VStack maxW="md" w="full" textAlign="center">
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
        >
          <Box position="relative" mb={8}>
            {/* Outer rings */}
            <Box 
              position="absolute" 
              inset={0} 
              borderRadius="full" 
              bg="#3f3f46"
              opacity={0.2}
              animation="ping 2s cubic-bezier(0, 0, 0.2, 1) infinite"
            />
            <Box 
              position="absolute" 
              inset={0} 
              borderRadius="full" 
              bg="#3f3f46"
              opacity={0.4}
            />
            
            {/* Inner circle */}
            <Box
              w={32}
              h={32}
              bg="#FFD700"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <CheckCircle2 size={64} color="#09090b" strokeWidth={3} />
            </Box>
          </Box>
        </motion.div>

        {/* Title */}
        <Heading as="h1" size="3xl" fontWeight="bold" color="white" mb={4}>
          Password Changed!
        </Heading>

        {/* Message */}
        <Text color="gray.400" mb={12} px={4}>
          Your password has been successfully updated. You can now log in to{' '}
          <Box as="span" color="#FFD700" fontWeight="semibold">
            Presently
          </Box>{' '}
          with your new credentials.
        </Text>

        {/* Login Button */}
        <Button
          onClick={onBackToLogin}
          w="full"
          maxW="md"
          size="lg"
          bg="#FFD700"
          color="#09090b"
          borderRadius="full"
          fontWeight="bold"
          _hover={{ bg: "#FFE44D" }}
          transition="all 0.2s"
          shadow="lg"
          mb={4}
        >
          Back to Login
        </Button>

        {/* Countdown */}
        {!cancelRedirect && countdown > 0 && (
          <Box
            as="button"
            onClick={handleCancelRedirect}
            fontSize="sm"
            color="gray.400"
            _hover={{ color: "white" }}
            transition="colors 0.2s"
          >
            Redirecting in {countdown} seconds...{' '}
            <Box as="span" textDecoration="underline">
              Cancel
            </Box>
          </Box>
        )}

        {cancelRedirect && (
          <Text fontSize="sm" color="gray.500">
            Auto-redirect cancelled
          </Text>
        )}
      </VStack>
    </Box>
  );
};
