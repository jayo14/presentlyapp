import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Plus, Edit2, Trash2, Search, Filter, MapPin, Users, Award, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
const CollegeManagement = React.lazy(() => import('./CollegeManagement'));
import { SEO } from '../SEO';

interface InstitutionWithStats extends Institution {
  collegeCount?: number;
}

export const InstitutionManagement: React.FC = () => {
  const { id, collegeId } = useParams<{ id: string; collegeId: string }>();
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<InstitutionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionWithStats | null>(null);
  const [showCollegeTab, setShowCollegeTab] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchSelected = async () => {
        try {
          setLoading(true);
          const inst = await institutionsApi.getInstitutionById(Number(id));
          setSelectedInstitution(inst as InstitutionWithStats);
          setShowCollegeTab(true);
        } catch (err) {
          console.error('Failed to fetch selected institution:', err);
          navigate('/dashboard/institutions'); // Redirect if not found
        } finally {
          setLoading(false);
        }
      };
      fetchSelected();
    } else {
      setSelectedInstitution(null);
      setShowCollegeTab(false);
    }
  }, [id, navigate]);

  // Load institutions list for the grid
  useEffect(() => {
    if (!id) {
      loadInstitutions();
    }
  }, [id]);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const data = await institutionsApi.getAllInstitutions();
      
      // Ensure data is an array before processing
      const results = (data as any)?.results || data;
      const institutionsArray = Array.isArray(results) ? results : [];
      
      // Removed N+1 queries for collegeCount to prevent loading failures
      setInstitutions(institutionsArray as InstitutionWithStats[]);
      setError(null);
    } catch (err) {
      setError('Failed to load institutions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstitutions = (institutions || []).filter(inst => {
    if (!inst) return false;
    const matchesSearch = 
      (inst.full_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (inst.short_name || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    
    const matchesFilter = filterType === 'all' || inst.institution_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

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
      navigate(`/dashboard/institutions/${inst.id}`);
  };

  if (id && !selectedInstitution && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-textMuted animate-pulse">Loading institution details...</p>
      </div>
    );
  }

  if (showCollegeTab && selectedInstitution) {
    return (
      <React.Suspense fallback={<div className="p-8 text-center text-textMuted">Loading colleges...</div>}>
        <CollegeManagement
          institution={selectedInstitution}
          onBack={() => {
            navigate('/dashboard/institutions');
          }}
        />
      </React.Suspense>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="Institutions | Admin | Presently" description="Manage educational institutions and their colleges and departments." />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-headline text-2xl font-bold text-text">Institutions</h2>
            <p className="text-textMuted text-sm">Manage educational organizations and their hierarchy</p>
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
        <div className="bg-surface border border-outline rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-textMuted text-sm">Total Institutions</p>
          <p className="text-2xl font-bold text-text">{(institutions || []).length}</p>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-textMuted text-sm">Active Institutions</p>
          <p className="text-2xl font-bold text-emerald-500">
            {(institutions || []).filter(i => i?.is_active).length}
          </p>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-textMuted text-sm">Total Colleges</p>
          <p className="text-2xl font-bold text-primary">
            {(institutions || []).reduce((sum, inst) => sum + (inst?.collegeCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textMuted" />
          <Input
            type="text"
            placeholder="Search institutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-surface border-outline"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-surface border border-outline rounded-full text-text focus:outline-none focus:border-primary transition-colors h-11"
        >
          <option value="all">All Types</option>
          <option value="UNIVERSITY">Universities</option>
          <option value="POLYTECHNIC">Polytechnics</option>
          <option value="COLLEGE">Colleges</option>
          <option value="INSTITUTE">Institutes</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (institutions || []).length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-textMuted animate-pulse">Fetching institutions...</p>
        </div>
      )}

      {/* Institutions Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.map(inst => (
            <div
              key={inst.id}
              className="bg-surface border border-outline rounded-xl overflow-hidden hover:border-outline hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full relative"
              onClick={() => handleInstitutionClick(inst)}
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surfaceHigh border border-outline flex items-center justify-center overflow-hidden flex-shrink-0">
                      {inst.logo_url ? (
                        <img 
                          src={inst.logo_url} 
                          alt={`${inst.short_name} Logo`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement?.classList.add('fallback-icon');
                          }}
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-textMuted" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-bold text-text group-hover:text-primary transition-colors line-clamp-1" title={inst.full_name}>
                        {inst.full_name}
                      </h3>
                      <p className="text-xs font-medium text-textMuted">{inst.short_name} • {inst.abbreviation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/80 backdrop-blur-sm p-1 rounded-lg">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditInstitution(inst);
                      }}
                      className="p-1.5 hover:bg-surfaceHigh rounded-md transition-colors text-textMuted hover:text-text"
                      title="Edit institution"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInstitution(inst.id);
                      }}
                      className="p-1.5 hover:bg-surfaceHigh rounded-md transition-colors text-red-400 hover:text-red-300"
                      title="Delete institution"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {inst.description && (
                  <p className="text-sm text-textMuted mb-4 line-clamp-2 leading-relaxed flex-1">
                    {inst.description}
                  </p>
                )}

                <div className="space-y-3 pt-4 mt-auto border-t border-outline/50">
                  <div className="flex items-center justify-between text-sm text-textMuted">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-textMuted" />
                      <span className="truncate max-w-[120px]" title={`${inst.city}, ${inst.state_province || inst.country}`}>
                        {inst.city}, {inst.state_province || inst.country}
                      </span>
                    </div>
                    {inst.collegeCount !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-textMuted" />
                        <span>{inst.collegeCount} College{inst.collegeCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    {inst.institution_type && (
                       <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wide">
                        {inst.institution_type}
                      </span>
                    )}
                    
                    {inst.accreditation_status && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wide ${
                        inst.accreditation_status === 'ACCREDITED'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : inst.accreditation_status === 'PROVISIONAL'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : 'bg-zinc-800 text-muted-foreground border-outline'
                      }`}>
                        {inst.accreditation_status}
                      </span>
                    )}
  
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wide ml-auto ${
                      inst.is_active 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-zinc-800 text-muted-foreground border-outline'
                    }`}>
                      {inst.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              {inst.cover_image_url && (
                <div className="h-24 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10"></div>
                    <img src={inst.cover_image_url} alt="Cover" className="w-full h-full object-cover opacity-50" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredInstitutions.length === 0 && (
        <div className="text-center py-20 bg-surface/30 border border-dashed border-outline rounded-3xl">
          <Building2 className="w-16 h-16 text-text mx-auto mb-4" />
          <h3 className="font-headline text-lg font-bold text-textMuted">No institutions found</h3>
          <p className="text-textMuted text-sm mt-1 mb-6">Start by adding a new educational institution to the system.</p>
          <Button onClick={handleCreateInstitution} variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add First Institution
          </Button>
        </div>
      )}
    </div>
  );
};
