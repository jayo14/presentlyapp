import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, Plus, Edit2, Trash2, Search, AlertCircle, Loader, ArrowLeft, Building, MapPin, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // These are for standalone mode
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(institution?.id || null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(college?.id || null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    if (!institution && !college) {
      loadInitialData();
    } else {
      loadDepartmentsByContext();
    }
  }, [selectedInstitution, selectedCollege, institution, college]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const institutionsData = await institutionsApi.getAllInstitutions();
      const results = institutionsData.results || institutionsData;
      setInstitutions(Array.isArray(results) ? results : []);
      
      if (selectedInstitution) {
        loadColleges(selectedInstitution);
      }
      
      await loadDepartmentsByContext();
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const loadColleges = async (institutionId: number) => {
    try {
      const data = await institutionsApi.getCollegesByInstitution(institutionId);
      const results = data.results || data;
      setColleges(Array.isArray(results) ? results : []);
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
      
      const results = data.results || data;
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
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setShowModal(true);
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setShowModal(true);
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
      setShowModal(false);
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
      {/* Header */}
      <div className="flex flex-col gap-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Colleges
          </button>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {college ? college.name : (institution ? institution.short_name : 'Department Management')}
              </h2>
              <p className="text-sm text-zinc-400">
                {college ? `Departments in ${college.code}` : 'Manage academic departments across the system'}
              </p>
            </div>
          </div>
          <Button onClick={handleCreateDepartment} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Standalone Filters */}
      {!institution && !college && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedInstitution || ''}
            onChange={(e) => {
              const instId = e.target.value ? Number(e.target.value) : null;
              setSelectedInstitution(instId);
              setSelectedCollege(null);
              if (instId) loadColleges(instId);
            }}
            className="h-11 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="">All Institutions</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.full_name}</option>
            ))}
          </select>

          <select
            value={selectedCollege || ''}
            onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
            className="h-11 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
            disabled={!selectedInstitution}
          >
            <option value="">All Colleges</option>
            {colleges.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Search & Stats */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search by name, code or abbreviation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-zinc-900 border-zinc-800"
          />
        </div>
        <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 whitespace-nowrap">
           <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Results</span>
           <span className="text-lg font-bold text-foreground">{filteredDepartments.length}</span>
        </div>
      </div>

      {/* Tabular Layout */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-zinc-950/50 border-b border-zinc-800">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Department Info</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Academics</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">HOD / Contact</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-zinc-500 text-sm">Fetching departments...</p>
                  </div>
                </td>
              </tr>
            ) : filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <p className="text-zinc-500">No departments found matching your criteria.</p>
                </td>
              </tr>
            ) : (
              filteredDepartments.map(dept => (
                <tr key={dept.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">{dept.name}</span>
                      <span className="text-xs text-zinc-500 font-mono mt-0.5">{dept.code} • {dept.abbreviation}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {dept.accreditation_status && (
                        <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter border ${
                          dept.accreditation_status === 'ACCREDITED' 
                            ? 'bg-primary/10 text-primary border-primary/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {dept.accreditation_status}
                        </span>
                      )}
                      {dept.established_year && (
                        <span className="text-xs text-zinc-500">Est. {dept.established_year}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Building className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{dept.head_of_department_name || 'N/A'}</span>
                      </div>
                      {dept.office_location && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <MapPin className="w-3 h-3" />
                          <span>{dept.office_location}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {dept.is_active ? (
                      <div className="flex items-center gap-1.5 text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Inactive</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditDepartment(dept)}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Department Modal */}
      {showModal && (
        <DepartmentModal
          department={editingDepartment || undefined}
          onSave={handleSaveDepartment}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DepartmentManagement;
