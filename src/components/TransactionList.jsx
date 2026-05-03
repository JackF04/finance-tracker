import React from 'react';
import { formatCurrency, signedAmount } from '../utils/recurrence';

const recurrenceLabel = (txn) => {
  if (!txn.recurrence || txn.recurrence === 'none') return 'One-off';
  const cap = txn.recurrence.charAt(0).toUpperCase() + txn.recurrence.slice(1);
  return txn.endDate ? `${cap} until ${txn.endDate}` : cap;
};

const TransactionList = ({
  transactions,
  accountsById,
  onDelete,
  title = 'All transactions',
  emptyHint,
}) => {
  if (!transactions.length) {
    return (
      <div className="txn-list">
        <h3>{title}</h3>
        <p className="muted">{emptyHint || 'Nothing here yet.'}</p>
      </div>
    );
  }

  const seen = new Set();
  const rows = [];
  transactions.forEach((txn) => {
    if (!txn.transferId) {
      rows.push({ kind: 'single', txn });
      return;
    }
    if (seen.has(txn.transferId)) return;
    seen.add(txn.transferId);
    const partner = transactions.find(
      (t) => t.transferId === txn.transferId && t.id !== txn.id
    );
    if (!partner) {
      rows.push({ kind: 'single', txn });
      return;
    }
    const out = txn.type === 'expense' ? txn : partner;
    const inn = txn.type === 'income' ? txn : partner;
    rows.push({ kind: 'transfer', out, in: inn });
  });

  return (
    <div className="txn-list">
      <h3>{title}</h3>
      <ul>
        {rows.map((row) => {
          if (row.kind === 'transfer') {
            const fromName = accountsById[row.out.accountId]?.name ?? '?';
            const toName = accountsById[row.in.accountId]?.name ?? '?';
            return (
              <li key={row.out.transferId} className="txn transfer">
                <div className="txn-main">
                  <span className="txn-desc">{row.out.description}</span>
                  <span className="txn-meta">
                    {recurrenceLabel(row.out)} · {fromName} → {toName}
                  </span>
                </div>
                <div className="txn-right">
                  <span className="txn-amount">{formatCurrency(row.out.amount)}</span>
                  {onDelete && (
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => onDelete(row.out.transferId, true)}
                      aria-label={`Delete transfer ${row.out.description}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              </li>
            );
          }
          const txn = row.txn;
          const accountName = accountsById[txn.accountId]?.name;
          return (
            <li key={txn.id} className={`txn ${txn.type}`}>
              <div className="txn-main">
                <span className="txn-desc">{txn.description}</span>
                <span className="txn-meta">
                  {recurrenceLabel(txn)}
                  {accountName ? ` · ${accountName}` : ''} · starts {txn.startDate}
                </span>
              </div>
              <div className="txn-right">
                <span className="txn-amount">{formatCurrency(signedAmount(txn))}</span>
                {onDelete && (
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => onDelete(txn.id, false)}
                    aria-label={`Delete ${txn.description}`}
                  >
                    ×
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TransactionList;
