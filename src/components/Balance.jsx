import React from 'react';
import { formatCurrency } from '../utils/recurrence';

const Balance = ({ totalNow, totalInYear, oneYearOut, accountBalances, accounts }) => {
  const delta = totalInYear - totalNow;
  const deltaPct = totalNow !== 0 ? (delta / Math.abs(totalNow)) * 100 : null;

  return (
    <div className="balance">
      <div className="balance-card primary">
        <span className="balance-label">Net worth today</span>
        <span className={`balance-value ${totalNow < 0 ? 'neg' : 'pos'}`}>
          {formatCurrency(totalNow)}
        </span>
        <div className="balance-breakdown">
          {accounts.map((acc) => (
            <div key={acc.id} className={`chip ${acc.type}`}>
              <span>{acc.name}</span>
              <span>{formatCurrency(accountBalances[acc.id] ?? 0)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="balance-card">
        <span className="balance-label">
          In 12 months · {oneYearOut.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </span>
        <span className={`balance-value ${totalInYear < 0 ? 'neg' : 'pos'}`}>
          {formatCurrency(totalInYear)}
        </span>
        <span className={`muted ${delta < 0 ? 'neg' : 'pos'}`}>
          {delta >= 0 ? '+' : '−'}{formatCurrency(Math.abs(delta))}
          {deltaPct !== null && ` (${delta >= 0 ? '+' : '−'}${Math.abs(deltaPct).toFixed(1)}%)`}
          {' · includes compounding'}
        </span>
      </div>
    </div>
  );
};

export default Balance;
