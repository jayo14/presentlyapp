import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-[#71717a] mb-8">
          <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
          <ChevronRight size={14} />
          <span className="text-white">Privacy Policy</span>
        </nav>

        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-bold text-[#FFD700] mb-4">Privacy Policy</h1>
            <p className="text-[#71717a]">Last Updated: May 2024</p>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-zinc-300">
                We collect information you provide directly to us, such as your name, email address, matriculation number, and institutional affiliation.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Location Data</h2>
              <p className="text-zinc-300">
                To verify attendance, we collect precise GPS location data from your device at the time of check-in. This data is only collected when you explicitly attempt to mark attendance and is compared against the authorized venue coordinates.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-zinc-300">
                We use the information to manage your attendance records, generate reports for lecturers and administrators, and improve our services. We do not sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p className="text-zinc-300">
                We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers and transmitted using encrypted connections.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p className="text-zinc-300">
                You have the right to access, correct, or delete your personal data. Please contact us or your institutional administrator to exercise these rights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

