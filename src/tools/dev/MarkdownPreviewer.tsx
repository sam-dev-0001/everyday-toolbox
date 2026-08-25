import React, { useState } from 'react';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { FileCode, Eye, Copy, Check, Download, Sparkles } from 'lucide-react';

export const MarkdownPreviewer: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(
`# Everyday Tool 🛠️

**Everyday Tool** is a fast, free, modern suite of 50+ online tools.

## ✨ Key Features
- **100% Client-Side:** Zero file uploads to external servers.
- **Lightning Fast:** Instant local processing.
- **Privacy-First:** Your files stay strictly in browser memory.

### Code Sample
\`\`\`typescript
const app = "Everyday Tool";
console.log(\`Running \${app} safely in browser!\`);
\`\`\`

> "Crafted with precision for everyday developers and creators."
`
  );

  const [copied, setCopied] = useState<boolean>(false);

  // Simple, safe Markdown to HTML parser
  const renderMarkdown = (md: string): string => {
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-purple-300 mt-5 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-white mt-2 mb-3 pb-2 border-b border-white/[0.08]">$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-bold">$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em class="text-slate-300 italic">$1</em>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-purple-500 pl-4 py-1.5 my-3 bg-purple-500/10 text-slate-300 rounded-r-xl italic">$1</blockquote>');

    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre class="p-3.5 my-3 rounded-xl bg-[#070A14] border border-white/[0.08] text-xs font-mono text-emerald-300 overflow-x-auto"><code>$2</code></pre>');
    html = html.replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 rounded bg-white/[0.08] text-purple-300 text-xs font-mono">$1</code>');

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>');

    // Paragraphs
    html = html.replace(/\n\n/gim, '</p><p class="my-2.5 text-slate-300 leading-relaxed">');

    return `<div class="prose-dark leading-relaxed text-sm text-slate-300">${html}</div>`;
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(renderMarkdown(markdown));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdPlaceholder slot="top-banner" />

      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-5 sm:p-7 space-y-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Live Markdown Editor & Preview</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'HTML Copied' : 'Copy HTML'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11182C] text-slate-300 hover:text-white border border-white/[0.06] text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>
        </div>

        {/* Split screen editor and preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="markdown-source-textarea" className="text-xs font-bold text-slate-400 block">Markdown Source</label>
            <textarea
              id="markdown-source-textarea"
              rows={14}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type Markdown here..."
              className="w-full p-4 rounded-2xl bg-[#11182C] border border-white/[0.08] text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-purple-500 font-mono resize-y leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-purple-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Rendered Preview
              </span>
            </div>
            <div
              className="w-full p-5 rounded-2xl bg-[#070A14] border border-white/[0.08] min-h-[310px] max-h-[460px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
