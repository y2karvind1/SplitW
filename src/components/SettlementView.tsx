import React from 'react';
import { Transaction } from '../lib/settlement';
import { ArrowRight, CheckCircle2, User } from 'lucide-react';
import { motion } from 'motion/react';

interface SettlementViewProps {
  debts: Transaction[];
}

export const SettlementView: React.FC<SettlementViewProps> = ({ debts }) => {
  if (debts.length === 0) {
    return (
      <div className="glass-card py-12 text-center text-slate-500">
        <CheckCircle2 className="mx-auto mb-4 opacity-20 text-emerald-500" size={48} />
        <p className="text-emerald-400 font-medium">All settled up!</p>
        <p className="text-sm">Everyone in the group is balanced.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <ArrowRight className="text-blue-400" />
        </div>
        <div>
          <h4 className="font-semibold text-blue-400">Optimized Settlements</h4>
          <p className="text-xs text-slate-400 mt-1">
            We've calculated the minimum number of transactions needed to settle all debts in this group.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {debts.map((debt, i) => (
          <div key={i} className="glass-card flex items-center justify-between p-4 bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 glass rounded-full flex items-center justify-center">
                  <User size={14} className="text-slate-400" />
                </div>
                <span className="text-sm font-medium">{debt.from.slice(0, 8)}</span>
              </div>
              
              <ArrowRight className="text-slate-600" size={16} />
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 glass rounded-full flex items-center justify-center">
                  <User size={14} className="text-blue-400" />
                </div>
                <span className="text-sm font-medium">{debt.to.slice(0, 8)}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-slate-100">${debt.amount.toFixed(2)}</p>
              <button className="text-[10px] text-blue-400 hover:underline uppercase tracking-tighter font-bold">
                Confirm Payment
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
