import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Building2, Plus, Edit2, Trash2, Search, Filter, MapPin, Users, Award, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import InstitutionModal from './InstitutionModal';
import CollegeManagement from './CollegeManagement';

interface InstitutionWithStats extends Institution {
  collegeCount?: number;
}

export const InstitutionManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<InstitutionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionWithStats | null>(null);
  const [showCollegeTab, setShowCollegeTab] = useState(false);

  // Check URL params for deep drill-down
  const institutionId = searchParams.get('institution_id');
  const collegeId = searchParams.get('college_id');
  const departmentId = searchParams.get('department_id');

  // ... (useEffect and loadInstitutions remain same)

  const handleCreateInstitution = () => {
    navigate('/dashboard/institutions/new');
  };

  const handleEditInstitution = (inst: InstitutionWithStats) => {
    navigate(`/dashboard/institutions/${inst.id}/edit`);
  };

  const handleDeleteInstitution = async (id: number) => {
    if (!confirm('Are you sure you want to delete this institution? This will also delete all associated colleges and departments.')) {
      return;
    }
    
    try {
      await institutionsApi.deleteInstitution(id);
      await loadInstitutions();
    } catch (err) {
      setError('Failed to delete institution');
      console.error(err);
    }
  };
  
  const handleInstitutionClick = (inst: InstitutionWithStats) => {
      setSearchParams({ institution_id: inst.id.toString() });
  };

  if (institutionId && !selectedInstitution && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader className="w-10 h-10 animate-spin text-primary" />
        <p className="text-zinc-500 animate-pulse">Loading institution details...</p>
      </div>
    );
  }

  if (showCollegeTab && selectedInstitution) {
    return (
      <CollegeManagement 
        institution={selectedInstitution}
        onBack={() => {
          setSearchParams({});
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Institution Management</h2>
            <p className="text-sm text-zinc-400">Manage educational institutions and their colleges</p>
          </div>
        </div>
        <Button onClick={handleCreateInstitution} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Institution
        </Button>
      </div>
      
      {/* ... rest of the component */}
    </div>
  );
};
