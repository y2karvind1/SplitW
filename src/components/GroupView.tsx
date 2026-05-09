import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Plus, Receipt, PieChart, CreditCard, Download, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AddExpenseModal } from './AddExpenseModal';
import { SettlementView } from './SettlementView';
import { calculateBalances, simplifyDebts } from '../lib/settlement';

interface GroupViewProps {
  groupId: string;
  onBack: () => void;
}

export const GroupView: React.FC<GroupViewProps> = ({ groupId, onBack }) => {
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'settle'>('expenses');

  const exportToCSV = () => {
    if (!expenses.length) return;
    const headers = ['Date', 'Description', 'Amount', 'Paid By', 'Category'];
    const rows = expenses.map(e => [
      new Date(e.createdAt?.seconds * 1000).toLocaleDateString(),
      e.description,
      e.amount,
      e.paidBy,
      e.category || 'N/A'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${group.name}_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchGroup = async () => {
      const gDoc = await getDoc(doc(db, 'groups', groupId));
      if (gDoc.exists()) setGroup({ id: gDoc.id, ...gDoc.data() });
    };

    const expQuery = query(
      collection(db, 'groups', groupId, 'expenses'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(expQuery, (snapshot) => {
      setExpenses(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    fetchGroup();
    return unsubscribe;
  }, [groupId]);

  const balances = group ? calculateBalances(group.memberIds, expenses) : [];
  const simplifiedDebts = simplifyDebts(balances);

  if (!group || loading) return <div className="p-8 glass-card animate-pulse">Loading group...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-all">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold font-display">{group.name}</h2>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            {group.memberIds.length} members 
            <button className="text-indigo-400 hover:scale-110 active:scale-95 transition-all"><UserPlus size={14} /></button>
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Export CSV"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-2xl w-fit">
        {[
          { id: 'expenses', icon: Receipt, label: 'Expenses' },
          { id: 'balances', icon: PieChart, label: 'Balances' },
          { id: 'settle', icon: CreditCard, label: 'Settlements' }
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'expenses' && (
          <motion.div 
            key="expenses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-display font-semibold">Timeline</h3>
              <button 
                onClick={() => setShowAddExpense(true)}
                className="glass-button flex items-center gap-2"
              >
                <Plus size={18} />
                Add Expense
              </button>
            </div>

            {expenses.length === 0 ? (
              <div className="glass-card py-12 text-center text-slate-500">
                <Receipt className="mx-auto mb-4 opacity-20" size={48} />
                <p>No expenses yet. Tap "Add Expense" to begin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((exp) => (
                  <div key={exp.id} className="glass-card flex items-center justify-between hover:bg-white/5 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                        <Receipt size={20} className="text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{exp.description}</h4>
                        <p className="text-xs text-slate-500">Paid by {exp.paidBy === auth.currentUser?.uid ? 'You' : 'Others'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${exp.amount.toFixed(2)}</p>
                      <p className={`text-xs ${exp.paidBy === auth.currentUser?.uid ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {exp.paidBy === auth.currentUser?.uid ? 'You are owed' : 'You owe'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'balances' && (
          <motion.div key="balances" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {balances.map((b) => (
                <div key={b.userId} className="glass-card flex items-center justify-between">
                   <div className="flex items-center gap-3">
                    <div className="w-10 h-10 glass rounded-full flex items-center justify-center font-bold text-xs">
                      {b.userId.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{b.userId === auth.currentUser?.uid ? 'You' : b.userId}</span>
                   </div>
                   <div className={`text-right ${b.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <p className="font-bold">{b.balance >= 0 ? '+' : ''}${Math.abs(b.balance).toFixed(2)}</p>
                    <p className="text-[10px] uppercase tracking-wider">{b.balance >= 0 ? 'Owed' : 'Owes'}</p>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'settle' && (
           <SettlementView debts={simplifiedDebts} />
        )}
      </AnimatePresence>

      {showAddExpense && (
        <AddExpenseModal 
          groupId={groupId} 
          members={group.memberIds}
          onClose={() => setShowAddExpense(false)} 
        />
      )}
    </motion.div>
  );
};
