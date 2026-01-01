import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, Search, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Department, College, Institution } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import DepartmentModal from './DepartmentModal';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedInstitution) {
      loadColleges(selectedInstitution);
      loadDepartments({ institution: selectedInstitution });
    } else {
      loadDepartments();
    }
  }, [selectedInstitution]);

  useEffect(() => {
    if (selectedCollege) {
      loadDepartments({ college: selectedCollege });
    } else if (selectedInstitution) {
      loadDepartments({ institution: selectedInstitution });
    } else {
      loadDepartments();
    }
  }, [selectedCollege]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [institutionsData, departmentsData] = await Promise.all([
        institutionsApi.getAllInstitutions(),
        institutionsApi.getAllDepartments()
      ]);
      setInstitutions(institutionsData);
      setDepartments(departmentsData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadColleges = async (institutionId: number) => {
    try {
      const data = await institutionsApi.getCollegesByInstitution(institutionId);
      setColleges(data);
    } catch (err) {
      console.error('Failed to load colleges:', err);
    }
  };

  const loadDepartments = async (filters?: { institution?: number; college?: number }) => {
    try {
      setLoading(true);
      const data = await institutionsApi.getDepartmentsByFilter(filters);
      setDepartments(data);
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
        await institutionsApi.createDepartment(formData as Omit<Department, 'id'>);
      }
      await loadDepartments(
        selectedCollege ? { college: selectedCollege } :
        selectedInstitution ? { institution: selectedInstitution } : undefined
      );
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
      await loadDepartments(
        selectedCollege ? { college: selectedCollege } :
        selectedInstitution ? { institution: selectedInstitution } : undefined
      );
    } catch (err) {
      setError('Failed to delete department');
      console.error(err);
    }
  };

  if (loading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Department Management</h2>
            <p className="text-sm text-zinc-400">Manage academic departments</p>
          </div>
        </div>
        <Button onClick={handleCreateDepartment} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Department
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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedInstitution || ''}
          onChange={(e) => {
            const instId = e.target.value ? Number(e.target.value) : null;
            setSelectedInstitution(instId);
            setSelectedCollege(null);
          }}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
        >
          <option value="">All Institutions</option>
          {institutions.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.short_name}</option>
          ))}
        </select>

        <select
          value={selectedCollege || ''}
          onChange={(e) => setSelectedCollege(e.target.value ? Number(e.target.value) : null)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground focus:outline-none focus:border-primary"
          disabled={!selectedInstitution}
        >
          <option value="">All Colleges</option>
          {colleges.map(college => (
            <option key={college.id} value={college.id}>{college.name}</option>
          ))}
        </select>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map(dept => (
          <div
            key={dept.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{dept.name}</h3>
                <p className="text-xs text-zinc-400">{dept.code} • {dept.abbreviation}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditDepartment(dept)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Edit department"
                >
                  <Edit2 className="w-4 h-4 text-zinc-400" />
                </button>
                <button
                  onClick={() => handleDeleteDepartment(dept.id)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Delete department"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            {dept.description && (
              <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                {dept.description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              {dept.head_of_department_name && (
                <div className="text-zinc-400">
                  <span className="font-medium">HOD:</span> {dept.head_of_department_name}
                </div>
              )}

              {dept.office_location && (
                <div className="text-zinc-400">
                  <span className="font-medium">Office:</span> {dept.office_location}
                </div>
              )}

              {dept.accreditation_status && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    dept.accreditation_status === 'ACCREDITED'
                      ? 'bg-green-500/10 text-green-500'
                      : dept.accreditation_status === 'PROVISIONAL'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {dept.accreditation_status}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800">
                <span className={`px-2 py-1 rounded text-xs ${
                  dept.is_active 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {dept.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && !loading && (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No departments found</p>
          <p className="text-zinc-500 text-sm mt-1">Create your first department to get started</p>
        </div>
      )}

      {/* Department Modal */}
      {showModal && (
        <DepartmentModal
          department={editingDepartment || undefined}
          institutions={institutions}
          colleges={colleges}
          onSave={handleSaveDepartment}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DepartmentManagement;
