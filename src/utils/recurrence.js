// Pure helpers for expanding recurring transactions and computing balances
// across multiple accounts, with monthly compounding for savings/investment accounts.

export const FREQUENCIES = ['none', 'weekly', 'biweekly', 'monthly', 'yearly'];

const toDate = (value) => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addDays = (d, n) => {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
};

const advance = (date, frequency) => {
  const d = new Date(date);
  switch (frequency) {
    case 'weekly':       d.setDate(d.getDate() + 7); return d;
    case 'biweekly':     d.setDate(d.getDate() + 14); return d;
    case 'monthly':      d.setMonth(d.getMonth() + 1); return d;
    case 'yearly':       d.setFullYear(d.getFullYear() + 1); return d;
    default:             return null;
  }
};

export const signedAmount = (txn) =>
  txn.type === 'income' ? Math.abs(txn.amount) : -Math.abs(txn.amount);

export const occurrencesInRange = (txn, from, to) => {
  const start = toDate(txn.startDate);
  const end = txn.endDate ? toDate(txn.endDate) : null;
  const rangeFrom = toDate(from);
  const rangeTo = toDate(to);

  if (!txn.recurrence || txn.recurrence === 'none') {
    if (start >= rangeFrom && start <= rangeTo) return [start];
    return [];
  }

  const out = [];
  let cursor = new Date(start);
  for (let i = 0; i < 1200; i += 1) {
    if (cursor > rangeTo) break;
    if (end && cursor > end) break;
    if (cursor >= rangeFrom) out.push(new Date(cursor));
    const next = advance(cursor, txn.recurrence);
    if (!next) break;
    cursor = next;
  }
  return out;
};

const sumInRange = (txn, from, to) =>
  occurrencesInRange(txn, from, to).length * signedAmount(txn);

export const balanceAt = (account, allTransactions, date) => {
  const txns = allTransactions.filter((t) => t.accountId === account.id);
  const target = toDate(date);
  const today = toDate(new Date());
  const apy = Number(account.apy) || 0;
  const monthlyRate = apy / 12;
  const initial = Number(account.initialBalance) || 0;

  if (target < today) {
    const sum = txns.reduce((acc, t) => acc + sumInRange(t, target, today), 0);
    return initial - sum;
  }

  let balance = initial;
  let cursor = today;
  const todayMonthEnd = endOfMonth(today);
  for (let i = 0; i < 600; i += 1) {
    const monthEnd = endOfMonth(cursor);
    const segmentEnd = monthEnd > target ? target : monthEnd;
    for (let j = 0; j < txns.length; j += 1) {
      balance += sumInRange(txns[j], cursor, segmentEnd);
    }
    if (monthEnd > todayMonthEnd && monthEnd <= target && monthlyRate) {
      balance *= 1 + monthlyRate;
    }
    if (monthEnd >= target) break;
    cursor = addDays(monthEnd, 1);
  }
  return balance;
};

export const dailyNet = (transactions, date, accountId) => {
  const target = toDate(date);
  const filtered = accountId
    ? transactions.filter((t) => t.accountId === accountId)
    : transactions;
  return filtered.reduce((acc, txn) => {
    const occ = occurrencesInRange(txn, target, target);
    if (occ.some((o) => sameDay(o, target))) return acc + signedAmount(txn);
    return acc;
  }, 0);
};

export const transactionsOnDay = (transactions, date) => {
  const target = toDate(date);
  return transactions.filter((txn) => {
    const occ = occurrencesInRange(txn, target, target);
    return occ.some((o) => sameDay(o, target));
  });
};

export const monthlyProjection = (accounts, transactions, months = 12) => {
  const today = toDate(new Date());
  const series = accounts.map((acc) => ({ account: acc, points: [] }));
  const total = [];

  for (let i = 0; i < months; i += 1) {
    const monthEnd = endOfMonth(new Date(today.getFullYear(), today.getMonth() + i, 1));
    const label = monthEnd.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    let combined = 0;
    accounts.forEach((acc, idx) => {
      const balance = balanceAt(acc, transactions, monthEnd);
      series[idx].points.push({ label, date: monthEnd, balance });
      combined += balance;
    });
    total.push({ label, date: monthEnd, balance: combined });
  }
  return { series, total };
};

export const totalBalanceAt = (accounts, transactions, date) =>
  accounts.reduce((acc, a) => acc + balanceAt(a, transactions, date), 0);

// Forecast points for the chart: index 0 = today; 1..horizon = subsequent month-ends.
export const buildForecast = (accounts, transactions, horizon = 12) => {
  const today = toDate(new Date());
  const points = [];
  const pushPoint = (date) => {
    const balances = {};
    let total = 0;
    accounts.forEach((a) => {
      const b = balanceAt(a, transactions, date);
      balances[a.id] = b;
      total += b;
    });
    points.push({ date, balances, total });
  };

  pushPoint(today);
  for (let i = 1; i <= horizon; i += 1) {
    const target = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
    pushPoint(target);
  }
  return points;
};

const gbpNumber = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (n) => {
  const v = Number(n) || 0;
  if (v < 0) return `−£${gbpNumber.format(Math.abs(v))}`;
  return `£${gbpNumber.format(v)}`;
};

export const formatSigned = (n) => {
  const v = Number(n) || 0;
  const abs = gbpNumber.format(Math.abs(v));
  if (v > 0) return `+£${abs}`;
  if (v < 0) return `−£${abs}`;
  return `£${abs}`;
};

export const formatShort = (n) => {
  const v = Number(n) || 0;
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : '';
  if (abs >= 1000) return `${sign}£${(abs / 1000).toFixed(1)}k`;
  return `${sign}£${abs.toFixed(0)}`;
};

export const buildTransferPair = ({ amount, description, recurrence, startDate, endDate, fromAccountId, toAccountId }) => {
  const transferId = `tr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const base = {
    description,
    amount: Math.abs(Number(amount)),
    recurrence,
    startDate,
    endDate: recurrence !== 'none' && endDate ? endDate : null,
    transferId,
  };
  return [
    {
      ...base,
      id: `${transferId}-out`,
      type: 'expense',
      accountId: fromAccountId,
    },
    {
      ...base,
      id: `${transferId}-in`,
      type: 'income',
      accountId: toAccountId,
    },
  ];
};
