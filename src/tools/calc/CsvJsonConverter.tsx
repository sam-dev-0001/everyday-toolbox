import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { DownloadButton } from '../../components/DownloadButton';
import { FileSpreadsheet, ArrowRightLeft, Copy, Check, Trash2, Download } from 'lucide-react';

export const CsvJsonConverter: React.FC = () => {
  const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [delimiter, setDelimiter] = useState<string>(',');

  const defaultCsv = 'id,name,role,country\n1,Alex,Frontend Engineer,USA\n2,Elena,UI Designer,Germany\n3,Kenji,Product Manager,Japan';
  const [input, setInput] = useState<string>(defaultCsv);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const convertData = (): string => {
    if (!input.trim()) return '';

    try {
      if (mode === 'csv2json') {
        const lines = input.trim().split('\n');
        if (lines.length === 0) return '[]';

        const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
        const rows = lines.slice(1);

        const jsonArray = rows.map((row) => {
          const values = row.split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));
          const obj: Record<string, any> = {};
          headers.forEach((header, i) => {
            const val = values[i] !== undefined ? values[i] : '';
            // Auto number parse if valid number
            if (!isNaN(Number(val)) && val !== '') {
              obj[header] = Number(val);
            } else if (val.toLowerCase() === 'true') {
              obj[header] = true;
            } else if (val.toLowerCase() === 'false') {
              obj[header] = false;
            } else {
              obj[header] = val;
            }
          });
          return obj;
        });

        return JSON.stringify(jsonArray, null, 2);
      } else {
        // JSON to CSV
        const parsed = JSON.parse(input);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Input must be a JSON array of objects.');
        }

        const headers = Array.from(
          new Set(parsed.flatMap((item) => (typeof item === 'object' && item !== null ? Object.keys(item) : [])))
        );

        const csvLines = [headers.join(delimiter)];

        parsed.forEach((item) => {
          const row = headers.map((header) => {
            const val = item[header] !== undefined ? item[header] : '';
            const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
            if (valStr.includes(delimiter) || valStr.includes('\n') || valStr.includes('"')) {
              return `"${valStr.replace(/"/g, '""')}"`;
            }
            return valStr;
          });
          csvLines.push(row.join(delimiter));
        });

        return csvLines.join('\n');
      }
    } catch (err: any) {
      return `Error: ${err.message || 'Failed to convert'}`;
    }
  };

  const output = convertData();

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isCsv = mode === 'json2csv';
    const blob = new Blob([output], { type: isCsv ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-data.${isCsv ? 'csv' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSwitchMode = () => {
    if (mode === 'csv2json') {
      setMode('json2csv');
      setInput(
        '[\n  {\n    "id": 1,\n    "name": "Alex",\n    "role": "Frontend Engineer",\n    "country": "USA"\n  },\n  {\n    "id": 2,\n    "name": "Elena",\n    "role": "UI Designer",\n    "country": "Germany"\n  }\n]'
      );
    } else {
      setMode('csv2json');
      setInput(defaultCsv);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">
              {mode === 'csv2json' ? 'CSV to JSON Converter' : 'JSON to CSV Converter'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwitchMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11182C] text-purple-300 hover:text-white border border-white/[0.06] text-xs font-semibold cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Switch to {mode === 'csv2json' ? 'JSON ➔ CSV' : 'CSV ➔ JSON'}</span>
            </button>

            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white cursor-pointer"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="&#9;">Tab (\t)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
        </div>

        {/* Input and Output textareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <label htmlFor="csv-input-data">{mode === 'csv2json' ? 'Input CSV' : 'Input JSON Array'}</label>
              {input && (
                <button onClick={() => setInput('')} className="text-rose-400 hover:text-rose-300">
                  Clear
                </button>
              )}
            </div>
            <textarea
              id="csv-input-data"
              rows={12}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste raw data here..."
              className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 font-mono resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
              <label htmlFor="csv-output-data">{mode === 'csv2json' ? 'JSON Output' : 'CSV Output'}</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-600/20 text-purple-300 text-xs"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.04] text-slate-300 text-xs hover:text-white"
                >
                  <Download className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>
            <textarea
              id="csv-output-data"
              rows={12}
              readOnly
              value={output}
              placeholder="Converted result will appear here..."
              className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs text-emerald-300 focus:outline-none font-mono resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
