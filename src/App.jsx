import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Excel from './pages/Excel';
import MailMerger from './pages/MailMerger';
import WordLab from './pages/WordLab';
import WordParagraph from './pages/WordParagraph';
import WordPageLayout from './pages/WordPageLayout';
import WordTabulator from './pages/WordTabulator';
import ExcelChart from "./pages/ExcelChart";
import ExcelSort from './pages/ExcelSort';
import ExcelBasic from './pages/ExcelBasic';
import ExcelText from './pages/ExcelText';
import Biner from './pages/Biner';
import Oktal from './pages/Oktal';
import Heksadesimal from './pages/Heksadesimal';
import PemrosesanData from './pages/PemrosesanData';
import PengalamatanMemori from './pages/PengalamatanMemori';
import IntegrasiOffice from './pages/IntegrasiOffice';
import Explorer from './pages/Explorer';

// Lazy load heavy Three.js components for better performance on low-end devices
const Hardware3D = lazy(() => import('./pages/Hardware'));
const GerbangLogika = lazy(() => import('./pages/GerbangLogika'));
const BlocklyPage = lazy(() => import('./pages/Blockly'));
const BlocklyMaze = lazy(() => import('./pages/BlocklyMaze'));

// Loading fallback component
const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center bg-slate-900">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400 text-sm font-medium">Memuat halaman...</p>
    </div>
  </div>
);

// Create a wrapper component to use the router hooks
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('excel-sort');
  const location = useLocation();

  // We essentially want the Navbar everywhere now, or at least the user requested it.
  // We will simply render the Navbar always.
  // Checks for specific pages were preventing Navbar from showing.

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans text-gray-900 overflow-hidden">
      {/* Skip link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:font-bold"
      >
        Langsung ke konten utama
      </a>

      <Navbar />

      <main id="main-content" className="flex-1 overflow-hidden relative flex flex-col" role="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/excel-sort" element={<ExcelSort />} />
          <Route path="/excel-chart" element={<ExcelChart />} />
          {/* Lazy-loaded Heavy Components with Suspense */}
          <Route path="/blockly" element={<Suspense fallback={<PageLoader />}><BlocklyPage /></Suspense>} />
          <Route path="/blockly-maze" element={<Suspense fallback={<PageLoader />}><BlocklyMaze /></Suspense>} />
          <Route path="/hardware" element={<Suspense fallback={<PageLoader />}><Hardware3D /></Suspense>} />
          <Route path="/gerbang-logika" element={<Suspense fallback={<PageLoader />}><GerbangLogika /></Suspense>} />

          {/* Number Conversion */}
          <Route path="/biner" element={<Biner />} />
          <Route path="/oktal" element={<Oktal />} />
          <Route path="/heksadesimal" element={<Heksadesimal />} />

          {/* System Simulations */}
          <Route path="/pemrosesan-data" element={<PemrosesanData />} />
          <Route path="/pengalamatan-memori" element={<PengalamatanMemori />} />
          <Route path="/integrasi-office" element={<IntegrasiOffice />} />
          <Route path="/explorer" element={<Explorer />} />

          {/* Office Simulations */}
          <Route path="/excel" element={<Excel />} />
          <Route path="/excel-basic" element={<ExcelBasic />} />
          <Route path="/excel-text" element={<ExcelText />} />
          <Route path="/mailmerge" element={<MailMerger />} />


          {/* Word Lab - Simplified version for quick reference */}
          <Route path="/word-lab" element={<WordLab />} />
          {/* Original Word Simulations - Full Word-like UI */}
          <Route path="/word-paragraph" element={<WordParagraph />} />
          <Route path="/word-layout" element={<WordPageLayout />} />
          <Route path="/word-tabulator" element={<WordTabulator />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
