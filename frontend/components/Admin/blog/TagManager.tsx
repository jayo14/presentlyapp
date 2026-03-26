import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Tag as TagIcon,
  X,
  CheckCircle2,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../../Button';
import type { Tag } from '../../../src/types/blog';

interface TagManagerProps {
  tags: Tag[];
  onCreate: (data: Partial<Tag>) => void;
  onUpdate: (slug: string, data: Partial<Tag>) => void;
  onDelete: (slug: string) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<Partial<Tag>>({ name: '', slug: '' });

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
      onUpdate(editingTag.slug, formData);
      setEditingTag(null);
    } else {
      onCreate(formData);
      setIsAdding(false);
    }
    setFormData({ name: '', slug: '' });
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, slug: tag.slug });
    setIsAdding(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'name' && !editingTag) {
        newData.slug = value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
      }
      return newData;
    });
  };

  return (
    <div className="space-y-12 pb-24 h-full flex flex-col">
      {/* Header section with search */}
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-headline font-black text-text tracking-tight">Tags</h2>
          <p className="text-textMuted text-lg mt-2 max-w-xl">Use precise keywords to catalog your editorial content.</p>
        </div>
        <div className="flex-1 max-w-md relative flex items-center mb-1">
          <Search size={20} className="absolute left-6 text-textMuted" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surfaceHigh/40 border-none rounded-full pl-14 pr-8 py-5 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text" 
            placeholder="Search tags..." 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1">
        {/* Left Column: Tag Cloud (8 cols) */}
        <div className="lg:col-span-8 bg-surface p-12 rounded-[3rem] border border-outline/10 shadow-sm relative overflow-hidden h-fit">
          <div className="flex flex-wrap gap-4 relative z-10">
            {filteredTags.map((tag) => (
              <div 
                key={tag.id} 
                className={`group flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  editingTag?.id === tag.id ? 'bg-primary border-primary text-background shadow-xl shadow-primary/20' : 'bg-surfaceHigh/20 border-outline/10 text-text hover:bg-surfaceHigh/50 hover:border-primary/20'
                }`}
                onClick={() => handleEdit(tag)}
              >
                <div className={`p-1.5 rounded-lg ${editingTag?.id === tag.id ? 'bg-white/20' : 'bg-surfaceHigh'}`}>
                  <TagIcon size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tight">{tag.name}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${editingTag?.id === tag.id ? 'text-background/60' : 'text-textMuted/40'}`}>/{tag.slug}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(tag.slug); }}
                  className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 ${editingTag?.id === tag.id ? 'text-background' : 'text-error'}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => { setIsAdding(true); setEditingTag(null); setFormData({ name: '', slug: '' }); }}
              className="flex items-center gap-3 px-8 py-3 rounded-2xl border-2 border-dashed border-outline/20 text-textMuted hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-black group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              Add Tag
            </button>
          </div>
          
          {/* Tag Cloud Decoration */}
          <MoreHorizontal className="absolute -bottom-10 -left-10 text-textMuted/5 w-64 h-64 rotate-45 pointer-events-none" />
          <Settings className="absolute -top-10 -right-10 text-textMuted/5 w-64 h-64 rotate-45 pointer-events-none" />
        </div>

        {/* Right Column: Manage Side (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {(isAdding || editingTag) ? (
            <div className="bg-text p-10 rounded-[3rem] text-background shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
               <div className="relative z-10 space-y-8">
                 <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                   <h3 className="text-2xl font-headline font-black tracking-tight">{editingTag ? 'Modify Tag' : 'New Tag'}</h3>
                   <button onClick={() => { setIsAdding(false); setEditingTag(null); }} className="text-background/40 hover:text-background transition-colors"><X size={24} /></button>
                 </div>
                 <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-background/40 group-focus-within:text-background transition-colors">Tag Name</label>
                      <input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/20 text-background placeholder:text-background/10 transition-all font-medium" 
                        placeholder="e.g. Artificial Intelligence" 
                        required
                      />
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-background/40 group-focus-within:text-background transition-colors">Permanent Link</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-background/20 font-bold text-sm">#</span>
                        <input 
                          name="slug"
                          value={formData.slug}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/20 text-background placeholder:text-background/10 transition-all font-medium" 
                          placeholder="ai-trends" 
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-white py-5 rounded-2xl text-sm font-black text-text hover:bg-white/90 transition-all shadow-xl shadow-white/5 mt-4"
                    >
                      {editingTag ? 'Apply Changes' : 'Confirm Tag'}
                    </Button>
                 </form>
               </div>
               {/* Minimal Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
            </div>
          ) : (
            <div className="h-full bg-surfaceHigh/20 border-2 border-dashed border-outline/10 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-6">
               <div className="p-6 bg-surface rounded-full text-textMuted/40 shadow-sm">
                 <TagIcon size={40} />
               </div>
               <div>
                  <h4 className="text-xl font-headline font-black text-text">Tag Management</h4>
                  <p className="text-sm text-textMuted font-medium leading-relaxed mt-2 opacity-60">Tags are case-sensitive. It is recommended to use lowercase slugs without spaces.</p>
               </div>
               <div className="flex gap-2">
                 <div className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-primary/20 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-primary/10 rounded-full"></div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
