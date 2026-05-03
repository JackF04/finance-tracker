import React, { useState } from 'react';
import { FREQUENCIES, buildTransferPair } from '../utils/recurrence';

const today = () => new Date().toISOString().slice(0, 10);

const TransactionForm = ({ accounts, onAdd, onAddMany }) => {
  const defaultAccountId = accounts[0]?.id ?? '';
  const [mode, setMode] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState('');
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [fromAccountId, setFromAccountId] = useState(defaultAccountId);
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? defaultAccountId);

  const submit = (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!description.trim() || Number.isNaN(value) || value <= 0 || !startDate) return;

    if (mode === 'transfer') {
      if (fromAccountId === toAccountId) return;
      const pair = buildTransferPair({
        amount: value,
        description: description.trim(),
        recurrence,
        startDate,
        endDate,
        fromAccountId,
        toAccountId,
      });
      onAddMany(pair);
    } else {
      onAdd({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        description: description.trim(),
        amount: value,
        type: mode,
        recurrence,
        startDate,
        endDate: recurrence !== 'none' && endDate ? endDate : null,
        accountId,
      });
    }

    setDescription('');
    setAmount('');
    setEndDate('');
  };

  const ModePill = ({ value, label, className }) => (
    <label className={`pill ${mode === value ? `pill-active ${className}` : ''}`}>
      <input
        type="radio"
        name="mode"
        value={value}
        checked={mode === value}
        onChange={() => setMode(value)}
      />
      {label}
    </label>
  );

  return (
    <form className="txn-form" onSubmit={submit}>
      <div className="row">
        <ModePill value="income" label="Income" className="income" />
        <ModePill value="expense" label="Expense" className="expense" />
        <ModePill value="transfer" label="Transfer" className="transfer" />
      </div>

      <div className="row">
        <input
          type="text"
          placeholder="e.g. Spotify, Salary, Rent, Move to ISA"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount £"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {mode === 'transfer' ? (
        <div className="row">
          <label className="field">
            <span>From</span>
            <select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>To</span>
            <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className="row">
          <label className="field">
            <span>Account</span>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="row">
        <label className="field">
          <span>Recurrence</span>
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f === 'none' ? 'One-off' : f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{recurrence === 'none' ? 'Date' : 'Starts'}</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>
        {recurrence !== 'none' && (
          <label className="field">
            <span>Ends (optional)</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        )}
      </div>

      <button type="submit">
        {mode === 'transfer' ? 'Add transfer' : 'Add transaction'}
      </button>
    </form>
  );
};

export default TransactionForm;
