import React from 'react';
import { formatCurrency } from '../utils/recurrence';

const recurrenceLabel = (txn) => {
  if (!txn.recurrence || txn.recurrence === 'none') return 'One-off';
  const cap = txn.recurrence.charAt(0).toUpperCase() + txn.recurrence.slice(1);
  return txn.endDate ? `${cap} until ${txn.endDate}` : cap;
};

const iconText = (type) =>
  type === 'income' ? 'IN' : type === 'expense' ? 'EX' : 'TR';

const TransactionList = ({
  num,
  title,
  subtitle,
  transactions,
  accountsById,
  onDelete,
  emptyHint,
}) => {
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
    <div className="card card-pad">
      <div className="section-head">
        <h2>
          <span className="num">§ {num}</span>
          {title}
        </h2>
        <div className="meta">
          {transactions.length} entries{subtitle ? ` · ${subtitle}` : ''}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          {emptyHint || 'No entries yet. The page is blank.'}
        </div>
      ) : (
        rows.map((row) => {
          if (row.kind === 'transfer') {
            const fromName = accountsById[row.out.accountId]?.name ?? '?';
            const toName = accountsById[row.in.accountId]?.name ?? '?';
            return (
              <div className="txn transfer" key={row.out.transferId}>
                <div className="icon">TR</div>
                <div className="desc">
                  {row.out.description}
                  <span className="meta">
                    {recurrenceLabel(row.out)} · {fromName} → {toName} ·
                    {' '}{row.out.recurrence === 'none' ? '' : 'starts '}{row.out.startDate}
                  </span>
                </div>
                <div className="amt">⇄ £{Number(row.out.amount).toFixed(2)}</div>
                {onDelete && (
                  <button
                    type="button"
                    className="x"
                    onClick={() => onDelete(row.out.transferId, true)}
                    aria-label={`Delete transfer ${row.out.description}`}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          }

          const txn = row.txn;
          const accountName = accountsById[txn.accountId]?.name ?? '';
          const sign = txn.type === 'income' ? '+' : '−';
          return (
            <div className={`txn ${txn.type}`} key={txn.id}>
              <div className="icon">{iconText(txn.type)}</div>
              <div className="desc">
                {txn.description}
                <span className="meta">
                  {recurrenceLabel(txn)}
                  {accountName ? ` · ${accountName}` : ''} ·
                  {' '}{txn.recurrence === 'none' ? '' : 'starts '}{txn.startDate}
                </span>
              </div>
              <div className="amt">
                {sign}
                {formatCurrency(Number(txn.amount)).replace('£', '£').replace('−', '')}
              </div>
              {onDelete && (
                <button
                  type="button"
                  className="x"
                  onClick={() => onDelete(txn.id, false)}
                  aria-label={`Delete ${txn.description}`}
                >
                  ×
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default TransactionList;
