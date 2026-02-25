import React from 'react';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bg="#09090b" color="white" py={12}>
      <Container maxW="4xl">
        <Breadcrumb spacing="8px" separator={<ChevronRight size={14} />} mb={8} color="zinc.400" fontSize="sm">
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/')}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Privacy Policy</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack align="stretch" spacing={8}>
          <Box>
            <Heading as="h1" size="2xl" mb={4} color="#FFD700">Privacy Policy</Heading>
            <Text color="zinc.400">Last Updated: May 2024</Text>
          </Box>

          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading as="h2" size="lg" mb={3}>1. Information We Collect</Heading>
              <Text color="zinc.300">
                We collect information you provide directly to us, such as your name, email address, matriculation number, and institutional affiliation.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" mb={3}>2. Location Data</Heading>
              <Text color="zinc.300">
                To verify attendance, we collect precise GPS location data from your device at the time of check-in. This data is only collected when you explicitly attempt to mark attendance and is compared against the authorized venue coordinates.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" mb={3}>3. How We Use Your Information</Heading>
              <Text color="zinc.300">
                We use the information to manage your attendance records, generate reports for lecturers and administrators, and improve our services. We do not sell your personal information to third parties.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" mb={3}>4. Data Security</Heading>
              <Text color="zinc.300">
                We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers and transmitted using encrypted connections.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" mb={3}>5. Your Rights</Heading>
              <Text color="zinc.300">
                You have the right to access, correct, or delete your personal data. Please contact us or your institutional administrator to exercise these rights.
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
