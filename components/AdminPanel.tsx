
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Image as ImageIcon, Edit2, Save, AlertTriangle, Check } from 'lucide-react';
import { MenuItem } from '../types';

interface AdminPanelProps {
  specials: MenuItem[];
  onAdd: (item: Omit<MenuItem, 'id'>) => void;
  onUpdate: (id: string, item: Omit<MenuItem, 'id'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  isNight: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ specials, onAdd, onUpdate, onDelete, onClose, isNight }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(item.price.toString());
    setImage(item.image);
    document.querySelector('.admin-form-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setImage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image) return;

    const itemData = {
      name,
      price: parseInt(price),
      image,
      description: "Today's Chef Special Recommendation",
      isVeg: true,
      isCustom: true,
      isPopular: true
    };

    if (editingId) {
      onUpdate(editingId, itemData);
      setEditingId(null);
    } else {
      onAdd(itemData);
    }

    setName('');
    setPrice('');
    setImage('');
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const panelBg = isNight ? 'bg-[#1a103c] text-white' : 'bg-white text-gray-900';
  const inputBg = isNight ? 'bg-indigo-900/50 border-indigo-700' : 'bg-gray-50 border-gray-200';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${panelBg}`}
      >
        <div className="p-6 border-b border-gray-100/10 flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold">Admin Dashboard</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/20">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
          {/* Form Section */}
          <div className="admin-form-container space-y-4 mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-orange-500">
                {editingId ? 'Edit Special' : 'Add New Special'}
              </h3>
              {editingId && (
                <button onClick={cancelEdit} className="text-xs font-bold text-red-500 underline">Cancel Edit</button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-60">Dish Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none transition-colors focus:border-orange-500 ${inputBg}`}
                  placeholder="e.g. Garlic Cheese Bomb"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-60">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none transition-colors focus:border-orange-500 ${inputBg}`}
                  placeholder="250"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-60">Photo</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative ${inputBg} ${image ? 'border-green-500' : 'border-gray-300'}`}
                >
                  {image ? (
                    <>
                      <img src={image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="bg-white/90 text-black text-[10px] px-2 py-1 rounded font-bold">Change Photo</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={32} className="opacity-40 mb-2" />
                      <span className="text-xs opacity-60">Tap to upload photo</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!name || !price || !image}
                className={`w-full py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${editingId ? 'bg-indigo-600 text-white' : 'bg-orange-600 text-white'}`}
              >
                {editingId ? <Save size={20} /> : <Plus size={20} />}
                {editingId ? 'Update Special' : 'Add to Menu'}
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">Current Specials ({specials.length})</h3>
            {specials.length === 0 ? (
              <p className="text-sm opacity-50 italic">No custom specials added yet.</p>
            ) : (
              <div className="space-y-3">
                {specials.map(item => (
                  <div key={item.id} className="relative">
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${inputBg} ${editingId === item.id ? 'border-orange-500 ring-2 ring-orange-500/20' : ''}`}>
                      <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-xs opacity-60">₹{item.price}</p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => startEdit(item)}
                          className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Deletion Confirmation Inline Overlay */}
                    <AnimatePresence>
                      {deleteConfirmId === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="absolute inset-0 z-10 bg-red-600 rounded-xl flex items-center justify-between px-4 text-white font-bold"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={18} />
                            <span className="text-xs">Confirm Delete?</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-3 py-1 bg-white/20 rounded-lg text-xs hover:bg-white/30"
                            >
                              No
                            </button>
                            <button 
                              onClick={handleConfirmDelete}
                              className="px-3 py-1 bg-white text-red-600 rounded-lg text-xs hover:bg-gray-100"
                            >
                              Yes, Delete
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
