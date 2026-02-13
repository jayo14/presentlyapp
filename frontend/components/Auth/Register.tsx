import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegister, useCurrentUser, useGoogleAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { getFirebaseAuth, GoogleAuthProvider } from '../../services/firebase/config';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { Box, Input, Stack, Text, Heading, VStack, HStack, Spinner, Button } from '@chakra-ui/react';
import { Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();
  const googleAuthMutation = useGoogleAuth();
  const { data: user, isLoading } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectTo = searchParams.get('redirect_to') || '/dashboard';
  const iconColor = '#a1a1aa';

  // Handle redirect result
  useEffect(() => {
    const handleRedirect = async () => {
      const auth = getFirebaseAuth();
      if (!auth) return;

      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const idToken = await result.user.getIdToken();
          setIsRedirecting(true);
          googleAuthMutation.mutate({ idToken }, {
            onSuccess: () => {
              toast.success('Registration Successful');
            },
            onError: (error: any) => {
              setIsRedirecting(false);
              toast.error('Google Auth Failed');
            }
          });
        }
      } catch (error) {
        console.error("Error getting redirect result", error);
      }
    };

    handleRedirect();
  }, [googleAuthMutation]);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      if (!user.onboarding_complete) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, isLoading, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ email, password, password2: password, full_name: name }, {
      onError: (error: any) => {
        toast.error('Registration Failed', {
          description: error.message || 'Failed to create account. Please try again.'
        });
      },
      onSuccess: () => {
        toast.success('Account Created', {
          description: 'Welcome! Setting up your account...'
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

  const handleAppleLogin = () => {
    toast.info('Apple Login', {
      description: 'Apple authentication is coming soon.'
    });
  };

  const onBack = () => navigate(-1);
  const onLoginClick = () => navigate('/login');

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="#09090b"
      >
        <VStack gap={4}>
          <Spinner size="xl" color="yellow.400" thickness="4px" />
          <Text color="gray.400">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box 
      minH="100vh" 
      bg="#09090b"
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      p={4}
      position="relative"
    >
      <SEO 
        title="Register | Presently"
        description="Create a Presently account to start tracking attendance efficiently with GPS-verified check-ins."
      />
      <Box
        as="button"
        onClick={onBack}
        position="absolute"
        top={8}
        left={8}
        color="gray.300"
        _hover={{ color: "white" }}
        display="flex"
        alignItems="center"
        gap={2}
        transition="colors 0.2s"
        zIndex={10}
      >
        <ArrowLeft size={20} />
      </Box>

      <Box w="full" maxW="md">
        <VStack mb={8} textAlign="center">
          <Heading as="h2" size="3xl" fontWeight="bold" color="white" mb={2}>
            Create an account
          </Heading>
          <Text color="gray.400">
            Get started with smart attendance management.
          </Text>
        </VStack>

        <Box 
          bg="#18181b"
          borderWidth={1}
          borderColor="#27272a"
          p={6}
          borderRadius="2xl"
          shadow="lg"
        >
          {registerMutation.error && (
            <Box p={3} bg="rgba(239, 68, 68, 0.1)" borderWidth={1} borderColor="#ef4444" borderRadius="lg" mb={4}>
              <Text fontSize="sm" color="#ef4444">
                {(registerMutation.error as any).message}
              </Text>
            </Box>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack gap={5} align="stretch">
              {/* Full Name Input */}
              <Box>
                <Text as="label" fontSize="sm" fontWeight="medium" color="gray.300" mb={2} display="block">
                  Full Name
                </Text>
                <Box position="relative">
                  <UserIcon 
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
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    pl={12}
                    pr={4}
                    h={14}
                    bg="#27272a"
                    borderColor="#3f3f46"
                    borderRadius="2xl"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "#FFD700", outline: "none", ring: 1, ringColor: "#FFD700" }}
                  />
                </Box>
              </Box>

              {/* Email Input */}
              <Box>
                <Text as="label" fontSize="sm" fontWeight="medium" color="gray.300" mb={2} display="block">
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
                    bg="#27272a"
                    borderColor="#3f3f46"
                    borderRadius="2xl"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "#FFD700", outline: "none", ring: 1, ringColor: "#FFD700" }}
                  />
                </Box>
              </Box>

              {/* Password Input */}
              <Box>
                <Text as="label" fontSize="sm" fontWeight="medium" color="gray.300" mb={2} display="block">
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
                    bg="#27272a"
                    borderColor="#3f3f46"
                    borderRadius="2xl"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
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
              
              <Text fontSize="xs" color="gray.500">
                By clicking "Create Account", you agree to our{' '}
                <Box as="a" href="#" textDecoration="underline">Terms</Box>
                {' '}and{' '}
                <Box as="a" href="#" textDecoration="underline">Privacy Policy</Box>.
              </Text>

              <Button
                type="submit"
                isLoading={registerMutation.isPending}
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
              >
                Create Account
              </Button>
            </VStack>
          </form>

          {/* Divider */}
          <HStack my={8} gap={4}>
            <Box h="1px" bg="#27272a" flex={1} />
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
              Or sign up with
            </Text>
            <Box h="1px" bg="#27272a" flex={1} />
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

          {/* Login Link */}
          <Text mt={8} textAlign="center" fontSize="sm" color="gray.400">
            Already have an account?{' '}
            <Box
              as="button"
              onClick={onLoginClick}
              color="#FFD700"
              fontWeight="semibold"
              _hover={{ color: "#FFE44D", textDecoration: "underline" }}
              transition="colors 0.2s"
            >
              Log in
            </Box>
          </Text>
        </Box>
      </Box>
    </Box>
  );
};