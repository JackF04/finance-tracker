import React, { useMemo, useState } from 'react';
import { monthlyProjection, formatCurrency } from '../utils/recurrence';

const Projection = ({ accounts, transactions }) => {
  const [view, setView] = useState('total');

  const { series, total } = useMemo(
    () => monthlyProjection(accounts, transactions, 12),
    [accounts, transactions]
  );

  const data =
    view === 'total'
      ? total
      : series.find((s) => s.account.id === view)?.points ?? [];

  const max = Math.max(1, ...data.map((d) => Math.abs(d.balance)));

  return (
    <div className="projection">
      <div className="projection-header">
        <h3>12-month projection</h3>
        <select value={view} onChange={(e) => setView(e.target.value)}>
          <option value="total">Total net worth</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <ul>
        {data.map((row) => {
          const pct = (Math.abs(row.balance) / max) * 100;
          return (
            <li key={row.label} className={row.balance < 0 ? 'neg' : 'pos'}>
              <span className="proj-label">{row.label}</span>
              <span className="proj-bar-track">
                <span className="proj-bar-fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="proj-value">{formatCurrency(row.balance)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Projection;
