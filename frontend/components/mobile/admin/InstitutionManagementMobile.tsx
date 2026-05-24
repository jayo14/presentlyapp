import React, { useState, useEffect } from 'react';
import {
  Plus,
  MagnifyingGlass,
  Buildings,
  MapPin,
  Globe,
  Trash,
  Pencil,
  CaretLeft,
  GraduationCap,
  FadersHorizontal,
  BuildingOffice,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { institutionApi, collegeApi, departmentApi } from '../../../services/api/admin';
import { Institution, College, Department } from '../../../types';
import { toast } from 'sonner';
import { SEO } from '../../SEO';
import { InstitutionModal } from '../../Admin/InstitutionModal';

type ViewMode = 'institutions' | 'colleges' | 'departments';
type StatusFilter = 'all' | 'active' | 'inactive';

const getInstitutionName = (inst: Institution) =>
  (inst as any).name || inst.full_name || 'Institution';

const getInstitutionWebsite = (inst: Institution) =>
  (inst as any).website || inst.website_url;

const getInstitutionLocation = (inst: Institution) =>
  (inst as any).location || [inst.city, inst.state_province, inst.country].filter(Boolean).join(', ') || 'N/A';

export const InstitutionManagementMobile: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('institutions');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const data = await institutionApi.getAll();
      setInstitutions(data);
    } catch {
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const loadColleges = async (institution: Institution) => {
    try {
      setLoadingChildren(true);
      const data = await collegeApi.getByInstitution(institution.id);
      setSelectedInstitution(institution);
      setSelectedCollege(null);
      setDepartments([]);
      setColleges(data);
      setSearchTerm('');
      setStatusFilter('all');
      setViewMode('colleges');
    } catch {
      toast.error('Failed to load colleges');
    } finally {
      setLoadingChildren(false);
    }
  };

  const loadDepartments = async (college: College) => {
    try {
      setLoadingChildren(true);
      const data = await departmentApi.getByCollege(college.id);
      setSelectedCollege(college);
      setDepartments(data);
      setSearchTerm('');
      setStatusFilter('all');
      setViewMode('departments');
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoadingChildren(false);
    }
  };

  const handleSaveInstitution = async (formData: Partial<Institution>) => {
    try {
      if (editingInstitution) {
        await institutionApi.updateInstitution(editingInstitution.id, formData);
        toast.success('Institution updated');
      } else {
        await institutionApi.createInstitution(formData as any);
        toast.success('Institution created');
      }
      await loadInstitutions();
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this institution?')) return;
    try {
      await institutionApi.deleteInstitution(id);
      toast.success('Deleted');
      await loadInstitutions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const backToInstitutions = () => {
    setViewMode('institutions');
    setSelectedInstitution(null);
    setSelectedCollege(null);
    setColleges([]);
    setDepartments([]);
    setSearchTerm('');
    setStatusFilter('all');
  };

  const backToColleges = () => {
    setViewMode('colleges');
    setSelectedCollege(null);
    setDepartments([]);
    setSearchTerm('');
    setStatusFilter('all');
  };

  const filteredInstitutions = institutions.filter((inst) => {
    const name = getInstitutionName(inst).toLowerCase();
    const shortName = ((inst as any).short_name || inst.abbreviation || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || shortName.includes(searchTerm.toLowerCase());
  });

  const filteredColleges = colleges.filter((college) => {
    const matchesSearch =
      (college.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((college as any).code || college.abbreviation || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'active') return matchesSearch && college.is_active !== false;
    if (statusFilter === 'inactive') return matchesSearch && college.is_active === false;
    return matchesSearch;
  });

  const filteredDepartments = departments.filter((department) => {
    const matchesSearch =
      (department.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((department as any).code || department.abbreviation || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'active') return matchesSearch && department.is_active !== false;
    if (statusFilter === 'inactive') return matchesSearch && department.is_active === false;
    return matchesSearch;
  });

  const renderFilterChips = () => (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {([
        { label: 'All', value: 'all' as const },
        { label: 'Active', value: 'active' as const },
        { label: 'Inactive', value: 'inactive' as const },
      ]).map((chip) => (
        <button
          key={chip.value}
          onClick={() => setStatusFilter(chip.value)}
          className={`h-11 px-4 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
            statusFilter === chip.value
              ? 'bg-presently-black text-white'
              : 'bg-surface-container text-on-surface-variant border border-outline'
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <SEO title="Institutions | Presently Admin" />

      {viewMode === 'institutions' && (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Institutions</h1>
              <p className="text-on-surface-variant font-medium">Tap a card to browse colleges.</p>
            </div>
            <button
              onClick={() => { setEditingInstitution(null); setShowModal(true); }}
              className="w-12 h-12 rounded-2xl bg-sungold text-black flex items-center justify-center shadow-gold active:scale-90 transition-transform"
            >
              <Plus size={24} weight="bold" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <MagnifyingGlass size={20} weight="bold" />
            </div>
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold transition-all"
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => <div key={i} className="h-32 bg-surface-container animate-pulse rounded-3xl" />)
            ) : filteredInstitutions.length > 0 ? (
              filteredInstitutions.map((inst) => {
                const name = getInstitutionName(inst);
                const shortName = (inst as any).short_name || inst.abbreviation || 'INST';
                const website = getInstitutionWebsite(inst);

                return (
                  <motion.button
                    key={inst.id}
                    layout
                    type="button"
                    onClick={() => loadColleges(inst)}
                    className="w-full p-5 rounded-[32px] bg-surface border border-outline shadow-sm space-y-4 text-left active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/50 flex items-center justify-center text-sungold font-bold">
                        {shortName}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg leading-tight truncate">{name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          <MapPin size={12} weight="fill" className="text-sungold" />
                          <span className="truncate">{getInstitutionLocation(inst)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingInstitution(inst);
                          setShowModal(true);
                        }}
                        className="flex-1 h-11 bg-surface-container rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
                      >
                        <Pencil size={18} weight="duotone" />
                        Edit
                      </button>
                      {website && (
                        <a
                          href={website}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-11 h-11 flex items-center justify-center rounded-xl text-primary bg-primary/5 border border-primary/15"
                        >
                          <Globe size={18} weight="duotone" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(inst.id);
                        }}
                        className="w-11 h-11 flex items-center justify-center rounded-xl text-error bg-error/5 border border-error/10 active:scale-90 transition-all"
                      >
                        <Trash size={18} weight="duotone" />
                      </button>
                    </div>
                  </motion.button>
                );
              })
            ) : (
              <div className="text-center py-20 bg-surface-container rounded-[40px] border border-dashed border-outline">
                <Buildings size={64} weight="duotone" className="mx-auto text-on-surface-variant opacity-20 mb-4" />
                <p className="text-sm text-on-surface-variant font-medium">No institutions found.</p>
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'colleges' && (
        <>
          <div className="space-y-4">
            <button
              onClick={backToInstitutions}
              className="h-11 px-4 rounded-xl bg-surface-container border border-outline inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            >
              <CaretLeft size={16} weight="bold" />
              Institutions
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{selectedInstitution ? getInstitutionName(selectedInstitution) : 'Colleges'}</h1>
              <p className="text-on-surface-variant font-medium">Select a college to view departments.</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <MagnifyingGlass size={20} weight="bold" />
            </div>
            <input
              type="text"
              placeholder="Search colleges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold transition-all"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <FadersHorizontal size={12} />
              Filter
            </div>
            {renderFilterChips()}
          </div>

          <div className="space-y-4">
            {loadingChildren ? (
              [1, 2, 3].map((i) => <div key={i} className="h-28 bg-surface-container animate-pulse rounded-3xl" />)
            ) : filteredColleges.length > 0 ? (
              filteredColleges.map((college) => (
                <button
                  key={college.id}
                  type="button"
                  onClick={() => loadDepartments(college)}
                  className="w-full p-5 rounded-[32px] bg-surface border border-outline shadow-sm space-y-4 text-left active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/50 flex items-center justify-center text-primary">
                      <BuildingOffice size={24} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight truncate">{college.name}</h3>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate">
                        {(college as any).code || college.abbreviation || 'College'}
                      </p>
                    </div>
                  </div>
                  <div className="h-11 px-4 rounded-xl bg-surface-container border border-outline/60 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    <span>{(college as any).departments_count || college.departmentCount || 0} Departments</span>
                    <span className="text-primary">Open</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-20 bg-surface-container rounded-[40px] border border-dashed border-outline">
                <BuildingOffice size={64} weight="duotone" className="mx-auto text-on-surface-variant opacity-20 mb-4" />
                <p className="text-sm text-on-surface-variant font-medium">No colleges found.</p>
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'departments' && (
        <>
          <div className="space-y-4">
            <button
              onClick={backToColleges}
              className="h-11 px-4 rounded-xl bg-surface-container border border-outline inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            >
              <CaretLeft size={16} weight="bold" />
              Colleges
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{selectedCollege?.name || 'Departments'}</h1>
              <p className="text-on-surface-variant font-medium">All departments in this college.</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <MagnifyingGlass size={20} weight="bold" />
            </div>
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-surface-container border border-outline rounded-2xl outline-none focus:border-sungold transition-all"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <FadersHorizontal size={12} />
              Filter
            </div>
            {renderFilterChips()}
          </div>

          <div className="space-y-4">
            {loadingChildren ? (
              [1, 2, 3].map((i) => <div key={i} className="h-28 bg-surface-container animate-pulse rounded-3xl" />)
            ) : filteredDepartments.length > 0 ? (
              filteredDepartments.map((department) => (
                <div key={department.id} className="p-5 rounded-[32px] bg-surface border border-outline shadow-sm space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline/50 flex items-center justify-center text-sungold">
                      <GraduationCap size={24} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight truncate">{department.name}</h3>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate">
                        {(department as any).code || department.abbreviation || 'Department'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-surface-container rounded-[40px] border border-dashed border-outline">
                <GraduationCap size={64} weight="duotone" className="mx-auto text-on-surface-variant opacity-20 mb-4" />
                <p className="text-sm text-on-surface-variant font-medium">No departments found.</p>
              </div>
            )}
          </div>
        </>
      )}

      {showModal && (
        <InstitutionModal
          institution={editingInstitution || undefined}
          onSave={handleSaveInstitution}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
