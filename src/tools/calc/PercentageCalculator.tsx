import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Percent, ArrowRight, Sparkles } from 'lucide-react';

export const PercentageCalculator: React.FC = () => {
  // Mode 1: What is X% of Y?
  const [val1A, setVal1A] = useState<number>(15);
  const [val1B, setVal1B] = useState<number>(200);

  // Mode 2: X is what percent of Y?
  const [val2A, setVal2A] = useState<number>(25);
  const [val2B, setVal2B] = useState<number>(100);

  // Mode 3: Percentage increase / decrease from X to Y
  const [val3A, setVal3A] = useState<number>(50);
  const [val3B, setVal3B] = useState<number>(75);

  // Mode 4: Tip & Split Calculator
  const [billAmount, setBillAmount] = useState<number>(85);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [splitPeople, setSplitPeople] = useState<number>(2);

  const res1 = (val1A / 100) * val1B;
  const res2 = val2B !== 0 ? (val2A / val2B) * 100 : 0;
  const res3 = val3A !== 0 ? ((val3B - val3A) / val3A) * 100 : 0;

  const tipAmount = (billAmount * tipPercent) / 100;
  const totalBill = billAmount + tipAmount;
  const perPerson = splitPeople > 0 ? totalBill / splitPeople : totalBill;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Calc 1: What is X% of Y */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1224] border border-white/[0.08] space-y-4 shadow-xl">
          <span className="text-xs font-bold text-purple-400">1. What is X% of Y?</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">What is</span>
            <input
              type="number"
              value={val1A}
              onChange={(e) => setVal1A(parseFloat(e.target.value) || 0)}
              className="w-20 px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white font-mono"
            />
            <span className="text-xs text-slate-400">% of</span>
            <input
              type="number"
              value={val1B}
              onChange={(e) => setVal1B(parseFloat(e.target.value) || 0)}
              className="w-24 px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white font-mono"
            />
          </div>
          <div className="p-3 rounded-2xl bg-[#070A14] border border-white/[0.04] flex items-center justify-between">
            <span className="text-xs text-slate-400">Result:</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">{res1.toFixed(2)}</span>
          </div>
        </div>

        {/* Calc 2: X is what percent of Y */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1224] border border-white/[0.08] space-y-4 shadow-xl">
          <span className="text-xs font-bold text-purple-400">2. X is what % of Y?</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={val2A}
              onChange={(e) => setVal2A(parseFloat(e.target.value) || 0)}
              className="w-20 px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white font-mono"
            />
            <span className="text-xs text-slate-400">is what % of</span>
            <input
              type="number"
              value={val2B}
              onChange={(e) => setVal2B(parseFloat(e.target.value) || 0)}
              className="w-24 px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white font-mono"
            />
          </div>
          <div className="p-3 rounded-2xl bg-[#070A14] border border-white/[0.04] flex items-center justify-between">
            <span className="text-xs text-slate-400">Result:</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">{res2.toFixed(2)}%</span>
          </div>
        </div>

        {/* Calc 3: Percentage increase / decrease */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1224] border border-white/[0.08] space-y-4 shadow-xl">
          <span className="text-xs font-bold text-purple-400">3. Percentage Change (% Increase / Decrease)</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">From</span>
            <input
              type="number"
              value={val3A}
              onChange={(e) => setVal3A(parseFloat(e.target.value) || 0)}
              className="w-20 px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white font-mono"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="number"
              value={val3B}
              onChange={(e) => setVal3B(parseFloat(e.target.value) || 0)}
              className="w-24 px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white font-mono"
            />
          </div>
          <div className="p-3 rounded-2xl bg-[#070A14] border border-white/[0.04] flex items-center justify-between">
            <span className="text-xs text-slate-400">{res3 >= 0 ? 'Increase:' : 'Decrease:'}</span>
            <span className={`text-lg font-extrabold font-mono ${res3 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {res3 >= 0 ? '+' : ''}{res3.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Calc 4: Tip & Bill Split Calculator */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1224] border border-white/[0.08] space-y-4 shadow-xl">
          <span className="text-xs font-bold text-purple-400">4. Tip & Bill Split Calculator</span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block">Bill ($)</span>
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Tip %</span>
              <input
                type="number"
                value={tipPercent}
                onChange={(e) => setTipPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">People</span>
              <input
                type="number"
                min="1"
                value={splitPeople}
                onChange={(e) => setSplitPeople(parseInt(e.target.value, 10) || 1)}
                className="w-full px-2 py-1.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white font-mono"
              />
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#070A14] border border-white/[0.04] flex items-center justify-between text-xs">
            <span className="text-slate-400">Per Person (Total ${totalBill.toFixed(2)}):</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">${perPerson.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
