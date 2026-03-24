import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FolderPlus,
  X,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Layers,
  FileText
} from 'lucide-react';
import { Button } from '../../Button';
import type { Category } from '../../../src/types/blog';

interface CategoryManagerProps {
  categories: Category[];
  onCreate: (data: Partial<Category>) => void;
  onUpdate: (slug: string, data: Partial<Category>) => void;
  onDelete: (slug: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({ name: '', slug: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      onUpdate(editingCategory.slug, formData);
      setEditingCategory(null);
    } else {
      onCreate(formData);
      setIsAdding(false);
    }
    setFormData({ name: '', slug: '', description: '' });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug, description: category.description });
    setIsAdding(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'name' && !editingCategory) {
        newData.slug = value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
      }
      return newData;
    });
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-5xl font-headline font-black text-text tracking-tight">Categories</h2>
          <p className="text-textMuted text-lg mt-2 max-w-xl">Group your content into logical topics to help readers find what they need.</p>
        </div>
        <Button 
          onClick={() => { setIsAdding(true); setEditingCategory(null); setFormData({ name: '', slug: '', description: '' }); }}
          className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
        >
          <FolderPlus size={20} />
          New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Category Cards (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="group bg-surface p-8 rounded-[2rem] border border-outline/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-surfaceHigh/40 rounded-2xl text-primary transform group-hover:scale-110 transition-transform duration-500 shadow-sm border border-outline/5 inline-block">
                    <Layers size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(category)} className="p-2 hover:bg-surfaceHigh rounded-xl text-textMuted hover:text-primary transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(category.slug)} className="p-2 hover:bg-surfaceHigh rounded-xl text-textMuted hover:text-error transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 className="text-2xl font-headline font-black text-text mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                <p className="text-xs text-textMuted font-bold uppercase tracking-widest mb-4 opacity-60">/{category.slug}</p>
                <p className="text-sm text-textMuted/80 line-clamp-2 leading-relaxed mb-6 italic">{category.description || 'No description provided for this category.'}</p>
              </div>
              
              <div className="relative z-10 flex items-center justify-between pt-6 border-t border-outline/5 text-[10px] font-black uppercase tracking-widest text-textMuted pt-4">
                <span className="flex items-center gap-1.5"><FileText size={14} className="text-primary/40" /> 12 Posts</span>
                <span className="cursor-pointer hover:text-primary flex items-center gap-1 hover:translate-x-1 transition-transform">View posts <ChevronRight size={14} /></span>
              </div>
              
              {/* Abstract Background Shape */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-2 py-20 bg-surfaceHigh/10 border-2 border-dashed border-outline/10 rounded-[3rem] text-center">
              <Layers size={48} className="mx-auto text-textMuted/20 mb-4" />
              <p className="text-textMuted italic font-bold">No categories created yet.</p>
            </div>
          )}
        </div>

        {/* Right Column: Add/Edit Form (4 cols) */}
        <div className="lg:col-span-4 sticky top-24">
          {(isAdding || editingCategory) ? (
            <div className="bg-text p-8 rounded-[2rem] text-white shadow-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <h3 className="text-2xl font-headline font-black tracking-tight">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                <button onClick={() => { setIsAdding(false); setEditingCategory(null); }} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Category Name</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/20 text-white placeholder:text-white/20 transition-all font-medium" 
                    placeholder="e.g. Technology" 
                    required
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40">URL Slug</label>
                   <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-bold text-sm">/</span>
                     <input 
                       name="slug"
                       value={formData.slug}
                       onChange={handleChange}
                       className="w-full bg-white/10 border-white/10 rounded-2xl pl-10 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/20 text-white placeholder:text-white/20 transition-all font-medium" 
                       placeholder="technology"
                       required
                     />
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-white/10 border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/20 text-white placeholder:text-white/20 transition-all font-medium resize-none leading-relaxed h-32" 
                    placeholder="What topics will this category cover?" 
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-primary py-5 rounded-2xl text-sm font-black text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 mt-4"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-surface p-8 rounded-[2rem] border border-outline/10 shadow-sm text-center space-y-6 py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Layers size={32} />
              </div>
              <h4 className="text-xl font-headline font-black text-text">Select to edit</h4>
              <p className="text-sm text-textMuted font-medium leading-relaxed italic">Click on a category card to update its details, or use the button above to create a new one.</p>
              <div className="h-px bg-outline/10 w-12 mx-auto"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-textMuted/40">Presently Editorial v1.0</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
