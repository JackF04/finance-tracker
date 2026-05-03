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
  const [toAccountId, setToAccountId] = useState(
    accounts[1]?.id ?? defaultAccountId
  );

  const submit = () => {
    const value = parseFloat(amount);
    if (!description.trim() || Number.isNaN(value) || value <= 0 || !startDate) return;

    if (mode === 'transfer') {
      if (accountId === toAccountId) return;
      const pair = buildTransferPair({
        amount: value,
        description: description.trim(),
        recurrence,
        startDate,
        endDate,
        fromAccountId: accountId,
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

  return (
    <div className="card card-pad">
      <div className="section-head">
        <h2><span className="num">§ I</span>New entry</h2>
        <div className="meta">Form · Add</div>
      </div>

      <div className="seg">
        {['income', 'expense', 'transfer'].map((k) => (
          <button
            type="button"
            key={k}
            className={mode === k ? `active ${k}` : ''}
            onClick={() => setMode(k)}
          >
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      <div className="field-row two">
        <div className="field">
          <label>Description</label>
          <input
            className="input"
            placeholder="e.g. Spotify, Salary, Rent…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Amount</label>
          <input
            className="input mono-input"
            placeholder="£0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <div className={`field-row ${mode === 'transfer' ? 'four' : 'three'}`}>
        <div className="field">
          <label>{mode === 'transfer' ? 'From account' : 'Account'}</label>
          <select
            className="select"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {mode === 'transfer' && (
          <div className="field">
            <label>To account</label>
            <select
              className="select"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label>Recurrence</label>
          <select
            className="select"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f === 'none' ? 'One-off' : f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>{recurrence === 'none' ? 'Date' : 'Starts'}</label>
          <input
            type="date"
            className="input mono-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      {recurrence !== 'none' && (
        <div className="field-row two">
          <div className="field">
            <label>Ends (optional)</label>
            <input
              type="date"
              className="input mono-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      )}

      <button type="button" className="btn" onClick={submit}>
        Enter into the ledger
      </button>
    </div>
  );
};

export default TransactionForm;
