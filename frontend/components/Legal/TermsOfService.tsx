import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-[#71717a] mb-8">
          <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
          <ChevronRight size={14} />
          <span className="text-white">Terms of Service</span>
        </nav>

        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-bold text-[#FFD700] mb-4">Terms of Service</h1>
            <p className="text-[#71717a]">Last Updated: May 2024</p>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-zinc-300">
                By accessing and using Presently, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-zinc-300">
                Presently is an automated attendance management system designed for educational institutions. It uses GPS geofencing and QR code technology to verify student presence in classes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-zinc-300">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. User Conduct</h2>
              <p className="text-zinc-300">
                Users agree not to attempt to circumvent the attendance verification system through the use of location spoofing, account sharing, or any other fraudulent means. Such actions may result in immediate account termination and academic disciplinary action by your institution.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Privacy</h2>
              <p className="text-zinc-300">
                Your use of Presently is also governed by our Privacy Policy. Please review it to understand our practices regarding your personal information and location data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
