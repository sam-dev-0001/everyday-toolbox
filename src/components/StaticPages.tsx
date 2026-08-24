import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ShieldCheck, Lock, Cpu, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { SeoHead } from './SeoHead';

interface StaticPageProps {
  pageType: 'about' | 'privacy' | 'terms' | 'contact';
}

export const StaticPage: React.FC<StaticPageProps> = ({ pageType }) => {
  const { navigate } = useApp();
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) return;
    setContactSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 text-slate-300">
      
      {/* Navigation Return */}
      <div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3.5 py-2 rounded-xl border border-purple-500/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tools</span>
        </button>
      </div>

      {/* ABOUT PAGE */}
      {pageType === 'about' && (
        <>
          <SeoHead
            title="About Everyday Toolbox – Free, Fast & Private Online Utilities"
            description="Learn more about Everyday Toolbox. 60+ free web utilities designed for instant productivity with 100% private in-browser processing."
          />
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  About Everyday Toolbox
                </h1>
              </div>
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
                Simple, lightning-fast utilities crafted for everyday digital workflows.
              </p>
            </div>

            <div className="prose prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-300">
              <p>
                <strong>Everyday Toolbox</strong> is a curated collection of 60+ essential web tools designed to solve daily digital tasks without hassle, software installations, paywalls, or privacy compromises.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
                <div className="rounded-2xl bg-[#0D1224] border border-white/[0.08] p-5 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-base">100% Client-Side</h3>
                  <p className="text-xs text-slate-400">
                    All conversions and calculations run right in your browser using modern Web APIs.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0D1224] border border-white/[0.08] p-5 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-base">Complete Privacy</h3>
                  <p className="text-xs text-slate-400">
                    Your photos, PDF documents, passwords, and text are never uploaded to any remote server.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0D1224] border border-white/[0.08] p-5 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-base">Zero Friction</h3>
                  <p className="text-xs text-slate-400">
                    No registrations, no credit cards, and no artificial limits on daily conversions.
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white pt-6">Our Mission</h2>
              <p>
                Our mission is to provide the fastest, cleanest, and most trustworthy online utility suite on the web. Whether you need to compress a photograph for an application, merge PDF contracts, format API JSON payloads, or generate a Wi-Fi QR code, Everyday Toolbox gets the job done in seconds.
              </p>
            </div>
          </div>
        </>
      )}

      {/* PRIVACY POLICY */}
      {pageType === 'privacy' && (
        <>
          <SeoHead
            title="Privacy Policy – Everyday Toolbox"
            description="Our privacy commitment: zero server uploads, zero file tracking. All calculations and file conversions happen 100% locally in your browser."
          />
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Privacy Policy
                </h1>
              </div>
              <p className="text-xs text-slate-400">Last updated: January 2026</p>
            </div>

            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 flex items-start gap-4">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
                <strong>Core Privacy Guarantee:</strong> Everyday Toolbox does not upload, store, log, or transmit any files, photos, PDF documents, or text you process. All processing executes 100% on your local device via client-side JavaScript, Canvas, and Web Crypto APIs.
              </div>
            </div>

            <div className="prose prose-invert max-w-none space-y-5 text-xs sm:text-sm leading-relaxed text-slate-300">
              <h2 className="text-lg font-bold text-white">1. File and Data Processing</h2>
              <p>
                When you use our tools (such as Image Compressor, PDF Merger, JSON Formatter, or Hash Generator), your browser processes the raw bytes locally in memory. The files are not uploaded to any remote server, cloud bucket, or database.
              </p>

              <h2 className="text-lg font-bold text-white">2. Local Storage and Preferences</h2>
              <p>
                We use browser <code>localStorage</code> solely to save your local UI preferences (such as Dark/Light theme mode and your saved tool favorites list). This data remains exclusively inside your browser on your device.
              </p>

              <h2 className="text-lg font-bold text-white">3. Third-Party Services and Analytics</h2>
              <p>
                We do not sell, rent, or trade your personal data. We do not use intrusive tracking cookies or personal fingerprinting technologies.
              </p>

              <h2 className="text-lg font-bold text-white">4. Camera and Microphone Permissions</h2>
              <p>
                Certain tools (such as QR Code Scanner or Barcode Scanner) request camera access to decode visual patterns. Video streams are analyzed frame-by-frame entirely inside your browser memory; no video or image feeds are ever recorded or broadcast.
              </p>
            </div>
          </div>
        </>
      )}

      {/* TERMS OF SERVICE */}
      {pageType === 'terms' && (
        <>
          <SeoHead
            title="Terms of Service – Everyday Toolbox"
            description="Terms of service and usage conditions for Everyday Toolbox free online web utilities."
          />
          <div className="space-y-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-400">Last updated: January 2026</p>

            <div className="prose prose-invert max-w-none space-y-5 text-xs sm:text-sm leading-relaxed text-slate-300">
              <h2 className="text-lg font-bold text-white">1. Permitted Use</h2>
              <p>
                Everyday Toolbox provides free online utilities for personal, educational, and commercial workflows. You are free to use these tools without recurring fees or subscription requirements.
              </p>

              <h2 className="text-lg font-bold text-white">2. Disclaimer of Warranties</h2>
              <p>
                All tools are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. While we make every effort to ensure accuracy and mathematical correctness across all converters and processors, users should verify critical calculations and retain backups of their original source documents.
              </p>

              <h2 className="text-lg font-bold text-white">3. Intellectual Property</h2>
              <p>
                Everyday Toolbox, its branding, interface design, and custom code are protected under applicable intellectual property laws. All output files, processed images, and documents remain 100% your own property.
              </p>
            </div>
          </div>
        </>
      )}

      {/* CONTACT PAGE */}
      {pageType === 'contact' && (
        <>
          <SeoHead
            title="Contact Everyday Toolbox – Feedback & Support"
            description="Get in touch with the Everyday Toolbox team. Send questions, feature suggestions, or tool requests."
          />
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Contact & Feedback
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Have a feature idea or need a new tool added? We&apos;d love to hear from you.
              </p>
            </div>

            {contactSubmitted ? (
              <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Thank You for Your Feedback!</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Your message has been received. We continuously improve Everyday Toolbox based on community suggestions.
                </p>
                <button
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactMessage('');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-900 font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-6 sm:p-8 space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Message or Tool Request
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe a tool you'd like to see, or report an issue..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#11182C] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </>
      )}

    </div>
  );
};
