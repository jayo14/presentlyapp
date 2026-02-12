import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegister, useCurrentUser, useGoogleAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { getFirebaseAuth, GoogleAuthProvider } from '../../services/firebase/config';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { Box, Input, Stack, Text, Heading, VStack, HStack, Spinner, Alert } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { Logo } from '../Logo';
import { Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const registerMutation = useRegister();
  const googleAuthMutation = useGoogleAuth();
  const { data: user, isLoading } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectTo = searchParams.get('redirect_to') || '/dashboard';

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
          googleAuthMutation.mutate(idToken, {
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
      >
        <ArrowLeft size={18} /> Back
      </Box>

      <Box w="full" maxW="md">
        <VStack mb={8} textAlign="center">
          <Logo className="justify-center mb-6 text-2xl" />
          <Heading as="h2" size="xl" color="white">
            Create an account
          </Heading>
          <Text color="gray.400" mt={2}>
            Get started with smart attendance management.
          </Text>
        </VStack>

        <Box 
          bg="#18181b"
          borderWidth={1}
          borderColor="#27272a"
          p={8}
          borderRadius="2xl"
          shadow="lg"
        >
          {registerMutation.error && (
            <Alert.Root status="error" mb={4} borderRadius="lg">
              <Alert.Icon />
              <Alert.Description fontSize="sm">
                {registerMutation.error.message}
              </Alert.Description>
            </Alert.Root>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              {/* Full Name Input */}
              <Box>
                <Text as="label" fontSize="sm" fontWeight="medium" color="gray.300" mb={2} display="block">
                  Full Name
                </Text>
                <Box position="relative">
                  <UserIcon 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#6B7280'
                    }} 
                    size={16} 
                  />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    pl={10}
                    pr={4}
                    py={3}
                    bg="#27272a"
                    borderColor="#3f3f46"
                    borderRadius="full"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "#FFD700", outline: "none" }}
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
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#6B7280'
                    }} 
                    size={16} 
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
                    bg="#27272a"
                    borderColor="#3f3f46"
                    borderRadius="full"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "#FFD700", outline: "none" }}
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
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#6B7280'
                    }} 
                    size={16} 
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
                    bg="#27272a"
                    borderColor="#3f3f46"
                    borderRadius="full"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "#FFD700", outline: "none" }}
                  />
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
                loading={registerMutation.isPending}
                w="full"
                size="lg"
                bg="#FFD700"
                color="#09090b"
                borderRadius="full"
                fontWeight="bold"
                _hover={{ bg: "#FFE44D" }}
                transition="all 0.2s"
              >
                Create Account
              </Button>
            </VStack>
          </form>

          {/* Divider */}
          <HStack my={6} gap={4}>
            <Box h="1px" bg="#27272a" flex={1} />
            <Text fontSize="xs" color="gray.500" textTransform="uppercase">
              Or sign up with
            </Text>
            <Box h="1px" bg="#27272a" flex={1} />
          </HStack>

          {/* Google Sign Up */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleAuthMutation.isPending || isRedirecting}
            w="full"
            bg="white"
            borderWidth={1}
            borderColor="#27272a"
            color="#09090b"
            fontWeight="medium"
            h={12}
            borderRadius="full"
            _hover={{ bg: "#f4f4f5" }}
            transition="colors 0.2s"
            _disabled={{ opacity: 0.5 }}
          >
            {googleAuthMutation.isPending ? (
              <Spinner size="sm" color="#09090b" />
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

          {/* Login Link */}
          <Text mt={6} textAlign="center" fontSize="sm" color="gray.400">
            Already have an account?{' '}
            <Box
              as="button"
              onClick={onLoginClick}
              color="#FFD700"
              fontWeight="semibold"
              _hover={{ textDecoration: "underline" }}
            >
              Log in
            </Box>
          </Text>
        </Box>
      </Box>
    </Box>
  );
};