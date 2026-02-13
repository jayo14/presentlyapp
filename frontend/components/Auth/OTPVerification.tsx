import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from '../SEO';
import { useVerifyEmailOTP, useResendEmailVerification } from '../../hooks/useAuth';
import { Haptics } from '@capacitor/haptics';
import { Box, Input, VStack, HStack, Text, Heading, Spinner, Button } from '@chakra-ui/react';

export const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = useVerifyEmailOTP();
  const resendMutation = useResendEmailVerification();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Haptic feedback on digit entry
    try {
      if (typeof Haptics !== 'undefined') {
        Haptics.impact({ style: 'light' });
      }
    } catch (error) {
      // Haptics not available on web or unsupported platform
      console.debug('Haptics not available:', error);
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit on 6th digit
    if (index === 5 && value) {
      const completeOtp = [...newOtp];
      completeOtp[5] = value;
      if (completeOtp.every(digit => digit !== '') && email) {
        setTimeout(() => {
          verifyMutation.mutate({ email, otp: completeOtp.join('') });
        }, 300);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6 && email) {
      verifyMutation.mutate({ email, otp: otpCode });
    }
  };

  const handleResend = () => {
    if (canResend && email) {
      resendMutation.mutate(email, {
        onSuccess: () => {
          setCountdown(60);
          setCanResend(false);
        }
      });
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  const progress = (60 - countdown) / 60 * 100;

  // Format phone number for display
  const formatPhoneDisplay = (phoneNum: string) => {
    if (!phoneNum) return '';
    const cleaned = phoneNum.replace(/\D/g, '');
    const last2 = cleaned.slice(-2);
    return `+1 (555) *** ***${last2}`;
  };

  // Format countdown time
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return seconds < 60 ? seconds : `${minutes}:${String(seconds).padStart(2, '0')}`;
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
      <SEO title="OTP Verification | Presently" />
      
      {/* Back Button */}
      <Box
        as="button"
        onClick={() => navigate(-1)}
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
        {/* Header */}
        <VStack mb={12} textAlign="center">
          <Heading as="h1" size="3xl" fontWeight="bold" color="white" mb={4}>
            Verify your {email ? 'email' : 'phone number'}
          </Heading>
          <Text color="gray.400" mb={2}>
            Enter the 6-digit code we sent to
          </Text>
          <Text color="#FFD700" fontWeight="medium">
            {email || formatPhoneDisplay(phone)}
          </Text>
        </VStack>

        {/* OTP Input */}
        <HStack gap={3} justify="center" mb={8} onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              w={12}
              h={14}
              textAlign="center"
              fontSize="2xl"
              fontWeight="bold"
              bg="#18181b"
              borderWidth={2}
              borderColor={digit ? "#FFD700" : "#27272a"}
              borderRadius="xl"
              color="white"
              _focus={{ 
                outline: "none", 
                ring: 2,
                ringColor: "#FFD700",
                borderColor: "#FFD700"
              }}
              transition="all 0.2s"
            />
          ))}
        </HStack>

        {/* Timer Display */}
        <HStack gap={4} justify="center" mb={8}>
          <VStack gap={0} textAlign="center">
            <Box 
              bg="#18181b"
              borderRadius="xl"
              px={6}
              py={3}
              mb={2}
              borderWidth={1}
              borderColor="#27272a"
            >
              <Text fontSize="3xl" fontWeight="bold" color="white">
                {Math.floor(countdown / 60).toString().padStart(2, '0')}
              </Text>
            </Box>
            <Text fontSize="xs" color="gray.400">Minutes</Text>
          </VStack>
          <Text fontSize="3xl" fontWeight="bold" color="gray.500" pb={8}>:</Text>
          <VStack gap={0} textAlign="center">
            <Box 
              bg="#18181b"
              borderRadius="xl"
              px={6}
              py={3}
              mb={2}
              borderWidth={1}
              borderColor="#27272a"
            >
              <Text fontSize="3xl" fontWeight="bold" color="white">
                {(countdown % 60).toString().padStart(2, '0')}
              </Text>
            </Box>
            <Text fontSize="xs" color="gray.400">Seconds</Text>
          </VStack>
        </HStack>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={!isOtpComplete || verifyMutation.isPending}
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
          mb={6}
        >
          {verifyMutation.isPending ? (
            <HStack>
              <Spinner size="sm" color="#09090b" />
              <Text>Verifying...</Text>
            </HStack>
          ) : (
            'Verify Code'
          )}
        </Button>

        {/* Resend Section */}
        <VStack gap={2} textAlign="center">
          <Text color="gray.400" fontSize="sm">
            Didn't receive the code?
          </Text>
          <Box
            as="button"
            onClick={handleResend}
            disabled={!canResend || resendMutation.isPending}
            color="#FFD700"
            fontWeight="medium"
            _hover={{ color: "#FFE44D" }}
            transition="colors 0.2s"
            _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
          >
            {resendMutation.isPending ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${countdown}s`}
          </Box>
        </VStack>

        {/* Error Message */}
        {verifyMutation.isError && (
          <Box mt={6} p={4} bg="rgba(239, 68, 68, 0.1)" borderWidth={1} borderColor="#ef4444" borderRadius="xl">
            <Text fontSize="sm" color="#ef4444" textAlign="center">
              Invalid or expired code. Please try again.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
