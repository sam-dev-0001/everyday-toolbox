import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Calendar, Clock, ArrowRight, Sparkles, Timer } from 'lucide-react';

export const TimeCalculator: React.FC = () => {
  const [tab, setTab] = useState<'diff' | 'add' | 'age'>('diff');

  // Date Diff State
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Add/Subtract State
  const [baseDate, setBaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [daysToAdd, setDaysToAdd] = useState<number>(45);

  // Age Calc State
  const [birthDate, setBirthDate] = useState<string>('2000-01-01');

  // Calculations
  const calcDiff = () => {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;
    return { totalDays, weeks, remDays };
  };

  const calcAddedDate = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysToAdd);
    return d.toDateString();
  };

  const calcAge = () => {
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays };
  };

  const diff = calcDiff();
  const age = calcAge();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Tabs */}
      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-2 flex flex-wrap gap-1.5">
        {[
          { id: 'diff', label: 'Date Difference (Days Between)' },
          { id: 'add', label: 'Add / Subtract Days' },
          { id: 'age', label: 'Exact Age Calculator' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              tab === t.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
        {tab === 'diff' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="diff-start-date" className="text-xs font-semibold text-slate-300 block">Start Date</label>
                <input
                  id="diff-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="diff-end-date" className="text-xs font-semibold text-slate-300 block">End Date</label>
                <input
                  id="diff-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#070A14] border border-white/[0.06] text-center space-y-2">
              <span className="text-xs text-slate-400">Total Duration</span>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono">
                {diff.totalDays} Days
              </p>
              <p className="text-xs text-purple-300 font-semibold">
                ({diff.weeks} weeks and {diff.remDays} days)
              </p>
            </div>
          </div>
        )}

        {tab === 'add' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="add-base-date" className="text-xs font-semibold text-slate-300 block">Starting Date</label>
                <input
                  id="add-base-date"
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="add-days-count" className="text-xs font-semibold text-slate-300 block">Days to Add / Subtract</label>
                <input
                  id="add-days-count"
                  type="number"
                  value={daysToAdd}
                  onChange={(e) => setDaysToAdd(parseInt(e.target.value, 10) || 0)}
                  placeholder="e.g. 45 or -10"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#070A14] border border-white/[0.06] text-center space-y-2">
              <span className="text-xs text-slate-400">Calculated Future / Past Date</span>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                {calcAddedDate()}
              </p>
            </div>
          </div>
        )}

        {tab === 'age' && (
          <div className="space-y-5">
            <div className="space-y-1.5 max-w-sm">
              <label htmlFor="age-birth-date" className="text-xs font-semibold text-slate-300 block">Your Date of Birth</label>
              <input
                id="age-birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-[#070A14] border border-white/[0.06] space-y-1">
                <span className="text-xs text-slate-400">Years</span>
                <p className="text-2xl font-extrabold text-white font-mono">{age.years}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#070A14] border border-white/[0.06] space-y-1">
                <span className="text-xs text-slate-400">Months</span>
                <p className="text-2xl font-extrabold text-purple-400 font-mono">{age.months}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#070A14] border border-white/[0.06] space-y-1">
                <span className="text-xs text-slate-400">Days</span>
                <p className="text-2xl font-extrabold text-blue-400 font-mono">{age.days}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#070A14] border border-white/[0.06] space-y-1">
                <span className="text-xs text-slate-400">Total Days Lived</span>
                <p className="text-2xl font-extrabold text-emerald-400 font-mono">{age.totalDays.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
