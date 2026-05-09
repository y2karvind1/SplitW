import React, { useState, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Camera, Loader2, Sparkles, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { scanReceipt } from '../lib/gemini';
import { UserBalance } from '../lib/settlement';

interface AddExpenseModalProps {
  groupId: string;
  members: string[];
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ groupId, members, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !auth.currentUser) return;

    setLoading(true);
    try {
      const numAmount = parseFloat(amount);
      const share = numAmount / members.length;
      
      const splits: Record<string, number> = {};
      members.forEach(m => splits[m] = share);

      await addDoc(collection(db, 'groups', groupId, 'expenses'), {
        description,
        amount: numAmount,
        paidBy: auth.currentUser.uid,
        groupId,
        splitType: 'equal',
        splits,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to add expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await scanReceipt(base64, file.type);
        setAmount(data.total.toString());
        setDescription(data.merchant || 'Receipt Scan');
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Scan failed:', err);
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-dark w-full max-w-xl p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-indigo-500/20 flex items-center justify-center rounded-2xl">
            <Plus size={24} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-display">Add Expense</h3>
            <p className="text-sm text-slate-500">Splitting with {members.length} people</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Description</label>
              <input 
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-input" 
                placeholder="Dinner, Movies, Rent..." 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass-input pl-8" 
                  placeholder="0.00" 
                  required
                />
              </div>
            </div>
          </div>

          <div className="p-6 border border-white/5 bg-white/5 rounded-2xl space-y-4">
             <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    Demo Receipt Scan
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">Select an image to see the scanning flow (Simulation Mode).</p>
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="glass-button-secondary flex items-center gap-2 border-indigo-500/30 text-indigo-400"
                >
                  {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                  {isScanning ? 'Scanning...' : 'Scan Receipt'}
                </button>
             </div>
             <input 
               type="file" 
               accept="image/*" 
               ref={fileInputRef} 
               onChange={handleReceiptScan} 
               className="hidden" 
             />
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-300">Default Split</h4>
                <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-800 px-2 py-0.5 rounded">Split Equally</span>
             </div>
             <div className="flex -space-x-1.5">
                {members.slice(0, 8).map(m => (
                  <div key={m} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 text-[8px] flex items-center justify-center">
                    {m.slice(0,2).toUpperCase()}
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-4 pt-4">
             <button type="button" onClick={onClose} className="glass-button-secondary flex-1 py-4">Cancel</button>
             <button 
               type="submit" 
               disabled={loading}
               className="glass-button flex-1 py-4 flex items-center justify-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" size={20} /> : null}
               Save Expense
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
