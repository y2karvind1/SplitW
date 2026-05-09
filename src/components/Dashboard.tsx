import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Users, ArrowUpRight, ArrowDownRight, Search, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts';

const MOCK_CHART_DATA = [
  { name: 'Jan', amount: 400 },
  { name: 'Feb', amount: 300 },
  { name: 'Mar', amount: 600 },
  { name: 'Apr', amount: 800 },
  { name: 'May', amount: 500 },
  { name: 'Jun', amount: 900 },
];

const CATEGORY_DATA = [
  { name: 'Food', value: 400, color: '#6366f1' },
  { name: 'Travel', value: 300, color: '#10b981' },
  { name: 'Rent', value: 600, color: '#f59e0b' },
  { name: 'Other', value: 200, color: '#64748b' },
];

const RECENT_ACTIVITY = [
  { id: 1, user: 'Sarah', action: 'added "Dinner at Luigis"', group: 'Apartment 4B', amount: '$12.50', debt: 'you owe', color: '#fbbf24' },
  { id: 2, user: 'Marcus', action: 'settled with you', type: 'settlement', amount: '$45.00', debt: 'you received', color: '#60a5fa' },
];

interface Group {
  id: string;
  name: string;
  memberIds: string[];
  avatar?: string;
  description?: string;
}

interface DashboardProps {
  onGroupSelect: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const g = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
      setGroups(g);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'groups'), {
        name: newGroupName,
        createdBy: auth.currentUser.uid,
        memberIds: [auth.currentUser.uid],
        createdAt: serverTimestamp(),
      });
      setNewGroupName('');
      setShowAddGroup(false);
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight">Welcome home, {auth.currentUser?.displayName?.split(' ')[0]}</h2>
          <p className="text-slate-400">Manage your shared expenses and groups.</p>
        </div>
        <button 
          onClick={() => setShowAddGroup(true)}
          className="glass-button flex items-center gap-2 self-start"
        >
          <Plus size={20} />
          Create New Group
        </button>
      </div>

      {/* Analytics & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-400" />
                Spending Analysis
              </h3>
              <p className="text-xs text-slate-500">Monthly breakdown across all groups</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none text-slate-400">
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {MOCK_CHART_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === MOCK_CHART_DATA.length - 1 ? '#6366f1' : 'rgba(255,255,255,0.1)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Balance</p>
              <p className="text-2xl font-bold font-display text-emerald-400">+$1,240.00</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpRight className="text-emerald-500" />
            </div>
          </div>
          <div className="glass-card flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">You Owe</p>
              <p className="text-2xl font-bold font-display text-rose-400">$420.00</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
              <ArrowDownRight className="text-rose-400" />
            </div>
          </div>
          <div className="glass-card">
            <h4 className="text-sm font-semibold mb-4 text-slate-400 uppercase tracking-wider">Top Categories</h4>
            <div className="h-[120px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_DATA.map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-[10px] text-slate-400">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold font-display">Recent Activity</h3>
            <button className="text-xs text-indigo-400 font-medium tracking-wide">View All</button>
          </div>
          <div className="space-y-1">
            {RECENT_ACTIVITY.map(act => (
              <div key={act.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner" style={{ backgroundColor: act.color }}>
                  {act.user[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-bold">{act.user}</span> {act.action} {act.group && <>in <span className="font-bold">{act.group}</span></>}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">2 hours ago</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${act.debt.includes('received') ? 'text-emerald-400' : 'text-rose-400'}`}>{act.amount}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{act.debt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display px-2">Your Groups</h3>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                placeholder="Search groups..." 
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none w-48 focus:w-64 transition-all"
              />
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="glass-card border-dashed border-2 py-12 text-center text-slate-500">
              <Users className="mx-auto mb-4 opacity-20" size={48} />
              <p>No groups found. Create one to start sharing expenses!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {groups.map((group) => (
                <motion.button
                  key={group.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onGroupSelect(group.id)}
                  className="glass-card text-left hover:border-white/30 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 -mr-8 -mt-8 blur-2xl rounded-full" />
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                      <Users size={24} className="text-indigo-400" />
                    </div>
                    <div className="flex -space-x-2">
                      {group.memberIds.slice(0, 3).map((mid) => (
                        <div key={mid} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800" />
                      ))}
                      {group.memberIds.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px]">
                          +{group.memberIds.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold group-hover:text-indigo-400 transition-colors relative z-10">{group.name}</h4>
                  <p className="text-sm text-slate-500 mt-1 relative z-10">{group.description || 'Shared expenses and settlements.'}</p>
                  <div className="mt-6 flex items-center gap-2 relative z-10">
                    <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg font-medium">Synced with Pro Settlement Engine</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-dark w-full max-w-md p-8 rounded-3xl"
          >
            <h3 className="text-2xl font-bold font-display mb-6">Create New Group</h3>
            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 ml-1 mb-2 block">Group Name</label>
                <input 
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="glass-input" 
                  placeholder="e.g. Europe Trip 2024" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddGroup(false)}
                  className="glass-button flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="glass-button flex-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
