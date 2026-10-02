import React, { useState } from 'react';
import { Hammer, Sprout, CloudRain, TrendingUp, Users, Plus, Leaf } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

interface CropRecord {
  id: string;
  name: string;
  variety: string;
  region: string;
  marketPrice: string;
  yieldPerAcre: string;
  season: 'Kharif' | 'Rabi' | 'Zaid';
}

export const KrishiPage: React.FC = () => {
  const [crops] = useState<CropRecord[]>([
    {
      id: 'crp_paddy',
      name: 'Paddy Rice',
      variety: 'BPT 5204 (Sona Masoori)',
      region: 'Andhra Pradesh & Telangana',
      marketPrice: '₹2,320 / quintal',
      yieldPerAcre: '28-32 bags',
      season: 'Kharif'
    },
    {
      id: 'crp_cotton',
      name: 'Cotton',
      variety: 'Bt Cotton Hybrid',
      region: 'Warangal & Guntur',
      marketPrice: '₹7,150 / quintal',
      yieldPerAcre: '10-14 quintals',
      season: 'Kharif'
    },
    {
      id: 'crp_chilli',
      name: 'Red Chilli',
      variety: 'Teja Chilli',
      region: 'Khammam & Guntur',
      marketPrice: '₹18,500 / quintal',
      yieldPerAcre: '20-25 quintals',
      season: 'Rabi'
    },
    {
      id: 'crp_maize',
      name: 'Maize (Corn)',
      variety: 'Kaveri 50',
      region: 'Nizamabad & Karimnagar',
      marketPrice: '₹2,090 / quintal',
      yieldPerAcre: '30-35 quintals',
      season: 'Rabi'
    }
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Krishi Agro-Tech Advisory Panel</h1>
          <p className="page-subtitle">Agricultural crop metrics, mandi market prices, and soil telemetry intelligence</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Registered Farmers"
          value="18,450"
          trend="8.7"
          trendDirection="up"
          comparisonText="Across AP & Telangana districts"
          icon={<Users size={20} color="var(--primary)" />}
        />
        <StatCard
          title="Monitored Acreage"
          value="42,800"
          trend="14.2"
          trendDirection="up"
          comparisonText="Active IoT telemetry farmland"
          icon={<Sprout size={20} color="var(--success)" />}
        />
        <StatCard
          title="Mandi Price Index"
          value="+6.4%"
          trend="6.4"
          trendDirection="up"
          comparisonText="Average commodity growth"
          icon={<TrendingUp size={20} color="var(--warning)" />}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Leaf size={20} color="var(--success)" />
            <span>Commodity Mandi MSP & Crop Varieties</span>
          </h2>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Crop Name</th>
                <th>Certified Variety</th>
                <th>Farming Region</th>
                <th>Market Price (Mandi)</th>
                <th>Avg Yield / Acre</th>
                <th style={{ textAlign: 'center' }}>Crop Season</th>
              </tr>
            </thead>
            <tbody>
              {crops.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</td>
                  <td>{c.variety}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.region}</td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>{c.marketPrice}</td>
                  <td>{c.yieldPerAcre}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-approved">{c.season}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
