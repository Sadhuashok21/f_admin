import React, { useCallback, useEffect, useState } from 'react';
import { BadgeIndianRupee, CheckCircle2, CreditCard, Gift, Pause, Play, Plus, RefreshCw, Sparkles, Tag, XCircle } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('as_access_token') || ''}`,
});
type Coupon = { id: number; code: string; discount_type: 'percent' | 'fixed'; discount_value: number; compiler: string; active: boolean; allow_free: boolean; starts_at: string | null; expires_at: string | null; minimum_amount_paise: number; maximum_discount_paise: number | null; max_redemptions: number | null; per_user_limit: number; redemptions: number; revenue_paise: number; discount_total_paise: number };
type Config = { name: string; price_paise: number; is_free?: boolean; currency: string; active: boolean; successful_payments: number; revenue_paise: number; discounts_paise: number; coupons: Coupon[] };
const money = (amount: number) => `₹${(amount / 100).toFixed(2)}`;

export const SkiltrixCompilerPricingPage: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [priceRupees, setPriceRupees] = useState('');
  const [coupon, setCoupon] = useState({ code: '', discount_type: 'percent' as 'percent' | 'fixed', discount_value: '20', compiler: 'sap-abap', minimum_amount_rupees: '', maximum_discount_rupees: '', starts_at: '', expires_at: '', max_redemptions: '', per_user_limit: '1', allow_free: false });
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const response = await fetch(`${apiBase}/api/admin/compiler-pricing/`, { headers: authHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Unable to load compiler pricing.');
    setConfig(data);
    setPriceRupees((data.price_paise / 100).toFixed(2));
  }, []);

  useEffect(() => { load().catch((error) => setNotice(error.message)); }, [load]);

  const savePrice = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setNotice('');
    try {
      const response = await fetch(`${apiBase}/api/admin/compiler-pricing/`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ price_paise: Math.round(Number(priceRupees) * 100) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Price update failed.');
      setConfig(data); setNotice('Compiler price updated.');
    } catch (error: any) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const createCoupon = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      const payload = {
        code: coupon.code, discount_type: coupon.discount_type, discount_value: Number(coupon.discount_value), compiler: coupon.compiler,
        allow_free: coupon.allow_free,
        minimum_amount_paise: Math.round(Number(coupon.minimum_amount_rupees || 0) * 100),
        maximum_discount_paise: coupon.maximum_discount_rupees ? Math.round(Number(coupon.maximum_discount_rupees) * 100) : null,
        starts_at: coupon.starts_at || null, expires_at: coupon.expires_at || null,
        max_redemptions: coupon.max_redemptions ? Number(coupon.max_redemptions) : null, per_user_limit: Number(coupon.per_user_limit),
      };
      const response = await fetch(`${apiBase}/api/admin/compiler-coupons/${editingId ? `${editingId}/` : ''}`, { method: editingId ? 'PATCH' : 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Coupon creation failed.');
      setCoupon({ ...coupon, code: '' }); setEditingId(null); await load(); setNotice(editingId ? 'Coupon updated.' : 'Coupon created.');
    } catch (error: any) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const patchCoupon = async (item: Coupon, changes: Partial<Coupon>) => {
    setBusy(true); setNotice('');
    try {
      const response = await fetch(`${apiBase}/api/admin/compiler-coupons/${item.id}/`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(changes) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Coupon update failed.');
      await load();
    } catch (error: any) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  if (!config) return <section className="page-container"><p>{notice || 'Loading SAP ABAP pricing…'}</p></section>;
  return (
    <section className="page-container">
      <header className="page-header"><div><h1 className="page-title">SAP ABAP Pricing & Coupons</h1><p className="page-subtitle">Manage the live compiler price, eligible coupons, and purchase totals.</p></div><button className="btn btn-secondary" onClick={() => load().catch((error) => setNotice(error.message))}><RefreshCw size={16} /> Refresh</button></header>
      {notice && <div role="status" className="card" style={{ marginBottom: 16 }}>{notice}</div>}
      <div className="stats-grid">
        <article className="stat-card"><div className="stat-title">Successful purchases</div><div className="stat-value">{config.successful_payments}</div></article>
        <article className="stat-card"><div className="stat-title">Collected revenue</div><div className="stat-value">{money(config.revenue_paise)}</div></article>
        <article className="stat-card"><div className="stat-title">Coupon discounts</div><div className="stat-value">{money(config.discounts_paise)}</div></article>
      </div>
      <div className="card" style={{ marginTop: 20, maxWidth: 840 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BadgeIndianRupee size={20} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Compiler Access & Pricing Model</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: config.price_paise === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: config.price_paise === 0 ? '#10b981' : '#6366f1',
              border: `1px solid ${config.price_paise === 0 ? '#10b981' : '#6366f1'}`
            }}>
              {config.price_paise === 0 ? <Sparkles size={13} /> : <CreditCard size={13} />}
              <span>{config.price_paise === 0 ? 'FREE TIER ACTIVE' : 'PAID TIER ACTIVE'}</span>
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: config.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: config.active ? '#10b981' : '#ef4444',
              border: `1px solid ${config.active ? '#10b981' : '#ef4444'}`
            }}>
              {config.active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              <span>{config.active ? 'ACCESS ACTIVE' : 'ACCESS DISABLED'}</span>
            </span>
          </div>
        </div>

        <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>
          {config.name} · {config.price_paise === 0 ? 'Free instant access enabled for all registered learners' : `${money(config.price_paise)} permanent access after verified purchase`}
        </p>

        {/* Quick action buttons for Free vs Paid & Active Toggle */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18, marginBottom: 18, flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={busy}
            className={`btn ${config.price_paise === 0 ? 'btn-success' : 'btn-secondary'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              background: config.price_paise === 0 ? '#10b981' : undefined,
              color: config.price_paise === 0 ? '#fff' : undefined,
            }}
            onClick={async () => {
              setBusy(true); setNotice('');
              try {
                const response = await fetch(`${apiBase}/api/admin/compiler-pricing/`, {
                  method: 'PATCH',
                  headers: authHeaders(),
                  body: JSON.stringify({ is_free: true, price_paise: 0 }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || 'Failed to switch to free.');
                setConfig(data);
                setPriceRupees('0.00');
                setNotice('Compiler is now configured as FREE (₹0.00) for all users.');
              } catch (err: any) { setNotice(err.message); }
              finally { setBusy(false); }
            }}
          >
            <Gift size={16} />
            <span>Free Active (₹0)</span>
          </button>

          <button
            type="button"
            disabled={busy}
            className={`btn ${config.price_paise > 0 ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
            }}
            onClick={async () => {
              setBusy(true); setNotice('');
              try {
                const defaultPaid = config.price_paise > 0 ? config.price_paise : 19900;
                const response = await fetch(`${apiBase}/api/admin/compiler-pricing/`, {
                  method: 'PATCH',
                  headers: authHeaders(),
                  body: JSON.stringify({ is_free: false, price_paise: defaultPaid }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || 'Failed to switch to paid.');
                setConfig(data);
                setPriceRupees((defaultPaid / 100).toFixed(2));
                setNotice(`Compiler is now configured as PAID (${money(defaultPaid)}).`);
              } catch (err: any) { setNotice(err.message); }
              finally { setBusy(false); }
            }}
          >
            <CreditCard size={16} />
            <span>Paid Active</span>
          </button>

          <button
            type="button"
            disabled={busy}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              color: config.active ? '#ef4444' : '#10b981',
              borderColor: config.active ? '#ef4444' : '#10b981',
            }}
            onClick={async () => {
              setBusy(true); setNotice('');
              try {
                const response = await fetch(`${apiBase}/api/admin/compiler-pricing/`, {
                  method: 'PATCH',
                  headers: authHeaders(),
                  body: JSON.stringify({ active: !config.active }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || 'Failed to toggle status.');
                setConfig(data);
                setNotice(data.active ? 'Compiler sales and access are now ACTIVE.' : 'Compiler sales and access are now DISABLED.');
              } catch (err: any) { setNotice(err.message); }
              finally { setBusy(false); }
            }}
          >
            {config.active ? <Pause size={16} /> : <Play size={16} />}
            <span>{config.active ? 'Disable Access' : 'Enable Access'}</span>
          </button>
        </div>

        {/* Custom Price Form */}
        <form onSubmit={savePrice} style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'end', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: '0.85rem' }}>
            Custom Price in INR (Set 0 for Free)
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceRupees}
              onChange={(event) => setPriceRupees(event.target.value)}
              style={{ minWidth: 200 }}
            />
          </label>
          <button disabled={busy} className="btn btn-primary">Save Price</button>
        </form>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><Tag size={19} /><h2>{editingId ? 'Edit coupon' : 'Create coupon'}</h2></div>
        <form onSubmit={createCoupon} style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
          <label style={{ display: 'grid', gap: 6 }}>Code<input required value={coupon.code} onChange={(event) => setCoupon({ ...coupon, code: event.target.value.toUpperCase() })} placeholder="ABAP20" /></label>
          <label style={{ display: 'grid', gap: 6 }}>Discount<select value={coupon.discount_type} onChange={(event) => setCoupon({ ...coupon, discount_type: event.target.value as 'percent' | 'fixed' })}><option value="percent">Percent</option><option value="fixed">Fixed INR</option></select></label>
          <label style={{ display: 'grid', gap: 6 }}>Value<input required type="number" min="1" step="1" value={coupon.discount_value} onChange={(event) => setCoupon({ ...coupon, discount_value: event.target.value })} /></label>
          <label style={{ display: 'grid', gap: 6 }}>Minimum purchase ₹<input type="number" min="0" step="0.01" value={coupon.minimum_amount_rupees} onChange={(event) => setCoupon({ ...coupon, minimum_amount_rupees: event.target.value })} /></label>
          <label style={{ display: 'grid', gap: 6 }}>Max discount ₹<input type="number" min="0.01" step="0.01" value={coupon.maximum_discount_rupees} onChange={(event) => setCoupon({ ...coupon, maximum_discount_rupees: event.target.value })} /></label>
          <label style={{ display: 'grid', gap: 6 }}>Starts<input type="datetime-local" value={coupon.starts_at} onChange={(event) => setCoupon({ ...coupon, starts_at: event.target.value })} /></label>
          <label style={{ display: 'grid', gap: 6 }}>Expires<input type="datetime-local" value={coupon.expires_at} onChange={(event) => setCoupon({ ...coupon, expires_at: event.target.value })} /></label>
          <label style={{ display: 'grid', gap: 6 }}>Total limit<input type="number" min="1" step="1" value={coupon.max_redemptions} onChange={(event) => setCoupon({ ...coupon, max_redemptions: event.target.value })} /></label>
          <label style={{ display: 'grid', gap: 6 }}>Per-user limit<input required type="number" min="1" step="1" value={coupon.per_user_limit} onChange={(event) => setCoupon({ ...coupon, per_user_limit: event.target.value })} /></label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={coupon.allow_free} onChange={(event) => setCoupon({ ...coupon, allow_free: event.target.checked })} />Allow free purchase</label>
          <button disabled={busy} className="btn btn-primary"><Plus size={16} /> {editingId ? 'Save coupon' : 'Add coupon'}</button>
          {editingId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setCoupon({ ...coupon, code: '' }) }}>Cancel edit</button>}
        </form>
      </div>
      <div className="card" style={{ marginTop: 20, overflowX: 'auto' }}>
        <div className="card-header"><h2>Coupon rules and usage</h2></div>
        <table className="data-table"><thead><tr><th>Code</th><th>Discount</th><th>Redemptions</th><th>Revenue</th><th>Discount total</th><th>Status</th><th>Manage</th></tr></thead>
          <tbody>{config.coupons.map((item) => <tr key={item.id}><td>{item.code}</td><td>{item.discount_type === 'percent' ? `${item.discount_value}%` : `₹${item.discount_value}`}</td><td>{item.redemptions}{item.max_redemptions ? ` / ${item.max_redemptions}` : ''}</td><td>{money(item.revenue_paise)}</td><td>{money(item.discount_total_paise)}</td><td>{item.active ? 'Active' : 'Inactive'}</td><td><button className="btn btn-secondary" disabled={busy} onClick={() => { setEditingId(item.id); setCoupon({ code: item.code, discount_type: item.discount_type, discount_value: String(item.discount_value), compiler: item.compiler, minimum_amount_rupees: String(item.minimum_amount_paise / 100), maximum_discount_rupees: item.maximum_discount_paise ? String(item.maximum_discount_paise / 100) : '', starts_at: item.starts_at?.slice(0, 16) || '', expires_at: item.expires_at?.slice(0, 16) || '', max_redemptions: item.max_redemptions ? String(item.max_redemptions) : '', per_user_limit: String(item.per_user_limit), allow_free: item.allow_free }) }}>Edit</button><button className="btn btn-secondary" disabled={busy} onClick={() => patchCoupon(item, { active: !item.active })}>{item.active ? 'Deactivate' : 'Activate'}</button><button className="btn btn-secondary" disabled={busy} onClick={() => patchCoupon(item, { active: false })}>Archive</button></td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
};
