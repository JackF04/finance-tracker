import React, { useState } from 'react';
import { formatCurrency } from '../utils/recurrence';

const blank = { name: '', type: 'savings', apy: '', initialBalance: '' };

const AccountManager = ({ accounts, onAdd, onUpdate, onDelete, balances }) => {
  const [draft, setDraft] = useState(blank);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    onAdd({
      id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: draft.name.trim(),
      type: draft.type,
      apy: draft.type === 'savings' ? (parseFloat(draft.apy) || 0) / 100 : 0,
      initialBalance: parseFloat(draft.initialBalance) || 0,
    });
    setDraft(blank);
  };

  return (
    <div className="account-manager">
      <h3>Accounts</h3>
      <ul className="account-list">
        {accounts.map((acc) => (
          <li key={acc.id} className={`account ${acc.type}`}>
            <div className="account-main">
              <span className="account-name">{acc.name}</span>
              <span className="account-meta">
                {acc.type === 'savings'
                  ? `Savings · ${(acc.apy * 100).toFixed(2)}% APY`
                  : 'Spending'}
              </span>
            </div>
            <div className="account-right">
              <span className="account-balance">
                {formatCurrency(balances?.[acc.id] ?? acc.initialBalance)}
              </span>
              {acc.type === 'savings' && (
                <input
                  type="number"
                  step="0.01"
                  className="apy-input"
                  value={(acc.apy * 100).toFixed(2)}
                  onChange={(e) =>
                    onUpdate(acc.id, { apy: (parseFloat(e.target.value) || 0) / 100 })
                  }
                  title="APY %"
                />
              )}
              <input
                type="number"
                step="0.01"
                className="initial-input"
                value={acc.initialBalance}
                onChange={(e) =>
                  onUpdate(acc.id, { initialBalance: parseFloat(e.target.value) || 0 })
                }
                title="Starting balance"
              />
              {accounts.length > 1 && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onDelete(acc.id)}
                  aria-label={`Delete ${acc.name}`}
                >
                  ×
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <form className="account-form" onSubmit={submit}>
        <input
          type="text"
          placeholder="New account name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <select
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value })}
        >
          <option value="savings">Savings</option>
          <option value="spending">Spending</option>
        </select>
        {draft.type === 'savings' && (
          <input
            type="number"
            step="0.01"
            placeholder="APY %"
            value={draft.apy}
            onChange={(e) => setDraft({ ...draft, apy: e.target.value })}
          />
        )}
        <input
          type="number"
          step="0.01"
          placeholder="Starting £"
          value={draft.initialBalance}
          onChange={(e) => setDraft({ ...draft, initialBalance: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default AccountManager;
