import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HeartIcon, TrendingUpIcon, CalendarIcon } from 'lucide-react';
import { useAuth } from '../state/AuthContext';

export function DonorDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);

  // Placeholder for when API is fully wired
  useEffect(() => {
    // In a real scenario, this fetches GET /api/donations/my-history
    setDonations([
      { id: 1, date: '2026-03-15', amount: 500.00, fund: 'General Safehouse Fund', status: 'Completed' },
      { id: 2, date: '2025-12-20', amount: 1000.00, fund: 'Education & Reintegration', status: 'Completed' },
      { id: 3, date: '2025-08-05', amount: 250.00, fund: 'Emergency Medical', status: 'Completed' }
    ]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-surface-dark">
          {t('Welcome back')}, {user?.email?.split('@')[0] || 'Donor'}
        </h1>
      </div>

      {/* Impact Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-slate-200 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-brand-50 text-brand rounded-lg">
            <HeartIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-surface-text font-medium">Lifetime Giving</p>
            <p className="text-2xl font-bold text-surface-dark">$1,750.00</p>
          </div>
        </div>
        <div className="bg-surface border border-slate-200 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-accent/10 text-accent rounded-lg">
            <TrendingUpIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-surface-text font-medium">Active Safehouses Supported</p>
            <p className="text-2xl font-bold text-surface-dark">3</p>
          </div>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-surface-dark flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand" />
            My Donation History
          </h2>
          <button className="text-sm text-brand hover:text-brand-dark font-medium">Download Tax Receipt</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-sm text-surface-text">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Fund Designation</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-surface-text">{d.date}</td>
                  <td className="px-6 py-4 font-medium text-surface-dark">{d.fund}</td>
                  <td className="px-6 py-4 text-surface-dark font-semibold">${d.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DonorDashboard