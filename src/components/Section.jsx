import React, { useState } from 'react';

const Section = ({ title, transactions, setTransactions }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const addTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    setTransactions([...transactions, { description, amount: parseFloat(amount) }]);
    setDescription('');
    setAmount('');
  };

  return (
    <div className="section">
      <h3>{title}</h3>
      <form onSubmit={addTransaction}>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {transactions.map((txn, index) => (
          <li key={index}>
            {txn.description}: ${txn.amount.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Section;
