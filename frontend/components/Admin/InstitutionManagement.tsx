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

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-500 font-semibold">Error</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Total Institutions</p>
          <p className="text-2xl font-bold text-foreground">{institutions.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Active Institutions</p>
          <p className="text-2xl font-bold text-foreground">
            {institutions.filter(i => i.is_active).length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm">Total Colleges</p>
          <p className="text-2xl font-bold text-foreground">
            {institutions.reduce((sum, inst) => sum + (inst.collegeCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search institutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">All Types</option>
          <option value="UNIVERSITY">Universities</option>
          <option value="POLYTECHNIC">Polytechnics</option>
          <option value="COLLEGE">Colleges</option>
          <option value="INSTITUTE">Institutes</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && institutions.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Institutions Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstitutions.map(inst => (
            <div
              key={inst.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedInstitution(inst);
                setShowCollegeTab(true);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{inst.full_name}</h3>
                  <p className="text-xs text-zinc-400">{inst.short_name} • {inst.abbreviation}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditInstitution(inst);
                    }}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Edit institution"
                  >
                    <Edit2 className="w-4 h-4 text-zinc-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteInstitution(inst.id);
                    }}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Delete institution"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {inst.description && (
                <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                  {inst.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin className="w-4 h-4" />
                  <span>{inst.city}, {inst.state_province || inst.country}</span>
                </div>

                {inst.collegeCount !== undefined && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users className="w-4 h-4" />
                    <span>{inst.collegeCount} College{inst.collegeCount !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {inst.institution_type && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-500">
                      {inst.institution_type}
                    </span>
                  </div>
                )}

                {inst.accreditation_status && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-500" />
                    <span className={`px-2 py-1 rounded text-xs ${
                      inst.accreditation_status === 'ACCREDITED'
                        ? 'bg-green-500/10 text-green-500'
                        : inst.accreditation_status === 'PROVISIONAL'
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {inst.accreditation_status}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800">
                  <span className={`px-2 py-1 rounded text-xs ${
                    inst.is_active 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {inst.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredInstitutions.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No institutions found</p>
          <p className="text-zinc-500 text-sm mt-1">Create your first institution to get started</p>
        </div>
      )}

      {/* Institution Modal */}
      {showInstitutionModal && (
        <InstitutionModal
          institution={editingInstitution || undefined}
          onSave={handleSaveInstitution}
          onClose={() => setShowInstitutionModal(false)}
        />
      )}
    </div>
  );
};
