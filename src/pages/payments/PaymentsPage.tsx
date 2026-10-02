import React, { useState } from 'react';
import { CreditCard, Landmark, Plus, CheckCircle2, History, AlertCircle, ShieldAlert } from 'lucide-react';
import { indianBanks } from '../../data/indianBanks';
import { initialBankAccounts } from '../../data/mockData';
import { BankAccount } from '../../types';

export const PaymentsPage: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [yourName, setYourName] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [retypeAccountNumber, setRetypeAccountNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (accountNumber !== retypeAccountNumber) {
      setErrorMsg('Account numbers do not match. Please verify.');
      return;
    }

    if (!ifsc || ifsc.trim().length < 4) {
      setErrorMsg('Please enter a valid IFSC code.');
      return;
    }

    const newAccount: BankAccount = {
      your_name: yourName,
      bank_name: bankName,
      ifsc: ifsc.toUpperCase(),
      account_number: `•••• •••• •••• ${accountNumber.slice(-4) || '0000'}`,
      is_primary: bankAccounts.length === 0
    };

    setBankAccounts(prev => [...prev, newAccount]);
    setSuccessMsg('Bank account added successfully!');
    setYourName('');
    setBankName('');
    setIfsc('');
    setAccountNumber('');
    setRetypeAccountNumber('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments & Banking</h1>
          <p className="page-subtitle">Manage payout methods, bank details, and threshold balances</p>
        </div>
      </div>

      {/* Cards Row matching payments_cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Earnings Card */}
        <div className="stat-card" style={{ borderColor: 'var(--primary)', background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, transparent 100%)' }}>
          <div className="stat-header">
            <span className="stat-title">Your Earnings</span>
            <div className="stat-icon" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--primary)' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            $43.00
          </div>
          <p className="stat-footer">
            Paid monthly if total is at least <b>US$100.00</b> (your payout threshold).
          </p>
        </div>

        {/* Primary Bank Card */}
        {bankAccounts.map((acc, idx) => (
          <div key={idx} className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
            <div className="stat-header">
              <span className="stat-title">Payout Method</span>
              <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.1)', color: 'var(--success)' }}>
                <Landmark size={18} />
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {acc.bank_name}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
              {acc.account_number}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {acc.your_name}
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--success)' }}>
              <CheckCircle2 size={14} />
              <span>Verified Primary Account</span>
            </div>
          </div>
        ))}

        {/* Transactions Card */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Recent Transactions</span>
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
              <History size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            No recent payouts pending for current cycle.
          </div>
          <div className="stat-footer" style={{ marginTop: 'auto' }}>
            Next payout assessment on 21st of next month.
          </div>
        </div>
      </div>

      {/* Add Bank Form Card matching backend payments.html .banks */}
      <div className="card" style={{ maxWidth: '720px' }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={20} color="var(--primary)" />
            <span>Add Bank Account Information</span>
          </h2>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddBank}>
          <div className="form-group">
            <label className="form-label" htmlFor="your_name">
              Your name on bank <span className="star">*</span>
            </label>
            <input
              type="text"
              id="your_name"
              className="form-input"
              placeholder="e.g. SADHU ASHOK KUMAR"
              value={yourName}
              onChange={e => setYourName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name of Bank <span className="star">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="form-input"
              list="bank_details"
              placeholder="Select or type your bank name"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              required
            />
            <datalist id="bank_details">
              {indianBanks.map((b, i) => (
                <option key={i} value={b} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ifsc">
              IFSC Code <span className="star">*</span>
            </label>
            <input
              type="text"
              id="ifsc"
              className="form-input"
              placeholder="e.g. SBIN0004312"
              value={ifsc}
              onChange={e => setIfsc(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="account_number">
              Account Number <span className="star">*</span>
            </label>
            <input
              type="password"
              id="account_number"
              className="form-input"
              placeholder="Enter bank account number"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="retype_account">
              Retype Account Number <span className="star">*</span>
            </label>
            <input
              type="text"
              id="retype_account"
              className="form-input"
              placeholder="Confirm bank account number"
              value={retypeAccountNumber}
              onChange={e => setRetypeAccountNumber(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Add Bank Account</span>
            </button>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldAlert size={14} />
              <span>Encrypted with bank-grade 256-bit security</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
