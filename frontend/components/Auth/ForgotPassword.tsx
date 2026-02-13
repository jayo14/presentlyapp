import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Lock, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRequestPasswordReset } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../SEO';
import { toast } from 'sonner';
import { Box, Input, VStack, HStack, Text, Heading, Spinner } from '@chakra-ui/react';

type PageState = 'form' | 'sent' | 'error';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pageState, setPageState] = useState<PageState>('form');
  const [emailError, setEmailError] = useState('');
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const requestPasswordResetMutation = useRequestPasswordReset();

  // Rate limiting - 1 email per 2 minutes (120 seconds)
  const COOLDOWN_SECONDS = 120;

  useEffect(() => {
    if (lastSentTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastSentTime) / 1000);
        const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
        setCooldownRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lastSentTime]);

  // Real-time email validation
  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError('');
      return false;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Optional: Check for university domain if configured
    // Remove .edu check to allow international institutions
    // This can be configured via environment variable if needed
    // Example: VITE_REQUIRE_EDU_EMAIL=true

    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const clearEmail = () => {
    setEmail('');
    setEmailError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (cooldownRemaining > 0) {
      toast.error(`Please wait ${cooldownRemaining} seconds before requesting another link`);
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    requestPasswordResetMutation.mutate(email, {
      onSuccess: () => {
        setPageState('sent');
        setLastSentTime(Date.now());
        toast.success('Reset link sent to your email!');
      },
      onError: (error: any) => {
        setPageState('error');
        const errorMessage = error?.response?.data?.message || 'Failed to send reset link. Please try again.';
        toast.error(errorMessage);
      },
    });
  };

  const handleReset = () => {
    setEmail('');
    setEmailError('');
    requestPasswordResetMutation.reset();
    setPageState('form');
  };

  const onBack = () => navigate(-1);

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      <SEO 
        title="Forgot Password | Presently"
        description="Reset your Presently password to regain access to your account."
      />
      
      {/* Back Button */}
      <Box
        as="button"
        onClick={onBack}
        position="absolute"
        top={6}
        left={6}
        color="gray.300"
        _hover={{ color: "white" }}
        display="flex"
        alignItems="center"
        gap={2}
        transition="colors 0.2s"
      >
        <ArrowLeft size={20} />
      </Box>

      <Box w="full" maxW="md">
        {/* Icon with Lock */}
        <VStack mb={8} textAlign="center">
          <Box
            w={24}
            h={24}
            borderRadius="full"
            bg="#FFD700"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={6}
          >
            <Lock size={48} color="#09090b" strokeWidth={2.5} />
          </Box>
          
          <Heading as="h2" size="3xl" fontWeight="bold" color="white" mb={2}>
            Reset Password
          </Heading>
          <Text color="gray.400" textAlign="center">
            Enter your registered university email address and we'll send you a secure link to reset your password.
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
          {pageState === 'form' && (
            <form onSubmit={handleSubmit}>
              <VStack gap={5} align="stretch">
                {/* Email Input */}
                <Box>
                  <Text as="label" fontSize="sm" fontWeight="medium" color="gray.300" mb={2} display="block">
                    University Email
                  </Text>
                  <Box position="relative">
                    <Mail 
                      style={{ 
                        position: 'absolute', 
                        left: '16px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: '#6B7280',
                        zIndex: 10
                      }} 
                      size={20} 
                    />
                    <Input
                      type="email"
                      placeholder="name@university.edu"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      disabled={requestPasswordResetMutation.isPending}
                      pl={12}
                      pr={email ? 12 : 4}
                      h={14}
                      bg="#27272a"
                      borderColor={emailError ? "#ef4444" : "#3f3f46"}
                      borderRadius="2xl"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: emailError ? "#ef4444" : "#FFD700", outline: "none", ring: 1, ringColor: emailError ? "#ef4444" : "#FFD700" }}
                    />
                    {email && !requestPasswordResetMutation.isPending && (
                      <Box
                        as="button"
                        type="button"
                        onClick={clearEmail}
                        position="absolute"
                        right="16px"
                        top="50%"
                        transform="translateY(-50%)"
                        color="gray.400"
                        _hover={{ color: "white" }}
                        transition="colors 0.2s"
                        zIndex={10}
                      >
                        <X size={20} />
                      </Box>
                    )}
                  </Box>
                  {emailError && (
                    <HStack mt={2} color="red.400" fontSize="xs">
                      <AlertCircle size={14} />
                      <Text>{emailError}</Text>
                    </HStack>
                  )}
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={requestPasswordResetMutation.isPending || !email || !!emailError || cooldownRemaining > 0}
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
                >
                  {requestPasswordResetMutation.isPending ? (
                    <HStack>
                      <Spinner size="sm" color="#09090b" />
                      <Text>Sending...</Text>
                    </HStack>
                  ) : cooldownRemaining > 0 ? (
                    `Wait ${formatCooldown(cooldownRemaining)}`
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                {/* Support Link */}
                <Text textAlign="center" fontSize="sm" color="gray.400" mt={2}>
                  Having trouble?{' '}
                  <Box
                    as="button"
                    type="button"
                    onClick={() => window.open('mailto:support@presently.app', '_blank')}
                    color="#FFD700"
                    fontWeight="semibold"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Contact Support
                  </Box>
                </Text>
              </VStack>
            </form>
          )}

          {/* Success Status */}
          {pageState === 'sent' && (
            <VStack gap={6} textAlign="center">
              <Box
                w={16}
                h={16}
                borderRadius="full"
                bg="green.500"
                opacity={0.1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
              >
                <CheckCircle size={40} color="#22c55e" />
              </Box>
              <VStack gap={2}>
                <Heading as="h3" size="lg" color="green.400">
                  Link sent!
                </Heading>
                <Text color="gray.400">
                  Check your email for the password reset link.
                </Text>
              </VStack>
              <Box
                as="button"
                onClick={handleReset}
                color="#FFD700"
                fontWeight="semibold"
                _hover={{ textDecoration: "underline" }}
              >
                Send to a different email
              </Box>
            </VStack>
          )}

          {/* Error Status */}
          {pageState === 'error' && (
            <VStack gap={6} textAlign="center">
              <Box
                w={16}
                h={16}
                borderRadius="full"
                bg="red.500"
                opacity={0.1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
              >
                <AlertCircle size={40} color="#ef4444" />
              </Box>
              <VStack gap={2}>
                <Heading as="h3" size="lg" color="red.400">
                  Something went wrong
                </Heading>
                <Text color="gray.400">
                  We couldn't send the reset link. Please try again.
                </Text>
              </VStack>
              <Button
                onClick={handleReset}
                w="full"
                bg="#FFD700"
                color="#09090b"
                borderRadius="full"
                fontWeight="semibold"
                _hover={{ bg: "#FFE44D" }}
                transition="all 0.2s"
              >
                Try Again
              </Button>
            </VStack>
          )}
        </Box>
      </Box>
    </Box>
  );
};
