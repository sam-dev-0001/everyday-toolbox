import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Breadcrumb } from './components/Breadcrumb';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { ToolGrid } from './components/ToolGrid';
import { AdPlaceholder } from './components/AdPlaceholder';
import { SeoHead } from './components/SeoHead';
import { ToolSeoContent } from './components/ToolSeoContent';
import { StaticPage } from './components/StaticPages';
import { CATEGORIES } from './data/tools';
import { Sparkles, Shield, Heart, Loader2 } from 'lucide-react';

// Lazy Loaded Tool Components for Ultra-Fast Initial Page Load & High Performance
const ImageCompressor = lazy(() => import('./tools/image/ImageCompressor').then(m => ({ default: m.ImageCompressor })));
const BatchImageCompressor = lazy(() => import('./tools/image/BatchImageCompressor').then(m => ({ default: m.BatchImageCompressor })));
const ImageResizer = lazy(() => import('./tools/image/ImageResizer').then(m => ({ default: m.ImageResizer })));
const ImageCropper = lazy(() => import('./tools/image/ImageCropper').then(m => ({ default: m.ImageCropper })));
const RotateImage = lazy(() => import('./tools/image/RotateImage').then(m => ({ default: m.RotateImage })));
const FormatConverter = lazy(() => import('./tools/image/FormatConverter').then(m => ({ default: m.FormatConverter })));
const PassportPhotoMaker = lazy(() => import('./tools/image/PassportPhotoMaker').then(m => ({ default: m.PassportPhotoMaker })));
const ImageWatermark = lazy(() => import('./tools/image/ImageWatermark').then(m => ({ default: m.ImageWatermark })));
const ImageMetadataViewer = lazy(() => import('./tools/image/ImageMetadataViewer').then(m => ({ default: m.ImageMetadataViewer })));

const MergePdf = lazy(() => import('./tools/pdf/MergePdf').then(m => ({ default: m.MergePdf })));
const SplitPdf = lazy(() => import('./tools/pdf/SplitPdf').then(m => ({ default: m.SplitPdf })));
const RotatePdf = lazy(() => import('./tools/pdf/RotatePdf').then(m => ({ default: m.RotatePdf })));
const DeletePdfPages = lazy(() => import('./tools/pdf/DeletePdfPages').then(m => ({ default: m.DeletePdfPages })));
const ImageToPdf = lazy(() => import('./tools/pdf/ImageToPdf').then(m => ({ default: m.ImageToPdf })));
const TextToPdf = lazy(() => import('./tools/pdf/TextToPdf').then(m => ({ default: m.TextToPdf })));
const PdfCompressor = lazy(() => import('./tools/pdf/PdfCompressor').then(m => ({ default: m.PdfCompressor })));
const ReorderPdfPages = lazy(() => import('./tools/pdf/ReorderPdfPages').then(m => ({ default: m.ReorderPdfPages })));
const ExtractPdfPages = lazy(() => import('./tools/pdf/ExtractPdfPages').then(m => ({ default: m.ExtractPdfPages })));
const PdfToImage = lazy(() => import('./tools/pdf/PdfToImage').then(m => ({ default: m.PdfToImage })));
const PdfToPpt = lazy(() => import('./tools/pdf/PdfToPpt').then(m => ({ default: m.PdfToPpt })));
const PptToPdf = lazy(() => import('./tools/pdf/PptToPdf').then(m => ({ default: m.PptToPdf })));
const WordToPdf = lazy(() => import('./tools/pdf/WordToPdf').then(m => ({ default: m.WordToPdf })));
const PdfToWord = lazy(() => import('./tools/pdf/PdfToWord').then(m => ({ default: m.PdfToWord })));
const ExcelToPdf = lazy(() => import('./tools/pdf/ExcelToPdf').then(m => ({ default: m.ExcelToPdf })));

const CreateZip = lazy(() => import('./tools/file/CreateZip').then(m => ({ default: m.CreateZip })));
const ExtractZip = lazy(() => import('./tools/file/ExtractZip').then(m => ({ default: m.ExtractZip })));
const FileSizeChecker = lazy(() => import('./tools/file/FileSizeChecker').then(m => ({ default: m.FileSizeChecker })));
const FileTypeDetector = lazy(() => import('./tools/file/FileTypeDetector').then(m => ({ default: m.FileTypeDetector })));
const FileHashGenerator = lazy(() => import('./tools/file/FileHashGenerator').then(m => ({ default: m.FileHashGenerator })));
const BatchFileRenamer = lazy(() => import('./tools/file/BatchFileRenamer').then(m => ({ default: m.BatchFileRenamer })));

const WordCounter = lazy(() => import('./tools/text/WordCounter').then(m => ({ default: m.WordCounter })));
const CharacterCounter = lazy(() => import('./tools/text/CharacterCounter').then(m => ({ default: m.CharacterCounter })));
const TextCaseConverter = lazy(() => import('./tools/text/TextCaseConverter').then(m => ({ default: m.TextCaseConverter })));
const RemoveDuplicateLines = lazy(() => import('./tools/text/RemoveDuplicateLines').then(m => ({ default: m.RemoveDuplicateLines })));
const TextCleaner = lazy(() => import('./tools/text/TextCleaner').then(m => ({ default: m.TextCleaner })));

const JsonFormatter = lazy(() => import('./tools/dev/JsonFormatter').then(m => ({ default: m.JsonFormatter })));
const Base64Encoder = lazy(() => import('./tools/dev/Base64Encoder').then(m => ({ default: m.Base64Encoder })));
const UrlEncoder = lazy(() => import('./tools/dev/UrlEncoder').then(m => ({ default: m.UrlEncoder })));
const HashGenerator = lazy(() => import('./tools/dev/HashGenerator').then(m => ({ default: m.HashGenerator })));
const UuidGenerator = lazy(() => import('./tools/dev/UuidGenerator').then(m => ({ default: m.UuidGenerator })));
const ColorConverter = lazy(() => import('./tools/dev/ColorConverter').then(m => ({ default: m.ColorConverter })));
const JwtDebugger = lazy(() => import('./tools/dev/JwtDebugger').then(m => ({ default: m.JwtDebugger })));
const DiffChecker = lazy(() => import('./tools/dev/DiffChecker').then(m => ({ default: m.DiffChecker })));
const MarkdownPreviewer = lazy(() => import('./tools/dev/MarkdownPreviewer').then(m => ({ default: m.MarkdownPreviewer })));

const QrGenerator = lazy(() => import('./tools/qr/QrGenerator').then(m => ({ default: m.QrGenerator })));
const QrScanner = lazy(() => import('./tools/qr/QrScanner').then(m => ({ default: m.QrScanner })));
const BarcodeGenerator = lazy(() => import('./tools/qr/BarcodeGenerator').then(m => ({ default: m.BarcodeGenerator })));
const BarcodeScanner = lazy(() => import('./tools/qr/BarcodeScanner').then(m => ({ default: m.BarcodeScanner })));

const UnitConverter = lazy(() => import('./tools/calc/UnitConverter').then(m => ({ default: m.UnitConverter })));
const PercentageCalculator = lazy(() => import('./tools/calc/PercentageCalculator').then(m => ({ default: m.PercentageCalculator })));
const PasswordGenerator = lazy(() => import('./tools/calc/PasswordGenerator').then(m => ({ default: m.PasswordGenerator })));
const TimeCalculator = lazy(() => import('./tools/calc/TimeCalculator').then(m => ({ default: m.TimeCalculator })));
const CsvJsonConverter = lazy(() => import('./tools/calc/CsvJsonConverter').then(m => ({ default: m.CsvJsonConverter })));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-3">
    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    <span className="text-xs text-slate-400 font-medium">Loading tool workspace...</span>
  </div>
);

const ToolRenderer: React.FC = () => {
  const { activeTool, isFavorite, toggleFavorite } = useApp();

  if (!activeTool) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">Tool Not Found</h2>
        <p className="text-sm text-slate-400">The requested tool route does not exist.</p>
      </div>
    );
  }

  const renderToolComponent = () => {
    switch (activeTool.id) {
      // Image Tools
      case 'image-compressor':
        return <ImageCompressor />;
      case 'batch-image-compressor':
        return <BatchImageCompressor />;
      case 'image-resizer':
        return <ImageResizer />;
      case 'image-cropper':
        return <ImageCropper />;
      case 'rotate-image':
      case 'flip-image':
        return <RotateImage />;
      case 'jpg-to-png':
      case 'png-to-jpg':
      case 'jpg-to-webp':
      case 'webp-to-jpg':
        return <FormatConverter />;
      case 'passport-photo-maker':
        return <PassportPhotoMaker />;
      case 'image-watermark':
        return <ImageWatermark />;
      case 'image-metadata-viewer':
        return <ImageMetadataViewer />;

      // PDF Tools
      case 'pdf-compressor':
        return <PdfCompressor />;
      case 'merge-pdf':
        return <MergePdf />;
      case 'split-pdf':
        return <SplitPdf />;
      case 'rotate-pdf':
        return <RotatePdf />;
      case 'delete-pdf-pages':
        return <DeletePdfPages />;
      case 'reorder-pdf-pages':
        return <ReorderPdfPages />;
      case 'extract-pdf-pages':
        return <ExtractPdfPages />;
      case 'pdf-to-image':
      case 'pdf-to-jpg':
      case 'pdf-to-png':
        return <PdfToImage />;
      case 'image-to-pdf':
        return <ImageToPdf />;
      case 'text-to-pdf':
        return <TextToPdf />;
      case 'pdf-to-ppt':
        return <PdfToPpt />;
      case 'ppt-to-pdf':
        return <PptToPdf />;
      case 'word-to-pdf':
        return <WordToPdf />;
      case 'pdf-to-word':
        return <PdfToWord />;
      case 'excel-to-pdf':
        return <ExcelToPdf />;

      // File Tools
      case 'create-zip':
        return <CreateZip />;
      case 'extract-zip':
        return <ExtractZip />;
      case 'file-size-checker':
      case 'file-size-converter':
        return <FileSizeChecker />;
      case 'file-type-detector':
        return <FileTypeDetector />;
      case 'file-hash-generator':
        return <FileHashGenerator />;
      case 'batch-file-renamer':
        return <BatchFileRenamer />;

      // Text Tools
      case 'word-counter':
      case 'line-counter':
        return <WordCounter />;
      case 'character-counter':
        return <CharacterCounter />;
      case 'text-case-converter':
        return <TextCaseConverter />;
      case 'remove-duplicate-lines':
        return <RemoveDuplicateLines />;
      case 'text-cleaner':
        return <TextCleaner />;

      // Developer Tools
      case 'json-formatter':
      case 'json-validator':
        return <JsonFormatter />;
      case 'base64-encoder':
      case 'base64-decoder':
        return <Base64Encoder />;
      case 'url-encoder':
      case 'url-decoder':
        return <UrlEncoder />;
      case 'uuid-generator':
        return <UuidGenerator />;
      case 'color-picker':
        return <ColorConverter />;
      case 'jwt-debugger':
        return <JwtDebugger />;
      case 'diff-checker':
        return <DiffChecker />;
      case 'markdown-previewer':
        return <MarkdownPreviewer />;
      case 'hash-generator':
        return <HashGenerator />;

      // QR & Barcode Tools
      case 'qr-code-generator':
        return <QrGenerator />;
      case 'qr-code-scanner':
        return <QrScanner />;
      case 'barcode-generator':
        return <BarcodeGenerator />;
      case 'barcode-scanner':
        return <BarcodeScanner />;

      // Calculators & Utilities
      case 'unit-converter':
        return <UnitConverter />;
      case 'percentage-calculator':
        return <PercentageCalculator />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'date-calculator':
      case 'age-calculator':
        return <TimeCalculator />;
      case 'csv-to-json':
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
      <SeoHead tool={activeTool} />

      <Breadcrumb tool={activeTool} />

      {/* Primary Tool Header Card */}
      <header className="rounded-3xl bg-[#0D1224] border border-white/[0.08] p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeTool.h1 || activeTool.name}
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

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => toggleFavorite(activeTool.id)}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
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
      </header>

      {/* Interactive Tool Workspace with Suspense */}
      <main id="tool-workspace" className="min-h-[350px]">
        <Suspense fallback={<LoadingSpinner />}>
          {renderToolComponent()}
        </Suspense>
      </main>

      {/* SEO & GEO Content Sections (How to Use, Formats, FAQ, Related Tools) */}
      <ToolSeoContent tool={activeTool} />
    </div>
  );
};

const MainContent: React.FC = () => {
  const { currentRoute, activeCategory, activeTool } = useApp();
  const isHome = currentRoute === '/';

  // Check if currentRoute is a static page
  if (currentRoute === '/about') {
    return (
      <div className="min-h-screen flex flex-col bg-[#070A14] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 w-full">
          <StaticPage pageType="about" />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentRoute === '/privacy') {
    return (
      <div className="min-h-screen flex flex-col bg-[#070A14] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 w-full">
          <StaticPage pageType="privacy" />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentRoute === '/terms') {
    return (
      <div className="min-h-screen flex flex-col bg-[#070A14] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 w-full">
          <StaticPage pageType="terms" />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentRoute === '/contact') {
    return (
      <div className="min-h-screen flex flex-col bg-[#070A14] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 w-full">
          <StaticPage pageType="contact" />
        </main>
        <Footer />
      </div>
    );
  }

  const selectedCategoryInfo = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#070A14] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {isHome && (
        <SeoHead
          isHome={true}
          category={activeCategory !== 'all' ? selectedCategoryInfo : undefined}
        />
      )}

      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 w-full">
        {isHome ? (
          <div className="space-y-8 sm:space-y-12">
            {/* Top Ad Banner */}
            <AdPlaceholder slot="top-banner" />

            {/* Hero & Search Launcher */}
            <section className="text-center space-y-6 pt-4 pb-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>60+ Free Privacy-First Browser Tools</span>
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

            {/* Category Filter Chips & Interactive Tool Grid */}
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
