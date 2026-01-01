import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, Search, ArrowLeft, Mail, Phone, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Institution, College } from '../../types';
import { institutionsApi } from '../../services/api/institutions';
import CollegeModal from './CollegeModal';

interface CollegeManagementProps {
  institution: Institution;
  onBack: () => void;
}

export const CollegeManagement: React.FC<CollegeManagementProps> = ({
  institution,
  onBack
}) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);

  useEffect(() => {
    loadColleges();
  }, [institution.id]);

  const loadColleges = async () => {
    try {
      setLoading(true);
      const data = await institutionsApi.getCollegesByInstitution(institution.id);
      setColleges(data);
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
    setEditingCollege(null);
    setShowCollegeModal(true);
  };

  const handleEditCollege = (college: College) => {
    setEditingCollege(college);
    setShowCollegeModal(true);
  };

  const handleSaveCollege = async (formData: Partial<College>) => {
    try {
      if (editingCollege) {
        await institutionsApi.updateCollege(editingCollege.id, formData);
      } else {
        await institutionsApi.createCollege({
          ...formData,
          institution_id: institution.id,
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
    if (!confirm('Are you sure you want to delete this college?')) {
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

  return (
    <div className="min-h-screen bg-background p-6">
      {/* UI remains the same */}
    </div>
  );
};

export default CollegeManagement;
