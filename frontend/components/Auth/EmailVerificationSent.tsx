import React, { useState, useEffect } from 'react';
import { Logo } from '../Logo';
import { Mail, ArrowLeft, ExternalLink, HelpCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useSendVerificationOTP } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { Box, VStack, HStack, Text, Heading, Spinner } from '@chakra-ui/react';

// Constants
const VERIFICATION_POLL_INTERVAL = 10000; // 10 seconds
const RESEND_COOLDOWN_SECONDS = 60; // 60 seconds

export const EmailVerificationSent: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, refetch: refetchUser } = useCurrentUser();
  const sendVerificationMutation = useSendVerificationOTP();
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  // Start polling for verification status every 10 seconds
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await refetchUser();
        if (result.data?.is_verified) {
          setIsPolling(false);
          toast.success('Email verified successfully!');
          // Navigate to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      } catch (error) {
        console.debug('Polling error:', error);
      }
    }, VERIFICATION_POLL_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [isPolling, refetchUser, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = () => {
    if (resendCooldown > 0) return;
    
    if (user?.email) {
      sendVerificationMutation.mutate(user.email, {
        onSuccess: () => {
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
          setLastSentTime(new Date());
          toast.success('Verification email sent!');
        },
        onError: () => {
          toast.error('Failed to send verification email');
        }
      });
    }
  };

  // Detect common email providers and create deep links
  const getEmailProvider = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return null;

    if (domain.includes('gmail')) return { name: 'Gmail', url: 'https://mail.google.com' };
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) {
      return { name: 'Outlook', url: 'https://outlook.live.com' };
    }
    if (domain.includes('yahoo')) return { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' };
    if (domain.includes('icloud') || domain.includes('me.com')) {
      return { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' };
    }
    return null;
  };

  const emailProvider = user?.email ? getEmailProvider(user.email) : null;

  const formatLastSentTime = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
      {/* Back Button */}
      <Box
        as="button"
        onClick={() => navigate(-1)}
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

      <Box w="full" maxW="2xl">
        <VStack mb={8} textAlign="center">
          <Logo className="justify-center mb-8 text-2xl" />
          
          {/* Mail Icon with animation */}
          <Box mb={6}>
            <Box bg="rgba(255, 215, 0, 0.1)" p={6} borderRadius="full">
              <Mail size={48} color="#FFD700" />
            </Box>
          </Box>

          {/* Header */}
          <Heading as="h2" size="xl" color="white" mb={3}>
            Verify your Email
          </Heading>
          
          {/* Message */}
          <Text color="gray.400" fontSize="base" lineHeight="relaxed" maxW="xl" mb={4}>
            We've sent a verification link to your university email address. 
            Please click the link to confirm your account and access Presently.
          </Text>
          
          {/* Email Display */}
          <Text color="#FFD700" fontWeight="semibold" fontSize="lg">
            {user?.email}
          </Text>
        </VStack>

        <Box 
          bg="#18181b"
          borderWidth={1}
          borderColor="#27272a"
          p={{ base: 6, md: 8 }}
          borderRadius="2xl"
          shadow="lg"
        >
          <VStack gap={4} align="stretch">
            {/* Primary Action - Check Inbox / Open Mail App */}
            {emailProvider ? (
              <Button 
                onClick={() => window.open(emailProvider.url, '_blank')}
                w="full"
                size="lg"
                bg="#FFD700"
                color="#09090b"
                borderRadius="full"
                fontWeight="bold"
                _hover={{ bg: "#FFE44D" }}
                transition="all 0.2s"
              >
                <Mail size={18} style={{ marginRight: '8px' }} />
                Open {emailProvider.name}
                <ExternalLink size={16} style={{ marginLeft: '8px' }} />
              </Button>
            ) : (
              <Button 
                w="full"
                size="lg"
                bg="#FFD700"
                color="#09090b"
                borderRadius="full"
                fontWeight="bold"
                disabled
              >
                <Mail size={18} style={{ marginRight: '8px' }} />
                Check Inbox
              </Button>
            )}

            {/* Secondary Action - Resend Email */}
            <Button 
              onClick={handleResend}
              w="full"
              size="lg"
              bg="#27272a"
              borderWidth={1}
              borderColor="#3f3f46"
              color="white"
              borderRadius="full"
              fontWeight="medium"
              _hover={{ bg: "#3f3f46" }}
              transition="colors 0.2s"
              disabled={resendCooldown > 0}
              loading={sendVerificationMutation.isPending}
            >
              {sendVerificationMutation.isSuccess && resendCooldown === 0 ? (
                <HStack>
                  <CheckCircle size={18} />
                  <Text>Email Sent!</Text>
                </HStack>
              ) : resendCooldown > 0 ? (
                `Resend Email (${resendCooldown}s)`
              ) : (
                'Resend Verification Email'
              )}
            </Button>

            {/* Status Indicator */}
            {lastSentTime && (
              <Text color="gray.400" fontSize="sm" textAlign="center">
                Last sent: {formatLastSentTime(lastSentTime)}
              </Text>
            )}

            {/* Polling Indicator */}
            {isPolling && (
              <HStack justify="center" color="gray.400" fontSize="sm" pt={2}>
                <Spinner size="sm" />
                <Text>Checking verification status...</Text>
              </HStack>
            )}

            {/* Support Section */}
            <Box pt={4} borderTopWidth={1} borderTopColor="#27272a">
              <HStack justify="center" color="gray.400" fontSize="sm" gap={2}>
                <HelpCircle size={16} />
                <Text>Having trouble?</Text>
                <Box
                  as="button"
                  onClick={() => window.location.href = 'mailto:support@presently.app'}
                  color="#FFD700"
                  _hover={{ textDecoration: "underline" }}
                  fontWeight="medium"
                >
                  Contact Support
                </Box>
              </HStack>
            </Box>
          </VStack>
        </Box>

        {/* Additional Help Text */}
        <Box mt={6} textAlign="center">
          <Text color="gray.400" fontSize="sm">
            Didn't receive the email? Check your spam folder or try resending.
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
