import React, { useState, useEffect } from 'react';
import { Box, Text, HStack } from '@chakra-ui/react';
import { WifiOff, Wifi } from 'lucide-react';
import { useColorModeValue } from '@/components/ui/color-mode';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  const bgColor = useColorModeValue('#fee2e2', '#7f1d1d');
  const textColor = useColorModeValue('#991b1b', '#fca5a5');
  const onlineBg = useColorModeValue('#d1fae5', '#064e3b');
  const onlineText = useColorModeValue('#065f46', '#6ee7b7');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide the "back online" indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <Box
      position="fixed"
      top={4}
      left="50%"
      transform="translateX(-50%)"
      zIndex={9999}
      bg={isOnline ? onlineBg : bgColor}
      color={isOnline ? onlineText : textColor}
      px={4}
      py={2}
      borderRadius="full"
      boxShadow="lg"
      transition="all 0.3s"
      animation={isOnline ? '' : 'pulse 2s infinite'}
    >
      <HStack gap={2}>
        {isOnline ? (
          <Wifi size={16} />
        ) : (
          <WifiOff size={16} />
        )}
        <Text fontSize="sm" fontWeight="medium">
          {isOnline ? 'Back online' : 'You are offline'}
        </Text>
      </HStack>
    </Box>
  );
};
