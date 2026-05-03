import React from 'react';
import { formatCurrency, formatSigned } from '../utils/recurrence';

const monthYear = (d) =>
  d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase();

const CashflowSummary = ({ transactions }) => {
  const monthlyIn = transactions
    .filter((t) => t.recurrence === 'monthly' && t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const monthlyOut = transactions
    .filter((t) => t.recurrence === 'monthly' && t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const net = monthlyIn - monthlyOut;
  return (
    <div className="accounts-mini" style={{ marginTop: 14 }}>
      <div className="row">
        <span className="name">— Income</span>
        <span style={{ color: 'var(--pos)' }}>+£{monthlyIn.toFixed(2)}</span>
      </div>
      <div className="row">
        <span className="name">— Outgoings</span>
        <span style={{ color: 'var(--neg)' }}>−£{monthlyOut.toFixed(2)}</span>
      </div>
      <div className="row">
        <span className="name" style={{ color: 'var(--ink)', fontWeight: 700 }}>— Net</span>
        <span
          style={{
            color: net >= 0 ? 'var(--pos)' : 'var(--neg)',
            fontWeight: 700,
          }}
        >
          {formatSigned(net)}
        </span>
      </div>
    </div>
  );
};

const Headline = ({
  totalNow,
  totalInHorizon,
  horizonDate,
  accounts,
  accountBalances,
  transactions,
}) => {
  const delta = totalInHorizon - totalNow;
  const deltaPct = totalNow !== 0 ? (delta / Math.abs(totalNow)) * 100 : 0;
  const formatted = (n) =>
    n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="headline">
      <div className="col-cell">
        <div className="label">Net worth · today</div>
        <div className="big tnum">
          <span className="currency">£</span>
          {formatted(totalNow)}
        </div>
        <div className="accounts-mini" style={{ marginTop: 14 }}>
          {accounts.map((a) => (
            <div className="row" key={a.id}>
              <span className="name">— {a.name}</span>
              <span>{formatCurrency(accountBalances[a.id] ?? 0)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="divider" />
      <div className="col-cell">
        <div className="label">Forecast · {monthYear(horizonDate)}</div>
        <div className="big tnum">
          <span className="currency">£</span>
          {formatted(totalInHorizon)}
        </div>
        <div className="delta">
          <span className={`pct ${delta >= 0 ? 'pos' : 'neg'}`}>
            {delta >= 0 ? '▲' : '▼'} {formatSigned(delta)}
          </span>
          <span className={`pct ${delta >= 0 ? 'pos' : 'neg'}`}>
            ({delta >= 0 ? '+' : ''}
            {deltaPct.toFixed(1)}%)
          </span>
        </div>
        <div className="delta">
          <span className="note">— inclusive of compound interest, all accounts</span>
        </div>
      </div>
      <div className="divider" />
      <div className="col-cell">
        <div className="label">Monthly cash flow</div>
        <CashflowSummary transactions={transactions} />
      </div>
    </section>
  );
};

export default Headline;
