import React, { useState } from 'react';
import { formatCurrency } from '../utils/recurrence';

const blank = { name: '', type: 'savings', apy: '', initialBalance: '' };

const meta = (acc) =>
  `${acc.type}${acc.apy > 0 ? ` · ${(acc.apy * 100).toFixed(2)}% APY` : ' · no interest'}`;

const AccountManager = ({ accounts, balances, onAdd, onUpdate, onDelete }) => {
  const [draft, setDraft] = useState(blank);

  const submit = () => {
    if (!draft.name.trim()) return;
    onAdd({
      id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: draft.name.trim(),
      type: draft.type,
      apy:
        draft.type === 'spending'
          ? 0
          : (parseFloat(draft.apy) || 0) / 100,
      initialBalance: parseFloat(draft.initialBalance) || 0,
    });
    setDraft(blank);
  };

  return (
    <div className="card card-pad">
      <div className="section-head">
        <h2><span className="num">§ II</span>Accounts</h2>
        <div className="meta">{accounts.length} active</div>
      </div>

      {accounts.map((a) => (
        <div className={`acct ${a.type}`} key={a.id}>
          <div className="marker" />
          <div className="name">
            {a.name}
            <span className="meta">{meta(a)}</span>
          </div>
          <div className="balance">
            {formatCurrency(balances?.[a.id] ?? a.initialBalance)}
          </div>
          {a.type !== 'spending' && (
            <input
              className="apy-input mono"
              type="number"
              step="0.01"
              value={(a.apy * 100).toFixed(2)}
              onChange={(e) =>
                onUpdate(a.id, { apy: (parseFloat(e.target.value) || 0) / 100 })
              }
              title="APY %"
            />
          )}
          <input
            className="bal-input mono"
            type="number"
            step="0.01"
            value={a.initialBalance}
            onChange={(e) =>
              onUpdate(a.id, { initialBalance: parseFloat(e.target.value) || 0 })
            }
            title="Starting balance"
          />
          {accounts.length > 1 ? (
            <button
              type="button"
              className="x"
              onClick={() => onDelete(a.id)}
              aria-label={`Delete ${a.name}`}
            >
              ×
            </button>
          ) : (
            <span />
          )}
        </div>
      ))}

      <div className="new-acct">
        <input
          className="input"
          placeholder="New account name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <select
          className="select"
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value })}
        >
          <option value="savings">Savings</option>
          <option value="spending">Spending</option>
          <option value="investment">Investment</option>
        </select>
        <input
          className="input mono-input"
          placeholder="APY %"
          value={draft.apy}
          onChange={(e) => setDraft({ ...draft, apy: e.target.value })}
          disabled={draft.type === 'spending'}
        />
        <input
          className="input mono-input"
          placeholder="Starting £"
          value={draft.initialBalance}
          onChange={(e) =>
            setDraft({ ...draft, initialBalance: e.target.value })
          }
        />
        <button type="button" className="btn-small" onClick={submit}>
          Add
        </button>
      </div>
    </div>
  );
};

export default AccountManager;
