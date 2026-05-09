export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export interface UserBalance {
  userId: string;
  balance: number; // Positive means they are owed, negative means they owe
}

/**
 * Simplifies debts between group members.
 * Uses a greedy approach to minimize transactions.
 */
export function simplifyDebts(balances: UserBalance[]): Transaction[] {
  const transactions: Transaction[] = [];

  // Filter out users with zero balance
  let debtors = balances
    .filter((b) => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance); // Most negative first
  
  let creditors = balances
    .filter((b) => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance); // Most positive first

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
    
    if (amount > 0.01) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Number(amount.toFixed(2)),
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) dIdx++;
    if (Math.abs(creditor.balance) < 0.01) cIdx++;
  }

  return transactions;
}

/**
 * Calculates net balance for each user based on group expenses.
 */
export function calculateBalances(members: string[], expenses: any[]): UserBalance[] {
  const balanceMap: Record<string, number> = {};
  members.forEach(m => balanceMap[m] = 0);

  expenses.forEach(exp => {
    const { amount, paidBy, splits } = exp;
    
    // The person who paid gets a credit
    balanceMap[paidBy] += amount;

    // Everyone listed in splits owes their share
    Object.entries(splits).forEach(([userId, share]: [string, any]) => {
      // Logic for different split types should be pre-calculated or handled here
      // For simplicity, we assume 'share' is the final amount the user owes
      balanceMap[userId] -= Number(share);
    });
  });

  return Object.entries(balanceMap).map(([userId, balance]) => ({
    userId,
    balance: Number(balance.toFixed(2))
  }));
}
