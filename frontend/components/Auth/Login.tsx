import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLogin, useCurrentUser, useGoogleAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { getFirebaseAuth, GoogleAuthProvider } from '../../services/firebase/config';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { Box, Input, Text, Heading, VStack, HStack, Button } from '@chakra-ui/react';
import { LoadingScreen } from '../LoadingScreen';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { LoadingScreen } from '../LoadingScreen';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const loginMutation = useLogin();
  const googleAuthMutation = useGoogleAuth();
  const { data: user, isLoading } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasHandledRedirect, setHasHandledRedirect] = useState(false);

  // Theme-aware colors (dark mode optimized)
  const bgColor = '#09090b';
  const cardBg = '#18181b';
  const cardBorder = '#27272a';
  const inputBg = '#27272a';
  const inputBorder = '#3f3f46';
  const textPrimary = 'white';
  const textSecondary = '#a1a1aa';
  const iconColor = '#a1a1aa';

  const redirectTo = searchParams.get('redirect_to') || '/dashboard';
  const message = searchParams.get('message');

  // Handle redirect result
  useEffect(() => {
    if (message) {
        toast.info(message, { id: 'login-message' });
    }
  }, [message]);

  // Handle Google OAuth redirect - only once
  useEffect(() => {
    if (hasHandledRedirect) return;
    
    const handleRedirect = async () => {
      const auth = getFirebaseAuth();
      if (!auth) return;

      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setHasHandledRedirect(true);
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
  }, [hasHandledRedirect, googleAuthMutation, rememberMe]);

  // Auto-redirect if user is already logged in - optimized to only run once
  useEffect(() => {
    if (!user || isLoading || isRedirecting) return;

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

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Auth Error', {
        description: 'Google Client ID is not configured.'
      });
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

    window.location.href = authUrl;
  };

  const handleAppleLogin = () => {
    toast.info('Apple Login', {
      description: 'Apple authentication is coming soon.'
    });
  };

  const onBack = () => navigate(-1);
  const onRegisterClick = () => navigate('/register');

  // Only show loading if we're redirecting OR if we have a user and are still loading
  const shouldShowLoading = isRedirecting || (user && isLoading);

  // Show loading state only when redirecting
  if (shouldShowLoading) {
    return <LoadingScreen message="Redirecting to dashboard" />;
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
        zIndex={10}
      >
        <ArrowLeft size={20} />
      </Box>

      <Box w="full" maxW="md">
        {/* Title */}
        <VStack mb={8} textAlign="center">
          <Heading as="h2" size="3xl" fontWeight="bold" color={textPrimary} mb={2}>
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
            <VStack gap={5} align="stretch">
              {/* Email Input */}
              <Box>
                <Text as="label" fontSize="sm" fontWeight="medium" color={textPrimary} mb={2} display="block">
                  Email
                </Text>
                <Box position="relative">
                  <Mail 
                    style={{ 
                      position: 'absolute', 
                      left: '16px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: iconColor,
                      zIndex: 10
                    }} 
                    size={20} 
                  />
                  <Input
                    type="email"
                    placeholder="name@university.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    pl={12}
                    pr={4}
                    h={14}
                    bg={inputBg}
                    borderColor={inputBorder}
                    borderRadius="2xl"
                    color={textPrimary}
                    _placeholder={{ color: textSecondary }}
                    _focus={{ borderColor: "#FFD700", outline: "none", ring: 1, ringColor: "#FFD700" }}
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
                      left: '16px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: iconColor,
                      zIndex: 10
                    }} 
                    size={20} 
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    pl={12}
                    pr={12}
                    h={14}
                    bg={inputBg}
                    borderColor={inputBorder}
                    borderRadius="2xl"
                    color={textPrimary}
                    _placeholder={{ color: textSecondary }}
                    _focus={{ borderColor: "#FFD700", outline: "none", ring: 1, ringColor: "#FFD700" }}
                  />
                  <Box
                    as="button"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    position="absolute"
                    right="16px"
                    top="50%"
                    transform="translateY(-50%)"
                    color={iconColor}
                    _hover={{ color: "#FFD700" }}
                    transition="color 0.2s"
                    cursor="pointer"
                    zIndex={10}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Box>
                </Box>
              </Box>
              
              {/* Remember Me & Forgot Password */}
              <HStack justify="space-between" fontSize="sm">
                <HStack gap={2}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      accentColor: '#FFD700',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <Text color={textSecondary}>Remember me</Text>
                </HStack>
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
                h={14}
                borderRadius="2xl"
                fontWeight="bold"
                fontSize="lg"
                _hover={{ bg: "#FFE44D", transform: "translateY(-1px)" }}
                _active={{ transform: "translateY(0)" }}
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
          <HStack my={8} gap={4}>
            <Box h="1px" bg={cardBorder} flex={1} />
            <Text fontSize="xs" color={textSecondary} textTransform="uppercase" fontWeight="bold">
              Or continue with
            </Text>
            <Box h="1px" bg={cardBorder} flex={1} />
          </HStack>

          {/* OAuth Buttons */}
          <HStack justify="center" gap={6} mb={4}>
            {/* Google */}
            <Box
              as="button"
              onClick={handleGoogleLogin}
              disabled={googleAuthMutation.isPending || isRedirecting}
              w={14}
              h={14}
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.05)"
              backdropFilter="blur(10px)"
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.1)"
              _hover={{ bg: "rgba(255, 255, 255, 0.1)", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              _disabled={{ opacity: 0.5 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </Box>

            {/* Apple */}
            <Box
              as="button"
              onClick={handleAppleLogin}
              w={14}
              h={14}
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.05)"
              backdropFilter="blur(10px)"
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.1)"
              _hover={{ bg: "rgba(255, 255, 255, 0.1)", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.96.95-2.45 2.1-4.05 2.1-1.45 0-2.1-.8-3.65-.8-1.55 0-2.3.75-3.6.8-1.5.05-3.1-1.25-4.15-2.85-1.95-3.15-1.5-8.25.95-11.5 1.25-1.6 2.85-2.6 4.6-2.6 1.45 0 2.3.85 3.55.85s2.1-.9 3.8-.85c1.45.05 2.75.65 3.65 1.7-3.05 1.8-2.55 6 .65 7.4-.7 1.7-1.6 3.4-2.75 4.85zM12.03 5.48c-.05-1.85 1.55-3.65 3.35-3.7.25 1.95-1.7 3.8-3.35 3.7z"/>
              </svg>
            </Box>
          </HStack>

          {/* Sign Up Link */}
          <Text mt={8} textAlign="center" fontSize="sm" color={textSecondary}>
            Don't have an account?{' '}
            <Box
              as="button"
              onClick={() => navigate('/register')}
              color="#FFD700"
              fontWeight="semibold"
              _hover={{ color: "#FFE44D", textDecoration: "underline" }}
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