import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { Scale, ArrowRightLeft, Copy, Check } from 'lucide-react';

type UnitCategory = 'length' | 'weight' | 'temp' | 'area' | 'speed' | 'storage';

interface UnitDef {
  id: string;
  name: string;
  factor: number; // relative to base unit
}

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [copied, setCopied] = useState<boolean>(false);

  const unitsData: Record<UnitCategory, UnitDef[]> = {
    length: [
      { id: 'm', name: 'Meters (m)', factor: 1 },
      { id: 'km', name: 'Kilometers (km)', factor: 1000 },
      { id: 'cm', name: 'Centimeters (cm)', factor: 0.01 },
      { id: 'mm', name: 'Millimeters (mm)', factor: 0.001 },
      { id: 'mi', name: 'Miles (mi)', factor: 1609.344 },
      { id: 'yd', name: 'Yards (yd)', factor: 0.9144 },
      { id: 'ft', name: 'Feet (ft)', factor: 0.3048 },
      { id: 'in', name: 'Inches (in)', factor: 0.0254 },
    ],
    weight: [
      { id: 'kg', name: 'Kilograms (kg)', factor: 1 },
      { id: 'g', name: 'Grams (g)', factor: 0.001 },
      { id: 'mg', name: 'Milligrams (mg)', factor: 0.000001 },
      { id: 'lb', name: 'Pounds (lb)', factor: 0.45359237 },
      { id: 'oz', name: 'Ounces (oz)', factor: 0.0283495231 },
      { id: 't', name: 'Metric Tonnes (t)', factor: 1000 },
    ],
    temp: [
      { id: 'C', name: 'Celsius (°C)', factor: 1 },
      { id: 'F', name: 'Fahrenheit (°F)', factor: 1 },
      { id: 'K', name: 'Kelvin (K)', factor: 1 },
    ],
    area: [
      { id: 'sqm', name: 'Square Meters (m²)', factor: 1 },
      { id: 'sqkm', name: 'Square Kilometers (km²)', factor: 1000000 },
      { id: 'sqft', name: 'Square Feet (ft²)', factor: 0.092903 },
      { id: 'acre', name: 'Acres', factor: 4046.86 },
      { id: 'ha', name: 'Hectares (ha)', factor: 10000 },
    ],
    speed: [
      { id: 'mps', name: 'Meters per sec (m/s)', factor: 1 },
      { id: 'kph', name: 'Kilometers per hr (km/h)', factor: 0.277778 },
      { id: 'mph', name: 'Miles per hr (mph)', factor: 0.44704 },
      { id: 'knot', name: 'Knots (kn)', factor: 0.514444 },
    ],
    storage: [
      { id: 'B', name: 'Bytes (B)', factor: 1 },
      { id: 'KB', name: 'Kilobytes (KB)', factor: 1024 },
      { id: 'MB', name: 'Megabytes (MB)', factor: 1024 * 1024 },
      { id: 'GB', name: 'Gigabytes (GB)', factor: 1024 * 1024 * 1024 },
      { id: 'TB', name: 'Terabytes (TB)', factor: 1024 * 1024 * 1024 * 1024 },
    ],
  };

  const currentUnits = unitsData[category];

  const calculateConversion = (): number => {
    if (isNaN(inputValue)) return 0;

    // Special case for temperature
    if (category === 'temp') {
      if (fromUnit === toUnit) return inputValue;
      let c = inputValue;
      if (fromUnit === 'F') c = (inputValue - 32) * (5 / 9);
      if (fromUnit === 'K') c = inputValue - 273.15;

      if (toUnit === 'C') return c;
      if (toUnit === 'F') return c * (9 / 5) + 32;
      if (toUnit === 'K') return c + 273.15;
    }

    const fromDef = currentUnits.find((u) => u.id === fromUnit) || currentUnits[0];
    const toDef = currentUnits.find((u) => u.id === toUnit) || currentUnits[1];

    const baseValue = inputValue * fromDef.factor;
    return baseValue / toDef.factor;
  };

  const result = calculateConversion();

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const units = unitsData[newCat];
    setFromUnit(units[0].id);
    setToUnit(units[1].id);
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Category Nav Bar */}
      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-2 flex flex-wrap gap-1.5">
        {[
          { id: 'length', label: 'Length & Distance' },
          { id: 'weight', label: 'Weight & Mass' },
          { id: 'temp', label: 'Temperature' },
          { id: 'area', label: 'Area' },
          { id: 'speed', label: 'Speed' },
          { id: 'storage', label: 'Digital Storage' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id as UnitCategory)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              category === cat.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* From Input */}
          <div className="md:col-span-5 space-y-2">
            <label htmlFor="unit-convert-input" className="text-xs font-semibold text-slate-300 block">From</label>
            <input
              id="unit-convert-input"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-2xl bg-[#11182C] border border-white/[0.08] text-lg font-bold text-white focus:outline-none focus:border-purple-500 font-mono"
            />
            <label htmlFor="from-unit-select" className="sr-only">From Unit</label>
            <select
              id="from-unit-select"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {currentUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-2">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap units"
              className="p-3 rounded-2xl bg-[#11182C] hover:bg-purple-600 text-purple-400 hover:text-white border border-white/[0.08] transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To Output */}
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="unit-result-box" className="text-xs font-semibold text-emerald-400 block">To (Result)</label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div
              id="unit-result-box"
              className="w-full px-4 py-3 rounded-2xl bg-[#070A14] border border-white/[0.08] text-lg font-extrabold text-emerald-400 font-mono select-all overflow-x-auto truncate"
            >
              {parseFloat(result.toFixed(6)).toLocaleString()}
            </div>
            <label htmlFor="to-unit-select" className="sr-only">To Unit</label>
            <select
              id="to-unit-select"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {currentUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
