import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Plus, Edit2, Trash2, Search, AlertCircle, Loader, ArrowLeft, Building, MapPin, CheckCircle2, XCircle, MoreVertical, ChevronDown } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Department, College, Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import DepartmentModal from './DepartmentModal';

interface DepartmentManagementProps {
  institution?: Institution;
  college?: College;
  onBack?: () => void;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  institution,
  college,
  onBack
}) => {
  const { id, collegeId } = useParams<{ id: string; collegeId: string }>();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // These are for standalone mode
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    // This effect runs once on mount or when institution/college props change.
    // It initializes the data or sets up URL param handling.
    if (!institution && !college) {
      // If in standalone mode (no props), try to use URL params for initial selection
      if (id && !selectedInstitution) {
        setSelectedInstitution(Number(id));
      }
      if (collegeId && !selectedCollege) {
        setSelectedCollege(Number(collegeId));
      }
      loadInitialData();
    } else {
      // If props are provided, directly load departments based on props
      loadDepartmentsByContext();
    }
  }, [id, collegeId, institution, college]);

  useEffect(() => {
    // This effect handles loading colleges when a new institution is selected
    if (selectedInstitution) {
      loadColleges(selectedInstitution as number);
    } else {
      setColleges([]);
      setSelectedCollege(null);
    }
  }, [selectedInstitution]); // Depend on selectedInstitution

  useEffect(() => {
    // This effect triggers loading departments whenever filters change
    loadDepartmentsByContext();
  }, [selectedInstitution, selectedCollege, institution, college]); // Depend on all relevant filters

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const institutionsData = await institutionsApi.getAllInstitutions();
      const results = (institutionsData as any).results || institutionsData;
      setInstitutions(Array.isArray(results) ? results : []);

      // If no institution is selected (and not coming from params), select the first one
      if (!selectedInstitution && Array.isArray(results) && results.length > 0 && !id) {
        setSelectedInstitution(results[0].id);
      }
      
      // loadColleges and loadDepartmentsByContext will be triggered by subsequent useEffects
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const loadColleges = async (institutionId: number) => {
    try {
      const data = await institutionsApi.getCollegesByInstitution(institutionId);
      const results = (data as any).results || data;
      setColleges(Array.isArray(results) ? results : []);

      // If no college is selected and there are colleges, select the first one
      if (!selectedCollege && Array.isArray(results) && results.length > 0) {
        setSelectedCollege(results[0].id);
      }
    } catch (err) {
      console.error('Failed to load colleges:', err);
    }
  };

  const loadDepartmentsByContext = async () => {
    try {
      setLoading(true);
      let data;
      
      if (college || selectedCollege) {
        data = await institutionsApi.getDepartmentsByFilter({ college: college?.id || selectedCollege! });
      } else if (institution || selectedInstitution) {
        data = await institutionsApi.getDepartmentsByFilter({ institution: institution?.id || selectedInstitution! });
      } else {
        data = await institutionsApi.getAllDepartments();
      }
      
      const results = (data as any).results || data;
      setDepartments(Array.isArray(results) ? results : []);
      setError(null);
    } catch (err) {
      setError('Failed to load departments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    (dept.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.abbreviation || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setShowDepartmentModal(true);
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setShowDepartmentModal(true);
  };

  const handleSaveDepartment = async (formData: Partial<Department>) => {
    try {
      if (editingDepartment) {
        await institutionsApi.updateDepartment(editingDepartment.id, formData);
      } else {
        await institutionsApi.createDepartment({
          ...formData,
          institution: institution?.id || selectedInstitution,
          college: college?.id || selectedCollege,
        } as Omit<Department, 'id'>);
      }
      await loadDepartmentsByContext();
      setShowDepartmentModal(false);
      setEditingDepartment(null);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to save department');
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      await institutionsApi.deleteDepartment(id);
      await loadDepartmentsByContext();
    } catch (err) {
      setError('Failed to delete department');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {college ? 'College' : 'Institution'}
          </button>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {college ? college.name : institution ? institution.full_name : 'Department Management'}
              </h2>
              <p className="text-sm text-zinc-400">
                {college ? 'Departments in this College' : institution ? 'Departments in this Institution' : 'Manage all departments'}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleCreateDepartment} 
            className="gap-2"
            disabled={
              !(institution || selectedInstitution) || 
              (!(college || selectedCollege) && selectedInstitution !== null) // If institution is selected but no college, allow creating directly under institution
            }
          >
            <Plus className="w-4 h-4" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!institution && (
          <div className="relative flex-1">
            <select
              value={selectedInstitution || ''}
              onChange={(e) => {
                const instId = parseInt(e.target.value);
                setSelectedInstitution(instId);
                setSelectedCollege(null); // Reset college when institution changes
                if (instId) {
                  loadColleges(instId);
                } else {
                  setColleges([]);
                }
              }}
              className="pl-3 pr-10 h-11 bg-zinc-900 border-zinc-800 rounded-lg text-white appearance-none w-full"
            >
              <option value="">Select Institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.full_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
          </div>
        )}
        
        {!college && (
          <div className="relative flex-1">
            <select
              value={selectedCollege || ''}
              onChange={(e) => setSelectedCollege(parseInt(e.target.value))}
              className="pl-3 pr-10 h-11 bg-zinc-900 border-zinc-800 rounded-lg text-white appearance-none w-full"
              disabled={!selectedInstitution || colleges.length === 0}
            >
              <option value="">Select College</option>
              {colleges.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
          </div>
        )}

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-zinc-900 border-zinc-800"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && departments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="w-10 h-10 animate-spin text-primary" />
          <p className="text-zinc-500 animate-pulse">Loading departments...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <Button variant="secondary" size="sm" onClick={loadDepartmentsByContext} className="ml-auto">Retry</Button>
        </div>
      )}

      {/* Departments Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map(dept => (
            <div
              key={dept.id}
              className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{dept.name}</h3>
                      <p className="text-xs font-mono text-zinc-500 uppercase">{dept.code} • {dept.abbreviation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditDepartment(dept)}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {dept.description && (
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {dept.description}
                  </p>
                )}

                <div className="space-y-2.5 pt-4 border-t border-zinc-800/50">
                  {dept.head_of_department_name && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>HOD: {dept.head_of_department_name}</span>
                    </div>
                  )}
                  {dept.office_location && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <MapPin className="w-4 h-4 text-zinc-500" />
                      <span>{dept.office_location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-800/50 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                  dept.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {dept.is_active ? 'Active' : 'Inactive'}
                </span>
                {dept.accreditation_status && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                    dept.accreditation_status === 'ACCREDITED' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {dept.accreditation_status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDepartments.length === 0 && (
        <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
          <GraduationCap className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-400">No departments found</h3>
          <p className="text-zinc-500 text-sm mt-1 mb-6">Start by adding a new department to this {college ? 'college' : 'institution'}.</p>
          <Button onClick={handleCreateDepartment} variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add First Department
          </Button>
        </div>
      )}

      {/* Department Modal */}
      {showDepartmentModal && (
        <DepartmentModal
          department={editingDepartment || undefined}
          onSave={handleSaveDepartment}
          onClose={() => {
            setShowDepartmentModal(false);
            setEditingDepartment(null);
          }}
        />
      )}
    </div>
  );
};

export default DepartmentManagement;
