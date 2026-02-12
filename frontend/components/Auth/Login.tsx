import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLogin, useCurrentUser, useGoogleAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { getFirebaseAuth, GoogleAuthProvider } from '../../services/firebase/config';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { Box, Input, Checkbox, Stack, Text, Heading, VStack, HStack, Spinner } from '@chakra-ui/react';
import { Button } from '../Button';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const loginMutation = useLogin();
  const googleAuthMutation = useGoogleAuth();
  const { data: user, isLoading } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Theme-aware colors - hardcoded for dark mode
  const bgColor = '#09090b';
  const cardBg = '#18181b';
  const cardBorder = '#27272a';
  const inputBg = '#27272a';
  const inputBorder = '#3f3f46';
  const textPrimary = 'white';
  const textSecondary = '#a1a1aa';
  const iconColor = '#6b7280';

  const redirectTo = searchParams.get('redirect_to') || '/dashboard';
  const message = searchParams.get('message');

  // Handle redirect result
  useEffect(() => {
    if (message) {
        toast.info(message, { id: 'login-message' });
    }
  }, [message]);

  useEffect(() => {
    const handleRedirect = async () => {
      const auth = getFirebaseAuth();
      if (!auth) return;

      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const idToken = await result.user.getIdToken();
          setIsRedirecting(true);
          // Use the rememberMe state to respect user's checkbox preference
          googleAuthMutation.mutate({ idToken, rememberMe }, {
            onSuccess: () => {
              toast.success('Login Successful');
            },
            onError: (error: any) => {
              setIsRedirecting(false);
              toast.error('Google Login Failed');
            }
          });
        }
      } catch (error) {
        console.error("Error getting redirect result", error);
      }
    };

    handleRedirect();
  }, [googleAuthMutation, rememberMe]);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setIsRedirecting(true);
      const pendingCheckIn = localStorage.getItem('pending_checkin');
      const explicitRedirect = searchParams.get('redirect_to');

      if (!user.onboarding_complete) {
        navigate('/onboarding', { replace: true });
      } else if (explicitRedirect) {
        navigate(explicitRedirect, { replace: true });
      } else if (pendingCheckIn) {
        localStorage.removeItem('pending_checkin');
        navigate(`/check-in/${pendingCheckIn}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isLoading, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedirecting(true);
    loginMutation.mutate({ email, password, rememberMe }, {
      onError: (error: any) => {
        setIsRedirecting(false);
        // Extract error message from API response
        let errorMessage = 'Invalid credentials. Please try again.';
        const errorData = error.response?.data;
        
        if (errorData) {
          if (errorData.errors?.non_field_errors) {
            errorMessage = errorData.errors.non_field_errors[0];
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0];
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }

        toast.error('Login Failed', {
          description: errorMessage
        });
      },
      onSuccess: () => {
        toast.success('Login Successful', {
          description: 'Welcome back! Redirecting to dashboard...'
        });
      }
    });
  };

  const handleGoogleLogin = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      toast.error('Google Auth Error', {
        description: 'Firebase is not configured properly.'
      });
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      // Use redirect instead of popup for more consistent cross-device experience
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Google Auth Popup Error:', error);
        toast.error('Google Auth Error', {
          description: error.message || 'Failed to open Google login popup.'
        });
      }
    }
  };

  const onBack = () => navigate(-1);
  const onRegisterClick = () => navigate('/register');

  // Show loading state while checking auth or redirecting
  if (isLoading || isRedirecting) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg={bgColor}
      >
        <VStack gap={4}>
          <Spinner size="xl" color="yellow.400" thickness="4px" />
          <Text color={textSecondary}>
            {isRedirecting ? 'Redirecting to dashboard...' : 'Loading...'}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box 
      minH="100vh" 
      bg={bgColor}
      color={textPrimary}
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      p={4}
      position="relative"
    >
      <SEO 
        title="Login | Presently"
        description="Sign in to your Presently account to manage attendance, track sessions, and view analytics."
      />
      
      {/* Back Button */}
      <Box 
        as="button"
        onClick={onBack} 
        position="absolute"
        top={6}
        left={6}
        color={textSecondary}
        _hover={{ color: textPrimary }}
        display="flex"
        alignItems="center"
        gap={2}
        transition="colors 0.2s"
      >
        <ArrowLeft size={20} />
      </Box>

      <Box w="full" maxW="md">
        {/* Title */}
        <VStack mb={8} textAlign="center">
          <Heading as="h2" size="2xl" color={textPrimary} mb={2}>
            Welcome back
          </Heading>
          <Text color={textSecondary}>
            Enter your credentials to access your account.
          </Text>
        </VStack>

        {/* Login Form Card */}
        <Box 
          bg={cardBg}
          borderWidth={1}
          borderColor={cardBorder}
          p={6}
          borderRadius="2xl"
          shadow="lg"
        >
          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              {/* Email Input */}
              <Box>
                <Text as="label" fontSize="sm" fontWeight="medium" color={textPrimary} mb={2} display="block">
                  Email
                </Text>
                <Box position="relative">
                  <Mail 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: iconColor
                    }} 
                    size={18} 
                  />
                  <Input
                    type="email"
                    placeholder="name@university.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    pl={10}
                    pr={4}
                    py={3}
                    bg={inputBg}
                    borderColor={inputBorder}
                    borderRadius="full"
                    color={textPrimary}
                    _placeholder={{ color: textSecondary }}
                    _focus={{ borderColor: "#FFD700", outline: "none" }}
                  />
                </Box>
              </Box>

              {/* Password Input */}
              <Box>
                <Text as="label" fontSize="sm" fontWeight="medium" color={textPrimary} mb={2} display="block">
                  Password
                </Text>
                <Box position="relative">
                  <Lock 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: iconColor
                    }} 
                    size={18} 
                  />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    pl={10}
                    pr={4}
                    py={3}
                    bg={inputBg}
                    borderColor={inputBorder}
                    borderRadius="full"
                    color={textPrimary}
                    _placeholder={{ color: textSecondary }}
                    _focus={{ borderColor: "#FFD700", outline: "none" }}
                  />
                </Box>
              </Box>
              
              {/* Remember Me & Forgot Password */}
              <HStack justify="space-between" fontSize="sm">
                <Checkbox
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  colorScheme="yellow"
                  borderColor={inputBorder}
                >
                  <Text color={textSecondary}>Remember me</Text>
                </Checkbox>
                <Box
                  as="button"
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  color="#FFD700"
                  fontWeight="medium"
                  _hover={{ color: "#FFE44D" }}
                  transition="colors 0.2s"
                >
                  Forgot password?
                </Box>
              </HStack>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                w="full"
                bg="#FFD700"
                color="#09090b"
                py={3}
                borderRadius="full"
                fontWeight="bold"
                _hover={{ bg: "#FFE44D" }}
                transition="all 0.2s"
                _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
              >
                {loginMutation.isPending ? (
                  <HStack>
                    <Spinner size="sm" color="#09090b" />
                    <Text>Signing in...</Text>
                  </HStack>
                ) : (
                  'Sign In'
                )}
              </Button>
            </VStack>
          </form>

          {/* Divider */}
          <HStack my={6} gap={4}>
            <Box h="1px" bg={cardBorder} flex={1} />
            <Text fontSize="xs" color={textSecondary} textTransform="uppercase">
              Or continue with
            </Text>
            <Box h="1px" bg={cardBorder} flex={1} />
          </HStack>

          {/* Google Sign In */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleAuthMutation.isPending || isRedirecting}
            w="full"
            bg={inputBg}
            borderWidth={1}
            borderColor={inputBorder}
            color={textPrimary}
            fontWeight="medium"
            py={3}
            borderRadius="full"
            _hover={{ bg: cardBg }}
            transition="colors 0.2s"
            _disabled={{ opacity: 0.5 }}
          >
            {googleAuthMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              <HStack gap={3}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <Text>Google</Text>
              </HStack>
            )}
          </Button>

          {/* Sign Up Link */}
          <Text mt={6} textAlign="center" fontSize="sm" color={textSecondary}>
            Don't have an account?{' '}
            <Box
              as="button"
              onClick={() => navigate('/register')}
              color="#FFD700"
              fontWeight="semibold"
              _hover={{ color: "#FFE44D" }}
              transition="colors 0.2s"
            >
              Sign up
            </Box>
          </Text>
        </Box>
      </Box>
    </Box>
  );
};