import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Plus, Edit2, Trash2, Search, ArrowLeft, Mail, Phone, AlertCircle, Loader, Building, MapPin, Users, ChevronRight } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Institution, College } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import CollegeModal from './CollegeModal';
import { DepartmentManagement } from './DepartmentManagement';

interface CollegeWithStats extends College {
  departmentCount?: number;
}

interface CollegeManagementProps {
  institution: Institution;
  onBack: () => void;
}

export const CollegeManagement: React.FC<CollegeManagementProps> = ({
  institution,
  onBack
}) => {
  const { id, collegeId } = useParams<{ id: string; collegeId: string }>();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<CollegeWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  useEffect(() => {
    loadColleges();
  }, [institution.id]);

  useEffect(() => {
    if (collegeId) {
      const fetchSelected = async () => {
        try {
          setLoading(true);
          const college = await institutionsApi.getCollegeById(Number(collegeId));
          setSelectedCollege(college);
        } catch (err) {
          console.error('Failed to fetch selected college:', err);
          navigate(`/dashboard/institutions/${id}`);
        } finally {
          setLoading(false);
        }
      };
      fetchSelected();
    } else {
      setSelectedCollege(null);
    }
  }, [collegeId, id]);

  const loadColleges = async () => {
    try {
      setLoading(true);
      const data = await institutionsApi.getCollegesByInstitution(institution.id);
      const results = (data as any).results || data;
      const collegesArray = Array.isArray(results) ? results : [];

      const collegesWithStats = await Promise.all(
        collegesArray.map(async (college: College) => {
          if (!college || !college.id) return { ...college, departmentCount: 0 };
          try {
            const departments = await institutionsApi.getDepartmentsByCollege(college.id);
            const departmentResults = (departments as any)?.results || departments;
            return {
              ...college,
              departmentCount: Array.isArray(departmentResults) ? departmentResults.length : 0
            };
          } catch (e) {
            return { ...college, departmentCount: 0 };
          }
        })
      );
      
      setColleges(collegesWithStats);
      setError(null);
    } catch (err) {
      setError('Failed to load colleges');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCollege = () => {
    navigate(`/dashboard/institutions/${id}/colleges/new`);
  };

  const handleEditCollege = (college: College) => {
    navigate(`/dashboard/institutions/${id}/colleges/${college.id}/edit`);
  };

  const handleSaveCollege = async (formData: Partial<College>) => {
    try {
      if (editingCollege) {
        await institutionsApi.updateCollege(editingCollege.id, formData);
      } else {
        await institutionsApi.createCollege({
          ...formData,
          institution: institution.id,
        } as Omit<College, 'id'>);
      }
      await loadColleges();
      setShowCollegeModal(false);
    } catch (err) {
      setError('Failed to save college');
      console.error(err);
    }
  };

  const handleDeleteCollege = async (id: number) => {
    if (!confirm('Are you sure you want to delete this college? This will also delete all departments within it.')) {
      return;
    }
    
    try {
      await institutionsApi.deleteCollege(id);
      await loadColleges();
    } catch (err) {
      setError('Failed to delete college');
      console.error(err);
    }
  };

  const handleCollegeClick = (college: College) => {
    navigate(`/dashboard/institutions/${id}/colleges/${college.id}`);
  };

  if (selectedCollege) {
    return (
      <DepartmentManagement 
        institution={institution}
        college={selectedCollege}
        onBack={() => {
          navigate(`/dashboard/institutions/${id}`);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs/Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-textMuted hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Institutions
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold text-text">{institution.full_name}</h2>
              <p className="text-sm text-textMuted">Colleges & Faculties Management</p>
            </div>
          </div>
          <Button onClick={handleCreateCollege} className="gap-2">
            <Plus className="w-4 h-4" />
            Add College
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface/50 border border-outline rounded-xl p-4">
          <p className="text-textMuted text-xs uppercase tracking-wider font-semibold">Total Colleges</p>
          <p className="text-2xl font-bold text-text mt-1">{colleges.length}</p>
        </div>
        <div className="bg-surface/50 border border-outline rounded-xl p-4">
          <p className="text-textMuted text-xs uppercase tracking-wider font-semibold">Total Departments</p>
          <p className="text-2xl font-bold text-cyan-500 mt-1">
            {colleges.reduce((sum, college) => sum + (college.departmentCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
          <Input
            type="text"
            placeholder="Search colleges by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-surface border-outline"
          />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="w-10 h-10 animate-spin text-primary" />
          <p className="text-textMuted animate-pulse">Loading colleges...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <Button variant="secondary" size="sm" onClick={loadColleges} className="ml-auto">Retry</Button>
        </div>
      )}

      {/* Colleges Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map(college => (
            <div
              key={college.id}
              className="group bg-surface border border-outline rounded-2xl overflow-hidden hover:border-outline hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col cursor-pointer"
              onClick={() => handleCollegeClick(college)}
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surfaceHigh flex items-center justify-center text-textMuted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-text group-hover:text-primary transition-colors line-clamp-1">{college.name}</h3>
                      <p className="text-xs font-mono text-textMuted uppercase">{college.code}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditCollege(college); }}
                      className="p-2 hover:bg-surfaceHigh rounded-lg text-textMuted hover:text-text transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCollege(college.id); }}
                      className="p-2 hover:bg-surfaceHigh rounded-lg text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {college.description && (
                  <p className="text-sm text-textMuted line-clamp-2 mb-4 leading-relaxed italic">
                    "{college.description}"
                  </p>
                )}

                <div className="space-y-2.5 pt-4 border-t border-outline/50">
                  {college.dean_name && (
                    <div className="flex items-center gap-2 text-sm text-textMuted">
                      <Users className="w-4 h-4 text-textMuted" />
                      <span className="font-medium text-textMuted">Dean: {college.dean_name}</span>
                    </div>
                  )}
                  {college.office_location && (
                    <div className="flex items-center gap-2 text-sm text-textMuted">
                      <MapPin className="w-4 h-4 text-textMuted" />
                      <span>{college.office_location}</span>
                    </div>
                  )}
                   {college.departmentCount !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-textMuted">
                        <Users className="w-4 h-4 text-textMuted" />
                        <span>{college.departmentCount} Department{college.departmentCount !== 1 ? 's' : ''}</span>
                    </div>
                    )}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-background/50 border-t border-outline/50 flex items-center justify-between group-hover:bg-surfaceHigh/30 transition-colors">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                  college.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-muted-foreground'
                }`}>
                  {college.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  View Departments
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredColleges.length === 0 && (
        <div className="text-center py-20 bg-surface/30 border border-dashed border-outline rounded-3xl">
          <GraduationCap className="w-16 h-16 text-text mx-auto mb-4" />
          <h3 className="font-headline text-lg font-bold text-textMuted">No colleges found</h3>
          <p className="text-textMuted text-sm mt-1 mb-6">Start by adding a new college or faculty to this institution.</p>
          <Button onClick={handleCreateCollege} variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add First College
          </Button>
        </div>
      )}

      {/* College Modal */}
      {showCollegeModal && (
        <CollegeModal institution={institution}
          college={editingCollege || undefined}
          onSave={handleSaveCollege}
          onClose={() => setShowCollegeModal(false)}
        />
      )}
    </div>
  );
};

export default CollegeManagement;
