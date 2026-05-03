import React, { useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  dailyNet,
  transactionsOnDay,
  formatCurrency,
  signedAmount,
} from '../utils/recurrence';

const CalendarView = ({ transactions, accountsById, selectedDate, setSelectedDate }) => {
  const dayTransactions = useMemo(
    () => transactionsOnDay(transactions, selectedDate),
    [transactions, selectedDate]
  );

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const net = dailyNet(transactions, date);
    if (!net) return null;
    return (
      <div className={`tile-net ${net < 0 ? 'neg' : 'pos'}`}>
        {net > 0 ? '+' : '−'}£{Math.abs(net).toFixed(0)}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const net = dailyNet(transactions, date);
    if (!net) return '';
    return net < 0 ? 'has-expense' : 'has-income';
  };

  return (
    <div className="calendar-view">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />
      <div className="day-detail">
        <h3>{selectedDate.toDateString()}</h3>
        {dayTransactions.length === 0 ? (
          <p className="muted">No transactions on this day.</p>
        ) : (
          <ul>
            {dayTransactions.map((txn) => {
              const accName = accountsById[txn.accountId]?.name;
              return (
                <li key={txn.id} className={`txn ${txn.type}`}>
                  <div className="txn-main">
                    <span>{txn.description}</span>
                    {accName && <span className="txn-meta">{accName}</span>}
                  </div>
                  <span className="txn-amount">{formatCurrency(signedAmount(txn))}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
