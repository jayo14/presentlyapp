import React, { useState, useEffect } from 'react';
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
  const [institutions, setInstitutions] = useState<InstitutionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionWithStats | null>(null);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [showCollegeTab, setShowCollegeTab] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<InstitutionWithStats | null>(null);

  // Load institutions
  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const data = await institutionsApi.getAllInstitutions();
      
      const institutionsWithStats = await Promise.all(
        data.map(async (inst) => {
          const colleges = await institutionsApi.getCollegesByInstitution(inst.id);
          return {
            ...inst,
            collegeCount: colleges.length
          };
        })
      );
      
      setInstitutions(institutionsWithStats);
      setError(null);
    } catch (err) {
      setError('Failed to load institutions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = 
      inst.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.short_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || inst.institution_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateInstitution = () => {
    setEditingInstitution(null);
    setShowInstitutionModal(true);
  };

  const handleEditInstitution = (inst: InstitutionWithStats) => {
    setEditingInstitution(inst);
    setShowInstitutionModal(true);
  };

  const handleSaveInstitution = async (formData: Partial<Institution>) => {
    try {
      if (editingInstitution) {
        await institutionsApi.updateInstitution(editingInstitution.id, formData);
      } else {
        await institutionsApi.createInstitution(formData as Omit<Institution, 'id'>);
      }
      await loadInstitutions();
      setShowInstitutionModal(false);
    } catch (err) {
      setError('Failed to save institution');
      console.error(err);
    }
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

  if (showCollegeTab && selectedInstitution) {
    return (
      <CollegeManagement 
        institution={selectedInstitution}
        onBack={() => {
          setShowCollegeTab(false);
          setSelectedInstitution(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* ... UI remains the same ... */}
    </div>
  );
};
