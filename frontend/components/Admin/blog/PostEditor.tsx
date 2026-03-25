import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Eye, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Code, 
  Quote, 
  List, 
  ChevronUp, 
  ChevronDown,
  Calendar,
  Clock,
  User,
  Tag as TagIcon,
  Search,
  CheckCircle2,
  Trash2,
  Plus,
  Send,
  Upload,
  Loader2
} from 'lucide-react';
import { Button } from '../../Button';
import { uploadBlogImage } from '../../../src/lib/blog';
import type { Post, Category, Tag } from '../../../src/types/blog';

interface PostEditorProps {
  post?: Post | null;
  categories: Category[];
  tags: Tag[];
  onSave: (data: Partial<Post>) => void;
  onPublish: (data: Partial<Post>) => void;
  onCancel: () => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  post,
  categories,
  tags: allTags,
  onSave,
  onPublish,
  onCancel
}) => {
  const getInitialFormData = (value?: Post | null): Partial<Post> => ({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    author_name: '',
    author_avatar: '',
    category: null,
    tags: [],
    status: 'draft',
    reading_time: 5,
    seo_title: '',
    seo_description: '',
    ...value
  });

  const [formData, setFormData] = useState<Partial<Post>>(getInitialFormData(post));

  const [isCoverDragActive, setIsCoverDragActive] = useState(false);
  const [isAvatarDragActive, setIsAvatarDragActive] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [seoExpanded, setSeoExpanded] = useState(true);

  useEffect(() => {
    setFormData(getInitialFormData(post));
  }, [post]);

  const validateImage = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Image size must be less than 5MB.';
    }
    return null;
  };

  const uploadImageForField = async (file: File, field: 'cover_image' | 'author_avatar') => {
    const validationError = validateImage(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError('');
    if (field === 'cover_image') {
      setIsCoverUploading(true);
    } else {
      setIsAvatarUploading(true);
    }

    try {
      const imageUrl = await uploadBlogImage(file);
      setFormData(prev => ({ ...prev, [field]: imageUrl }));
    } catch (error: any) {
      setUploadError(error?.message || 'Failed to upload image.');
    } finally {
      if (field === 'cover_image') {
        setIsCoverUploading(false);
      } else {
        setIsAvatarUploading(false);
      }
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'cover_image' | 'author_avatar'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImageForField(file, field);
    e.target.value = '';
  };

  const handleImageDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    field: 'cover_image' | 'author_avatar'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragActive(false);
    setIsAvatarDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadImageForField(file, field);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from title if it's new
      if (name === 'title' && !post) {
        newData.slug = value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
      }
      return newData;
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = parseInt(e.target.value);
    const category = categories.find(c => c.id === categoryId) || null;
    setFormData(prev => ({ ...prev, category }));
  };

  const handleTagToggle = (tag: Tag) => {
    setFormData(prev => {
      const currentTags = prev.tags || [];
      const isSelected = currentTags.some(t => t.id === tag.id);
      if (isSelected) {
        return { ...prev, tags: currentTags.filter(t => t.id !== tag.id) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('post-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newText = beforeText + before + selection + after + afterText;
    setFormData(prev => ({ ...prev, content: newText }));
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Dynamic Navigation/Header for Editor */}
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-16 flex justify-between items-center px-8 bg-surface/80 backdrop-blur-xl border-b border-outline/10 z-50">
        <div className="flex items-center gap-4 text-textMuted font-bold text-[11px] uppercase tracking-widest">
          <button className="hover:text-primary transition-colors">Blog</button>
          <span className="opacity-20">/</span>
          <button className="hover:text-primary transition-colors">Posts</button>
          <span className="opacity-20">/</span>
          <span className="text-text font-black">{post ? 'Edit Post' : 'New Post'}</span>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="px-6 py-2 text-textMuted font-bold hover:bg-surfaceHigh transition-colors rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onSave(formData)}
            className="px-6 py-2 text-primary font-bold border-primary/20 hover:bg-primary/5 transition-colors rounded-xl"
          >
            Save Draft
          </Button>
          <Button 
            onClick={() => onPublish(formData)}
            className="px-8 py-2 bg-gradient-to-r from-primary to-primary/80 text-white font-black rounded-xl shadow-lg shadow-primary/20"
          >
            Publish
          </Button>
        </div>
      </header>

      <main className="pt-16 min-h-screen">
        <div className="max-w-[1400px] mx-auto p-12 flex gap-12">
          {/* Left Column: Editor (70%) */}
          <section className="w-[70%] space-y-8">
            {/* Cover Image Upload Zone */}
            <div
              className={`relative group h-[240px] w-full rounded-[2rem] overflow-hidden border-2 border-dashed transition-all duration-300 ${isCoverDragActive ? 'border-primary/70 bg-primary/5' : 'border-outline/20 hover:border-primary/40'}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsCoverDragActive(true);
              }}
              onDragLeave={() => setIsCoverDragActive(false)}
              onDrop={(e) => {
                void handleImageDrop(e, 'cover_image');
              }}
            >
              {formData.cover_image ? (
                <>
                  <img className="w-full h-full object-cover" src={formData.cover_image} alt="" />
                  <div className="absolute inset-0 bg-text/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl text-sm font-black text-text flex items-center gap-2 shadow-2xl"
                      >
                        {isCoverUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        Replace image
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                        className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl text-sm font-black text-text flex items-center gap-2 shadow-2xl"
                      >
                        <X size={18} />
                        Remove image
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-surfaceHigh/20">
                  <div className="p-4 bg-surfaceHigh rounded-2xl text-textMuted">
                    <ImageIcon size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-text">Select a cover image</p>
                    <p className="text-xs text-textMuted font-medium">Drag and drop, paste URL, or upload image (Max 5MB)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-text text-white text-xs font-black flex items-center gap-2"
                    >
                      {isCoverUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      Upload image
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-textMuted">or</span>
                    <input 
                      type="url" 
                      placeholder="Enter image URL..."
                      name="cover_image"
                      value={formData.cover_image}
                      onChange={handleChange}
                      className="w-64 bg-white border-outline/20 rounded-xl px-4 py-2 text-xs focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleFileChange(e, 'cover_image');
                }}
              />
            </div>

            {/* Title & Excerpt */}
            <div className="space-y-6">
              <input 
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-transparent border-none focus:ring-0 text-5xl font-headline font-black text-text placeholder:text-textMuted/30 p-0" 
                placeholder="Post title..." 
              />
              <div className="relative">
                <textarea 
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none focus:ring-0 text-lg text-textMuted placeholder:text-textMuted/30 p-0 resize-none font-medium leading-relaxed" 
                  placeholder="Short excerpt shown in blog listings..." 
                  rows={2}
                  maxLength={300}
                />
                <div className="absolute bottom-0 right-0 text-[10px] font-black text-textMuted/40 uppercase tracking-widest">
                  {formData.excerpt?.length}/300
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-surface rounded-[2rem] overflow-hidden border border-outline/10 shadow-sm transition-all focus-within:shadow-xl focus-within:shadow-primary/5 focus-within:border-primary/20">
              {/* Toolbar */}
              <div className="flex items-center gap-1 p-3 border-b border-outline/5 bg-surfaceHigh/20">
                <button onClick={() => insertText('**', '**')} className="p-2.5 hover:bg-white rounded-xl text-textMuted hover:text-primary transition-colors"><Bold size={18} /></button>
                <button onClick={() => insertText('*', '*')} className="p-2.5 hover:bg-white rounded-xl text-textMuted hover:text-primary transition-colors"><Italic size={18} /></button>
                <div className="w-px h-6 bg-outline/10 mx-2" />
                <button onClick={() => insertText('# ', '')} className="p-2.5 hover:bg-white rounded-xl text-textMuted hover:text-primary transition-colors"><Heading1 size={18} /></button>
                <button onClick={() => insertText('## ', '')} className="p-2.5 hover:bg-white rounded-xl text-textMuted hover:text-primary transition-colors"><Heading2 size={18} /></button>
                <div className="w-px h-6 bg-outline/10 mx-2" />
                <button onClick={() => insertText('[', '](https://)')} className="p-2.5 hover:bg-white rounded-xl text-textMuted hover:text-primary transition-colors"><LinkIcon size={18} /></button>
                <button onClick={() => insertText('![alt](', ')') } className="p-2.5 hover:bg-white rounded-xl text-textMuted hover:text-primary transition-colors"><ImageIcon size={18} /></button>
                <div className="w-px h-6 bg-outline/10 mx-2" />
                <button onClick={() => insertText('```\n', '\n```')} className="p-2.5 hover:bg-white rounded-xl text-textMuted hover:text-primary transition-colors"><Code size={18} /></button>
                <button onClick={() => insertText('> ', '')} className="p-2.5 hover:bg-white rounded-xl text-textMuted hover:text-primary transition-colors"><Quote size={18} /></button>
                <button onClick={() => insertText('- ', '')} className="p-2.5 hover:bg-white rounded-xl text-textMuted hover:text-primary transition-colors"><List size={18} /></button>
              </div>
              {/* Content Area */}
              <textarea 
                id="post-content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full min-h-[600px] p-8 bg-transparent border-none focus:ring-0 text-text text-lg leading-relaxed font-medium placeholder:text-textMuted/20 resize-none"
                placeholder="Once upon a time..."
              />
            </div>

            <div className="flex items-center gap-6 py-6 text-[10px] font-black text-textMuted uppercase tracking-widest border-t border-outline/5">
              <span className="flex items-center gap-2"><Clock size={14} className="text-primary" /> ~{formData.reading_time || 5} min read</span>
              <span className="w-1.5 h-1.5 bg-outline/10 rounded-full"></span>
              <span className="flex items-center gap-2"><Send size={14} className="text-primary" /> {formData.content?.split(/\s+/).filter(Boolean).length || 0} words</span>
            </div>
          </section>

          {/* Right Column: Sidebar (30%) */}
          <aside className="w-[30%] space-y-6 sticky top-24 h-fit pb-12">
            {/* Status & Visibility */}
            <div className="bg-surface p-8 rounded-[2rem] border border-outline/10 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-textMuted/60 border-b border-outline/5 pb-4">Status & Visibility</h3>
              <div className="space-y-4">
                {(['draft', 'published'] as const).map((status) => (
                  <label key={status} className="flex items-center gap-4 cursor-pointer group p-3 rounded-2xl hover:bg-surfaceHigh/40 transition-all border border-transparent hover:border-outline/5">
                    <div className="relative flex items-center">
                      <input 
                        type="radio" 
                        name="status"
                        checked={formData.status === status}
                        onChange={() => setFormData(prev => ({ ...prev, status }))}
                        className="w-5 h-5 text-primary border-outline/20 focus:ring-primary/20 appearance-none rounded-full checked:bg-primary border-2" 
                      />
                      {formData.status === status && <div className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className={`text-sm font-bold uppercase tracking-tight transition-colors ${formData.status === status ? 'text-text' : 'text-textMuted group-hover:text-text'}`}>
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Author Card */}
            <div className="bg-surface p-8 rounded-[2rem] border border-outline/10 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-textMuted/60 border-b border-outline/5 pb-4">Author Details</h3>
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black text-textMuted/60 mb-2 group-focus-within:text-primary transition-colors transition-colors uppercase tracking-widest">Name</label>
                  <input 
                    type="text" 
                    name="author_name"
                    value={formData.author_name}
                    onChange={handleChange}
                    className="w-full bg-surfaceHigh/20 border-none rounded-xl px-4 py-3 text-sm font-bold text-text focus:ring-4 focus:ring-primary/10 transition-all" 
                    placeholder="Enter author name"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-textMuted/60 mb-2 group-focus-within:text-primary transition-colors transition-colors uppercase tracking-widest">Avatar URL</label>
                  <div
                    className={`rounded-2xl border-2 border-dashed p-4 bg-surfaceHigh/20 transition-colors ${isAvatarDragActive ? 'border-primary/60' : 'border-outline/20'}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsAvatarDragActive(true);
                    }}
                    onDragLeave={() => setIsAvatarDragActive(false)}
                    onDrop={(e) => {
                      void handleImageDrop(e, 'author_avatar');
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {formData.author_avatar ? (
                        <img src={formData.author_avatar} alt="Author avatar" className="w-12 h-12 rounded-full object-cover border border-outline/20" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border border-outline/20 text-textMuted">
                          <User size={18} />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-white text-xs font-black text-text border border-outline/20 flex items-center gap-2"
                      >
                        {isAvatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        Upload avatar
                      </button>
                    </div>
                    <input 
                      type="text" 
                      name="author_avatar"
                      value={formData.author_avatar}
                      onChange={handleChange}
                      className="w-full bg-white border-outline/20 rounded-xl px-4 py-3 text-sm font-bold text-text focus:ring-4 focus:ring-primary/10 transition-all" 
                      placeholder="https://..."
                    />
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void handleFileChange(e, 'author_avatar');
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Category Card */}
            <div className="bg-surface p-8 rounded-[2rem] border border-outline/10 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-outline/5 pb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-textMuted/60">Category</h3>
                <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Create New</button>
              </div>
              <select 
                value={formData.category?.id || ''}
                onChange={handleCategoryChange}
                className="w-full bg-surfaceHigh/20 border-none rounded-xl px-4 py-3 text-sm font-bold text-text focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Tags Card */}
            <div className="bg-surface p-8 rounded-[2rem] border border-outline/10 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-textMuted/60 border-b border-outline/5 pb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag) => (
                  <span key={tag.id} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black shadow-sm rounded-full border border-primary/10">
                    {tag.name}
                    <X size={12} className="cursor-pointer hover:text-error" onClick={() => handleTagToggle(tag)} />
                  </span>
                ))}
              </div>
              
              <div className="pt-4 border-t border-outline/5">
                <p className="text-[9px] font-black text-textMuted opacity-40 uppercase tracking-widest mb-3">Suggested Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.filter(at => !formData.tags?.some(t => t.id === at.id)).slice(0, 8).map(tag => (
                    <button 
                      key={tag.id}
                      onClick={() => handleTagToggle(tag)}
                      className="px-2.5 py-1 text-[9px] font-black text-textMuted bg-surfaceHigh/40 rounded-lg hover:bg-primary/10 hover:text-primary transition-all uppercase tracking-tighter"
                    >
                      + {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SEO Settings Card */}
            <div className={`bg-surface p-8 rounded-[2rem] border border-outline/10 shadow-sm transition-all duration-500 overflow-hidden ${seoExpanded ? 'max-h-[800px]' : 'max-h-24'}`}>
              <div className="flex items-center justify-between cursor-pointer border-b border-outline/5 pb-4 mb-6" onClick={() => setSeoExpanded(!seoExpanded)}>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-textMuted/60">SEO Settings</h3>
                {seoExpanded ? <ChevronUp size={16} className="text-textMuted" /> : <ChevronDown size={16} className="text-textMuted" />}
              </div>
              <div className="space-y-6">
                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-textMuted/60 group-focus-within:text-primary transition-colors uppercase tracking-widest">SEO Title</label>
                    <span className="text-[10px] text-textMuted italic">{formData.seo_title?.length || 0}/60</span>
                  </div>
                  <input 
                    name="seo_title"
                    value={formData.seo_title}
                    onChange={handleChange}
                    className="w-full bg-surfaceHigh/20 border-none rounded-xl px-4 py-3 text-sm font-bold text-text focus:ring-4 focus:ring-primary/10 transition-all font-medium" 
                    placeholder="Search engine title..."
                    maxLength={60}
                  />
                </div>
                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-textMuted/60 group-focus-within:text-primary transition-colors uppercase tracking-widest">Meta Description</label>
                    <span className="text-[10px] text-textMuted italic">{formData.seo_description?.length || 0}/160</span>
                  </div>
                  <textarea 
                    name="seo_description"
                    value={formData.seo_description}
                    onChange={handleChange}
                    className="w-full bg-surfaceHigh/20 border-none rounded-xl px-4 py-3 text-sm font-bold text-text focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none" 
                    rows={4}
                    placeholder="Summarize the post for search engines..."
                    maxLength={160}
                  />
                </div>
                
                {/* Search Preview */}
                <div className="space-y-3 pt-6 border-t border-outline/5">
                  <p className="text-[9px] font-black text-textMuted opacity-40 uppercase tracking-widest">Google Preview</p>
                  <div className="p-6 bg-white rounded-2xl border border-outline/10 shadow-md space-y-1.5 transform hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="text-[#1a0dab] text-lg font-sans truncate font-medium">
                      {formData.seo_title || formData.title || 'Post Title - Presently'}
                    </div>
                    <div className="text-[#006621] text-xs truncate">
                      getpresently.com.ng/blog/{formData.slug || 'tutorial-title'}
                    </div>
                    <div className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                      {formData.seo_description || formData.excerpt || 'Explore how biometric and cloud-based systems are revolutionizing the way Nigerian universities...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
        {uploadError && (
          <div className="max-w-[1400px] mx-auto px-12 pb-6">
            <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-semibold text-error">
              {uploadError}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
