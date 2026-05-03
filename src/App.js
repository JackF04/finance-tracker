import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Headline from './components/Headline';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Projection from './components/Projection';
import AccountManager from './components/AccountManager';
import { balanceAt, totalBalanceAt } from './utils/recurrence';

const STORAGE_KEY = 'finance-tracker:v2';
const LEGACY_KEY = 'finance-tracker:v1';
const THEME_KEY = 'finance-tracker:theme';

const HORIZON_MONTHS = 12;
const THEMES = ['ledger', 'midnight', 'emerald'];

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
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || 'ledger'
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accounts, transactions })
    );
  }, [accounts, transactions]);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const today = useMemo(() => new Date(), []);
  const horizonDate = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + HORIZON_MONTHS + 1, 0);
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
  const totalInHorizon = useMemo(
    () => totalBalanceAt(accounts, transactions, horizonDate),
    [accounts, transactions, horizonDate]
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
    setTransactions((prev) =>
      prev.filter((t) => t.accountId !== id)
    );
  };

  const todayStr = today
    .toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();

  return (
    <div className="root">
      <header className="masthead">
        <div className="left">
          <div>Vol. I · No. {HORIZON_MONTHS + 1}</div>
          <div style={{ marginTop: 4 }}>{todayStr}</div>
        </div>
        <div>
          <h1>The Almanac</h1>
        </div>
        <div className="right">
          <div>Edition · Personal</div>
          <div style={{ marginTop: 4 }}>Forecast · {HORIZON_MONTHS} months</div>
        </div>
      </header>

      <div className="subhead">
        “A forecast of recurring income, outgoings &amp; savings over a year.”
      </div>

      <Headline
        totalNow={totalNow}
        totalInHorizon={totalInHorizon}
        horizonDate={horizonDate}
        accounts={accounts}
        accountBalances={accountBalancesNow}
        transactions={transactions}
      />

      <div className="ornament">— ✦ —</div>

      <div className="grid">
        <div>
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
          <TransactionList
            num="IV"
            title="Recurring"
            subtitle="Monthly · automatic"
            transactions={recurring}
            accountsById={accountsById}
            onDelete={deleteTransaction}
            emptyHint="No recurring entries yet. Add a subscription, salary, or savings transfer."
          />
        </div>

        <div>
          <Projection accounts={accounts} transactions={transactions} />
          <TransactionList
            num="V"
            title="One-off"
            subtitle="Single dated entries"
            transactions={oneOffs}
            accountsById={accountsById}
            onDelete={deleteTransaction}
            emptyHint="No one-off entries yet."
          />
        </div>
      </div>

      <footer className="footer">
        <div>Almanac &amp; Forecaster — Edition MMXXVI</div>
        <div className="theme-picker">
          {THEMES.map((t) => (
            <button
              type="button"
              key={t}
              className={theme === t ? 'active' : ''}
              onClick={() => setTheme(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div>All sums in pounds sterling · projections illustrative</div>
      </footer>
    </div>
  );
};

export default App;
