import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  const { id, collegeId } = useParams<{ id: string; collegeId: string }>();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // These are for standalone mode
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(institution?.id || null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(college?.id || null);
  
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
      const results = (institutionsData as any).results || institutionsData;
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
      const results = (data as any).results || data;
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
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDepartment = () => {
    navigate(`/dashboard/institutions/${id}/colleges/${collegeId}/departments/new`);
  };

  const handleEditDepartment = (dept: Department) => {
    navigate(`/dashboard/institutions/${id}/colleges/${collegeId}/departments/${dept.id}/edit`);
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
      {/* ... (render section remains same, but without DepartmentModal usage) */}
    </div>
  );
};

export default DepartmentManagement;
