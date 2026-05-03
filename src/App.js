import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Balance from './components/Balance';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Projection from './components/Projection';
import AccountManager from './components/AccountManager';
import { balanceAt, totalBalanceAt } from './utils/recurrence';

const STORAGE_KEY = 'finance-tracker:v2';
const LEGACY_KEY = 'finance-tracker:v1';

const defaultAccount = () => ({
  id: 'acc-spending',
  name: 'Spending',
  type: 'spending',
  apy: 0,
  initialBalance: 0,
});

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const { transactions = [], initialBalance = 0 } = JSON.parse(legacy);
      const acc = { ...defaultAccount(), initialBalance };
      const migrated = transactions.map((t) => ({ ...t, accountId: acc.id }));
      return { accounts: [acc], transactions: migrated };
    }
  } catch {
    /* ignore */
  }
  return null;
};

const App = () => {
  const initial = loadState();
  const [accounts, setAccounts] = useState(
    initial?.accounts ?? [defaultAccount()]
  );
  const [transactions, setTransactions] = useState(initial?.transactions ?? []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accounts, transactions })
    );
  }, [accounts, transactions]);

  const today = useMemo(() => new Date(), []);
  const oneYearOut = useMemo(() => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }, [today]);

  const accountsById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a])),
    [accounts]
  );

  const accountBalancesNow = useMemo(
    () =>
      Object.fromEntries(
        accounts.map((a) => [a.id, balanceAt(a, transactions, today)])
      ),
    [accounts, transactions, today]
  );
  const totalNow = useMemo(
    () => totalBalanceAt(accounts, transactions, today),
    [accounts, transactions, today]
  );
  const totalInYear = useMemo(
    () => totalBalanceAt(accounts, transactions, oneYearOut),
    [accounts, transactions, oneYearOut]
  );

  const recurring = transactions.filter(
    (t) => t.recurrence && t.recurrence !== 'none'
  );
  const oneOffs = transactions.filter(
    (t) => !t.recurrence || t.recurrence === 'none'
  );

  const addTransaction = (txn) =>
    setTransactions((prev) => [...prev, txn]);
  const addManyTransactions = (list) =>
    setTransactions((prev) => [...prev, ...list]);
  const deleteTransaction = (idOrTransferId, isTransfer) =>
    setTransactions((prev) =>
      prev.filter((t) =>
        isTransfer ? t.transferId !== idOrTransferId : t.id !== idOrTransferId
      )
    );

  const addAccount = (acc) => setAccounts((prev) => [...prev, acc]);
  const updateAccount = (id, patch) =>
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  const deleteAccount = (id) => {
    if (accounts.length <= 1) return;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) => prev.filter((t) => t.accountId !== id));
  };

  return (
    <div className="App">
      <header>
        <h1>Finance Tracker</h1>
        <p className="muted">
          Track recurring income, expenses, and savings — including compound
          interest — to forecast your net worth through the year.
        </p>
      </header>

      <Balance
        totalNow={totalNow}
        totalInYear={totalInYear}
        oneYearOut={oneYearOut}
        accounts={accounts}
        accountBalances={accountBalancesNow}
      />

      <section className="grid">
        <div className="col">
          <h2>Add transaction</h2>
          <TransactionForm
            accounts={accounts}
            onAdd={addTransaction}
            onAddMany={addManyTransactions}
          />
          <AccountManager
            accounts={accounts}
            balances={accountBalancesNow}
            onAdd={addAccount}
            onUpdate={updateAccount}
            onDelete={deleteAccount}
          />
        </div>
        <div className="col">
          <h2>Forecast</h2>
          <Projection accounts={accounts} transactions={transactions} />
        </div>
      </section>

      <section className="grid">
        <TransactionList
          title="Recurring"
          transactions={recurring}
          accountsById={accountsById}
          onDelete={deleteTransaction}
          emptyHint="Add a subscription, salary, or recurring savings transfer to see forecasts."
        />
        <TransactionList
          title="One-off"
          transactions={oneOffs}
          accountsById={accountsById}
          onDelete={deleteTransaction}
          emptyHint="One-time entries appear here."
        />
      </section>
    </div>
  );
};

export default App;
