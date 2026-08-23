import React, { useState, useEffect, useRef } from 'react';
import { DownloadButton } from '../../components/DownloadButton';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { QrCode, Wifi, Globe, User, Mail, Phone, Sliders, Sparkles, Download } from 'lucide-react';
import QRCode from 'qrcode';

export const QrGenerator: React.FC = () => {
  const [type, setType] = useState<'url' | 'text' | 'wifi' | 'vcard' | 'email'>('url');

  // URL / Text payload
  const [url, setUrl] = useState<string>('https://everydaytoolbox.app');
  const [text, setText] = useState<string>('Hello from Everyday Toolbox!');

  // WiFi payload
  const [ssid, setSsid] = useState<string>('Home-WiFi');
  const [wifiPassword, setWifiPassword] = useState<string>('SecretPassword123');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState<boolean>(false);

  // VCard payload
  const [firstName, setFirstName] = useState<string>('Alex');
  const [lastName, setLastName] = useState<string>('Morgan');
  const [phoneNum, setPhoneNum] = useState<string>('+1 (555) 234-5678');
  const [vcardEmail, setVcardEmail] = useState<string>('alex@example.com');
  const [org, setOrg] = useState<string>('Acme Corp');

  // Email payload
  const [emailTo, setEmailTo] = useState<string>('support@example.com');
  const [emailSubj, setEmailSubj] = useState<string>('Inquiry');
  const [emailBody, setEmailBody] = useState<string>('Hello, I would like more information.');

  // Customization
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [ecLevel, setEcLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [size, setSize] = useState<number>(300);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');

  const getPayload = (): string => {
    if (type === 'url') return url;
    if (type === 'text') return text;
    if (type === 'wifi') {
      return `WIFI:T:${encryption};S:${ssid};P:${wifiPassword};H:${hidden ? 'true' : 'false'};;`;
    }
    if (type === 'vcard') {
      return `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName};;;\nFN:${firstName} ${lastName}\nORG:${org}\nTEL;TYPE=CELL:${phoneNum}\nEMAIL:${vcardEmail}\nEND:VCARD`;
    }
    if (type === 'email') {
      return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubj)}&body=${encodeURIComponent(emailBody)}`;
    }
    return url;
  };

  useEffect(() => {
    const generate = async () => {
      const payload = getPayload();
      if (!payload.trim()) return;

      try {
        const dataUrl = await QRCode.toDataURL(payload, {
          width: size,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: ecLevel,
        });
        setQrDataUrl(dataUrl);

        const svg = await QRCode.toString(payload, {
          type: 'svg',
          width: size,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: ecLevel,
        });
        setQrSvgString(svg);
      } catch (err) {
        console.error('QR generation error', err);
      }
    };

    generate();
  }, [type, url, text, ssid, wifiPassword, encryption, hidden, firstName, lastName, phoneNum, vcardEmail, org, emailTo, emailSubj, emailBody, fgColor, bgColor, ecLevel, size]);

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode-${type}-${size}px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${type}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      {/* Type Selector Bar */}
      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-3 flex flex-wrap gap-2">
        {[
          { id: 'url', label: 'Website URL', icon: Globe },
          { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
          { id: 'vcard', label: 'Contact Card (vCard)', icon: User },
          { id: 'text', label: 'Plain Text', icon: QrCode },
          { id: 'email', label: 'Email Prompt', icon: Mail },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setType(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                type === item.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#11182C] text-slate-300 hover:text-white border border-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Payload Form */}
        <div className="md:col-span-7 rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-5 shadow-xl">
          <h2 className="text-base font-bold text-white border-b border-white/[0.06] pb-3">
            QR Content Details
          </h2>

          {type === 'url' && (
            <div className="space-y-1.5">
              <label htmlFor="qr-website-url" className="text-xs font-semibold text-slate-300 block">Website URL</label>
              <input
                id="qr-website-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-2xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          )}

          {type === 'text' && (
            <div className="space-y-1.5">
              <label htmlFor="qr-plain-text" className="text-xs font-semibold text-slate-300 block">Text Content</label>
              <textarea
                id="qr-plain-text"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to encode..."
                className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>
          )}

          {type === 'wifi' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="wifi-ssid-input" className="text-xs font-semibold text-slate-300 block">Network SSID (Name)</label>
                <input
                  id="wifi-ssid-input"
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="MyHomeNetwork"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="wifi-password-input" className="text-xs font-semibold text-slate-300 block">Password</label>
                <input
                  id="wifi-password-input"
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="SecretPassword"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="wifi-security-select" className="text-xs font-semibold text-slate-300 block">Security Type</label>
                  <select
                    id="wifi-security-select"
                    value={encryption}
                    onChange={(e) => setEncryption(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white focus:outline-none"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hidden}
                      onChange={(e) => setHidden(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer accent-purple-500"
                    />
                    <span>Hidden SSID</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {type === 'vcard' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="vcard-first-name" className="text-xs text-slate-300 block">First Name</label>
                  <input
                    id="vcard-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="vcard-last-name" className="text-xs text-slate-300 block">Last Name</label>
                  <input
                    id="vcard-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="vcard-phone" className="text-xs text-slate-300 block">Phone Number</label>
                  <input
                    id="vcard-phone"
                    type="tel"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="vcard-email" className="text-xs text-slate-300 block">Email Address</label>
                  <input
                    id="vcard-email"
                    type="email"
                    value={vcardEmail}
                    onChange={(e) => setVcardEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="vcard-org" className="text-xs text-slate-300 block">Organization / Company</label>
                <input
                  id="vcard-org"
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white"
                />
              </div>
            </div>
          )}

          {type === 'email' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="email-recipient" className="text-xs text-slate-300 block">Recipient Email</label>
                <input
                  id="email-recipient"
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="email-subject" className="text-xs text-slate-300 block">Subject</label>
                <input
                  id="email-subject"
                  type="text"
                  value={emailSubj}
                  onChange={(e) => setEmailSubj(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="email-message-body" className="text-xs text-slate-300 block">Message Body</label>
                <textarea
                  id="email-message-body"
                  rows={3}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#11182C] border border-white/[0.08] text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Styling Controls */}
          <div className="border-t border-white/[0.06] pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label htmlFor="qr-fg-color" className="text-[11px] text-slate-400 block">QR Color</label>
              <div className="flex items-center gap-2">
                <input
                  id="qr-fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-300 uppercase">{fgColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="qr-bg-color" className="text-[11px] text-slate-400 block">Background</label>
              <div className="flex items-center gap-2">
                <input
                  id="qr-bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-300 uppercase">{bgColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="qr-ec-select" className="text-[11px] text-slate-400 block">Error Correction</label>
              <select
                id="qr-ec-select"
                value={ecLevel}
                onChange={(e) => setEcLevel(e.target.value as any)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#11182C] border border-white/[0.08] text-xs text-white"
              >
                <option value="L">L (7% Recovery)</option>
                <option value="M">M (15% Recovery)</option>
                <option value="Q">Q (25% Recovery)</option>
                <option value="H">H (30% Recovery)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Preview & Download */}
        <div className="md:col-span-5 rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 flex flex-col items-center justify-between space-y-6 shadow-xl text-center">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Live QR Code</h3>
            <p className="text-xs text-slate-400">Scan with any smartphone camera</p>
          </div>

          <div
            className="p-4 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center transition-all"
            style={{ backgroundColor: bgColor }}
          >
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
              />
            )}
          </div>

          <div className="w-full space-y-2.5">
            <DownloadButton onClick={handleDownloadPng} label="Download High-Res PNG" />
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="w-full py-2.5 rounded-xl bg-[#11182C] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.06] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Vector SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
