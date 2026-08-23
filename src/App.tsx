import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Breadcrumb } from './components/Breadcrumb';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { ToolGrid } from './components/ToolGrid';
import { AdPlaceholder } from './components/AdPlaceholder';
import { Sparkles, Shield, Zap, Lock, Heart, CheckCircle2 } from 'lucide-react';

// Tool Components
import { ImageCompressor } from './tools/image/ImageCompressor';
import { BatchImageCompressor } from './tools/image/BatchImageCompressor';
import { ImageResizer } from './tools/image/ImageResizer';
import { ImageCropper } from './tools/image/ImageCropper';
import { RotateImage } from './tools/image/RotateImage';
import { FormatConverter } from './tools/image/FormatConverter';
import { PassportPhotoMaker } from './tools/image/PassportPhotoMaker';
import { ImageWatermark } from './tools/image/ImageWatermark';
import { ImageMetadataViewer } from './tools/image/ImageMetadataViewer';

import { MergePdf } from './tools/pdf/MergePdf';
import { SplitPdf } from './tools/pdf/SplitPdf';
import { RotatePdf } from './tools/pdf/RotatePdf';
import { DeletePdfPages } from './tools/pdf/DeletePdfPages';
import { ImageToPdf } from './tools/pdf/ImageToPdf';
import { TextToPdf } from './tools/pdf/TextToPdf';
import { PdfCompressor } from './tools/pdf/PdfCompressor';
import { ReorderPdfPages } from './tools/pdf/ReorderPdfPages';
import { ExtractPdfPages } from './tools/pdf/ExtractPdfPages';
import { PdfToImage } from './tools/pdf/PdfToImage';
import { PdfToPpt } from './tools/pdf/PdfToPpt';
import { PptToPdf } from './tools/pdf/PptToPdf';
import { WordToPdf } from './tools/pdf/WordToPdf';
import { PdfToWord } from './tools/pdf/PdfToWord';
import { ExcelToPdf } from './tools/pdf/ExcelToPdf';

import { CreateZip } from './tools/file/CreateZip';
import { ExtractZip } from './tools/file/ExtractZip';
import { FileSizeChecker } from './tools/file/FileSizeChecker';
import { FileTypeDetector } from './tools/file/FileTypeDetector';
import { FileHashGenerator } from './tools/file/FileHashGenerator';
import { BatchFileRenamer } from './tools/file/BatchFileRenamer';

import { WordCounter } from './tools/text/WordCounter';
import { CharacterCounter } from './tools/text/CharacterCounter';
import { TextCaseConverter } from './tools/text/TextCaseConverter';
import { RemoveDuplicateLines } from './tools/text/RemoveDuplicateLines';
import { TextCleaner } from './tools/text/TextCleaner';

import { JsonFormatter } from './tools/dev/JsonFormatter';
import { Base64Encoder } from './tools/dev/Base64Encoder';
import { UrlEncoder } from './tools/dev/UrlEncoder';
import { HashGenerator } from './tools/dev/HashGenerator';
import { UuidGenerator } from './tools/dev/UuidGenerator';
import { ColorConverter } from './tools/dev/ColorConverter';
import { JwtDebugger } from './tools/dev/JwtDebugger';
import { DiffChecker } from './tools/dev/DiffChecker';
import { MarkdownPreviewer } from './tools/dev/MarkdownPreviewer';

import { QrGenerator } from './tools/qr/QrGenerator';
import { QrScanner } from './tools/qr/QrScanner';
import { BarcodeGenerator } from './tools/qr/BarcodeGenerator';
import { BarcodeScanner } from './tools/qr/BarcodeScanner';

import { UnitConverter } from './tools/calc/UnitConverter';
import { PercentageCalculator } from './tools/calc/PercentageCalculator';
import { PasswordGenerator } from './tools/calc/PasswordGenerator';
import { TimeCalculator } from './tools/calc/TimeCalculator';
import { CsvJsonConverter } from './tools/calc/CsvJsonConverter';

const ToolRenderer: React.FC = () => {
  const { currentRoute, activeTool, isFavorite, toggleFavorite } = useApp();

  if (!activeTool) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">Tool Not Found</h2>
        <p className="text-sm text-slate-400">The requested tool route does not exist.</p>
      </div>
    );
  }

  const renderToolComponent = () => {
    switch (currentRoute) {
      // Image Tools
      case '/tools/image-compressor':
        return <ImageCompressor />;
      case '/tools/batch-image-compressor':
        return <BatchImageCompressor />;
      case '/tools/image-resizer':
        return <ImageResizer />;
      case '/tools/image-cropper':
        return <ImageCropper />;
      case '/tools/rotate-image':
      case '/tools/flip-image':
        return <RotateImage />;
      case '/tools/png-to-jpg':
      case '/tools/jpg-to-png':
      case '/tools/jpg-to-webp':
      case '/tools/image-to-webp':
      case '/tools/webp-to-jpg':
      case '/tools/svg-to-png':
      case '/tools/heic-to-jpg':
        return <FormatConverter />;
      case '/tools/passport-photo-maker':
        return <PassportPhotoMaker />;
      case '/tools/image-watermark':
        return <ImageWatermark />;
      case '/tools/image-metadata-viewer':
        return <ImageMetadataViewer />;

      // PDF Tools
      case '/tools/pdf-compressor':
      case '/tools/compress-pdf':
        return <PdfCompressor />;
      case '/tools/merge-pdf':
        return <MergePdf />;
      case '/tools/split-pdf':
        return <SplitPdf />;
      case '/tools/rotate-pdf':
        return <RotatePdf />;
      case '/tools/delete-pdf-pages':
        return <DeletePdfPages />;
      case '/tools/reorder-pdf-pages':
        return <ReorderPdfPages />;
      case '/tools/extract-pdf-pages':
        return <ExtractPdfPages />;
      case '/tools/pdf-to-image':
      case '/tools/pdf-to-jpg':
      case '/tools/pdf-to-png':
      case '/tools/extract-pdf-images':
        return <PdfToImage />;
      case '/tools/image-to-pdf':
      case '/tools/jpg-to-pdf':
      case '/tools/png-to-pdf':
        return <ImageToPdf />;
      case '/tools/text-to-pdf':
        return <TextToPdf />;
      case '/tools/pdf-to-ppt':
      case '/tools/pdf-to-powerpoint':
        return <PdfToPpt />;
      case '/tools/ppt-to-pdf':
      case '/tools/powerpoint-to-pdf':
        return <PptToPdf />;
      case '/tools/word-to-pdf':
        return <WordToPdf />;
      case '/tools/pdf-to-word':
        return <PdfToWord />;
      case '/tools/excel-to-pdf':
      case '/tools/pdf-to-excel':
        return <ExcelToPdf />;

      // File Tools
      case '/tools/create-zip':
        return <CreateZip />;
      case '/tools/extract-zip':
        return <ExtractZip />;
      case '/tools/file-size-checker':
      case '/tools/file-size-converter':
        return <FileSizeChecker />;
      case '/tools/file-type-detector':
        return <FileTypeDetector />;
      case '/tools/file-hash-generator':
        return <FileHashGenerator />;
      case '/tools/batch-file-renamer':
        return <BatchFileRenamer />;

      // Text Tools
      case '/tools/word-counter':
      case '/tools/reading-time-estimator':
        return <WordCounter />;
      case '/tools/character-counter':
        return <CharacterCounter />;
      case '/tools/line-counter':
        return <WordCounter />;
      case '/tools/text-case-converter':
        return <TextCaseConverter />;
      case '/tools/remove-duplicate-lines':
      case '/tools/sort-lines':
        return <RemoveDuplicateLines />;
      case '/tools/text-cleaner':
      case '/tools/lorem-ipsum-generator':
        return <TextCleaner />;

      // Developer Tools
      case '/tools/json-formatter':
      case '/tools/json-validator':
        return <JsonFormatter />;
      case '/tools/base64-encode':
      case '/tools/base64-decode':
      case '/tools/base64-encoder':
      case '/tools/base64-decoder':
      case '/tools/base64-image':
        return <Base64Encoder />;
      case '/tools/url-encode':
      case '/tools/url-decode':
      case '/tools/url-encoder':
      case '/tools/url-decoder':
        return <UrlEncoder />;
      case '/tools/hash-generator':
      case '/tools/sha256-generator':
      case '/tools/md5-generator':
        return <HashGenerator />;
      case '/tools/uuid-generator':
        return <UuidGenerator />;
      case '/tools/color-converter':
      case '/tools/color-picker':
      case '/tools/hex-to-rgb':
      case '/tools/rgb-to-hex':
        return <ColorConverter />;
      case '/tools/jwt-debugger':
        return <JwtDebugger />;
      case '/tools/diff-checker':
        return <DiffChecker />;
      case '/tools/markdown-previewer':
        return <MarkdownPreviewer />;

      // QR & Barcode Tools
      case '/tools/qr-code-generator':
      case '/tools/wifi-qr-code':
      case '/tools/vcard-qr-code':
        return <QrGenerator />;
      case '/tools/qr-code-scanner':
        return <QrScanner />;
      case '/tools/barcode-generator':
        return <BarcodeGenerator />;
      case '/tools/barcode-scanner':
        return <BarcodeScanner />;

      // Calculators & Utilities
      case '/tools/unit-converter':
        return <UnitConverter />;
      case '/tools/percentage-calculator':
        return <PercentageCalculator />;
      case '/tools/password-generator':
        return <PasswordGenerator />;
      case '/tools/date-difference':
      case '/tools/date-calculator':
      case '/tools/age-calculator':
      case '/tools/time-calculator':
        return <TimeCalculator />;
      case '/tools/csv-to-json':
      case '/tools/json-to-csv':
        return <CsvJsonConverter />;

      default:
        return (
          <div className="p-8 rounded-3xl bg-[#0D1224] border border-white/[0.08] text-center space-y-3">
            <h3 className="text-base font-bold text-white">{activeTool.name}</h3>
            <p className="text-xs text-slate-400">{activeTool.description}</p>
          </div>
        );
    }
  };

  const isFav = isFavorite(activeTool.id);

  return (
    <div className="space-y-6">
      <Breadcrumb tool={activeTool} />

      {/* Tool Header Card */}
      <div className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeTool.name}
              </h1>
              {activeTool.isLocalOnly && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Shield className="w-3 h-3" /> 100% Client-Side
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {activeTool.description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => toggleFavorite(activeTool.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                isFav
                  ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                  : 'bg-[#11182C] border-white/[0.08] text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-pink-500 text-pink-500' : ''}`} />
              <span>{isFav ? 'Favorited' : 'Favorite'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actual Active Tool Workspace */}
      <main id="tool-workspace" className="min-h-[400px]">
        {renderToolComponent()}
      </main>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { currentRoute } = useApp();
  const isHome = currentRoute === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#070A14] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 w-full">
        {isHome ? (
          <div className="space-y-8 sm:space-y-12">
            {/* Top Ad Banner */}
            <AdPlaceholder slot="top-banner" />

            {/* Quick Hero / Search Launcher */}
            <section className="text-center space-y-6 pt-4 pb-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>50+ Free Privacy-First Browser Tools</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
                Everyday tools that run{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                  entirely in your browser
                </span>
              </h1>

              <p className="text-xs sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                Zero file uploads to external servers. Fast, secure, and private image, PDF, text, and developer utilities.
              </p>

              <div className="pt-2">
                <SearchBar />
              </div>
            </section>

            {/* Category Filter Chips */}
            <section className="space-y-6">
              <CategoryNav />
              <ToolGrid />
            </section>

            {/* Bottom Ad Placeholder */}
            <AdPlaceholder slot="bottom-banner" />
          </div>
        ) : (
          <ToolRenderer />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
