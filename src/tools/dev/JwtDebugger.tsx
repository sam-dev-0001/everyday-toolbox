import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { KeyRound, CheckCircle2, AlertCircle, Copy, Check, Clock } from 'lucide-react';

export const JwtDebugger: React.FC = () => {
  const [token, setToken] = useState<string>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggSm9obnNvbiIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTc1MTYyMzkwMn0.4fGzC9W99Q4vV_kU28N4kM2sE3L1y0hF_s8_q4U09zM'
  );
  const [copied, setCopied] = useState<string | null>(null);

  const decodeJwt = () => {
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid JWT structure: Must contain exactly 3 parts separated by dots.' };
      }

      const decodePart = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      };

      const header = decodePart(parts[0]);
      const payload = decodePart(parts[1]);
      const signature = parts[2];

      let isExpired = false;
      let expDate: string | null = null;
      if (payload.exp) {
        const expMs = payload.exp * 1000;
        isExpired = Date.now() > expMs;
        expDate = new Date(expMs).toLocaleString();
      }

      return {
        valid: true,
        header,
        payload,
        signature,
        isExpired,
        expDate,
      };
    } catch (err: any) {
      return { valid: false, error: err.message || 'Failed to decode JWT string' };
    }
  };

  const decoded = decodeJwt();

  const handleCopy = (content: any, key: string) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Client-Side JWT Token Debugger</h2>
          </div>
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Private
          </span>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="jwt-token-textarea" className="text-xs font-semibold text-slate-300 block">Encoded JWT Token</label>
          <textarea
            id="jwt-token-textarea"
            rows={4}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JSON Web Token here..."
            className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs text-purple-300 focus:outline-none focus:border-purple-500 font-mono resize-y break-all leading-relaxed"
          />
        </div>

        {/* Decoded Sections */}
        {decoded.valid ? (
          <div className="space-y-4 pt-2">
            {/* Header */}
            <div className="p-4 rounded-2xl bg-[#11182C] border border-red-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400">Header: Algorithm & Token Type</span>
                <button
                  onClick={() => handleCopy(decoded.header, 'header')}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
                >
                  {copied === 'header' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'header' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-red-300 bg-[#070A14] p-3 rounded-xl border border-white/[0.04] overflow-x-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="p-4 rounded-2xl bg-[#11182C] border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-400">Payload: Claims Data</span>
                  {decoded.expDate && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        decoded.isExpired
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {decoded.isExpired ? 'Expired' : 'Active'} ({decoded.expDate})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleCopy(decoded.payload, 'payload')}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
                >
                  {copied === 'payload' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'payload' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-purple-300 bg-[#070A14] p-3 rounded-xl border border-white/[0.04] overflow-x-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>

            {/* Signature info */}
            <div className="p-4 rounded-2xl bg-[#11182C] border border-cyan-500/20 space-y-1">
              <span className="text-xs font-bold text-cyan-400">Signature</span>
              <p className="text-xs font-mono text-slate-400 truncate">{decoded.signature}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs font-semibold text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{decoded.error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
