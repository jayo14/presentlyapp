import React from 'react';
import { X } from 'lucide-react';
import { College, Institution } from '../../types';

interface CollegeModalProps {
  college?: College;
  institutions: Institution[];
  onSave: (data: Partial<College>) => Promise<void>;
  onClose: () => void;
}

export const CollegeModal: React.FC<CollegeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-presently-black">Placeholder Modal</h2>
        <p className="text-on-surface-variant mb-6">
          The original CollegeModal.tsx file was missing. This is a temporary placeholder to allow the build to pass.
        </p>
        <button
          onClick={onClose}
          className="w-full h-12 bg-sungold text-presently-black font-bold rounded-2xl"
        >
          Close
        </button>
      </div>
    </div>
  );
};
