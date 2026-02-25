import React from 'react';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bg="#09090b" color="white" py={12}>
      <Container maxW="4xl">
        <Breadcrumb spacing="8px" separator={<ChevronRight size={14} />} mb={8} color="zinc.400" fontSize="sm">
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/')}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Terms of Service</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack align="stretch" spacing={8}>
          <Box>
            <Heading as="h1" size="2xl" mb={4} color="#FFD700">Terms of Service</Heading>
            <Text color="zinc.400">Last Updated: May 2024</Text>
          </Box>

          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading as="h2" size="lg" mb={3}>1. Acceptance of Terms</Heading>
              <Text color="zinc.300">
                By accessing and using Presently, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" mb={3}>2. Description of Service</Heading>
              <Text color="zinc.300">
                Presently is an automated attendance management system designed for educational institutions. It uses GPS geofencing and QR code technology to verify student presence in classes.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" mb={3}>3. User Accounts</Heading>
              <Text color="zinc.300">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" mb={3}>4. User Conduct</Heading>
              <Text color="zinc.300">
                Users agree not to attempt to circumvent the attendance verification system through the use of location spoofing, account sharing, or any other fraudulent means. Such actions may result in immediate account termination and academic disciplinary action by your institution.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" mb={3}>5. Privacy</Heading>
              <Text color="zinc.300">
                Your use of Presently is also governed by our Privacy Policy. Please review it to understand our practices regarding your personal information and location data.
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default TermsOfService;
