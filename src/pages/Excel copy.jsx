import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Table, Grid, List, HelpCircle, ArrowRight, MousePointer2, Info,
  Settings2, Edit3, Lightbulb, Play, RotateCcw, ArrowUp, RotateCw,
  RotateCcw as RotateLeft, Repeat, Trash2, CheckCircle2, Flag, Bot,
  Trophy, Star, ChevronRight, Split, GitBranch, Layers, Zap, Target,
  Navigation, BookOpen, X, Sparkles, Cpu, Code2, AlertCircle, LayoutGrid, Home, Code, Menu, ChevronDown,
  Pause, FastForward
} from 'lucide-react';

// ============================================================
// MODUL 1: SPREADSHEET LAB (UI BARU & ANIMASI)
// ============================================================

const ArgumentInput = ({ label, value, onChange, options, type = "text", desc, highlight, color = "blue" }) => (
  <div className={`mb-6 transition-all duration-300 ${highlight ? 'transform scale-[1.02]' : ''}`}>
    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
      {label}
      {type === 'number' ? <span className="text-purple-400">#</span> : <HelpCircle size={10} className="text-blue-400" />}
    </label>
    <div className="relative mb-3">
      {options ? (
        <div className="relative">
          <select
            value={value}
            onChange={onChange}
            className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono shadow-sm"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 font-mono focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
        />
      )}
    </div>
    {desc && (
      <div className={`flex gap-3 pl-3 border-l-[3px] ${color === 'purple' ? 'border-purple-400' : 'border-blue-400'}`}>
        <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">
          {desc}
        </p>
      </div>
    )}
  </div>
);

const SpreadsheetLab = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabParam || 'VLOOKUP');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Reset inputs to sensible defaults when switching between Data Modes
  useEffect(() => {
    if (['COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'].includes(activeTab)) {
      setInputs(prev => ({
        ...prev,
        countifCriteria: "Makanan",
        sumifCriteria: "Makanan",
        countifsCrit1: "Minuman",
        countifsCrit2: ">20", // Terjual > 20
        sumifsCrit1: "Makanan",
        sumifsCrit2: ">20"
      }));
    }
  }, [activeTab]);

  // Animation State
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms

  const [highlightedCells, setHighlightedCells] = useState([]);
  const [activeArg, setActiveArg] = useState(null); // Which argument is currently being processed
  const [result, setResult] = useState(null);
  const [tempResult, setTempResult] = useState(null); // Visual feedback during animation

  // Data Sources
  const referenceData = [
    ['ID', 'Menu', 'Harga', 'Stok'],
    ['K01', 'Nasi Goreng', '15000', '10'],
    ['K02', 'Mie Ayam', '12000', '15'],
    ['K03', 'Es Teh', '5000', '50'],
    ['K04', 'Soto Ayam', '13000', '8']
  ];

  const summaryData = [
    ['Kategori', 'Menu', 'Terjual', 'Omzet'],
    ['Makanan', 'Nasi Goreng', '25', '375000'],
    ['Minuman', 'Es Teh', '50', '250000'],
    ['Makanan', 'Mie Ayam', '20', '240000'],
    ['Minuman', 'Jus Jeruk', '30', '300000']
  ];

  const verticalData = ['COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'].includes(activeTab) ? summaryData : referenceData;

  const horizontalData = [
    ['Bulan', 'Jan', 'Feb', 'Mar', 'Apr'],
    ['Omzet', '200k', '250k', '210k', '300k']
  ];

  const chooseData = [['Diskon 5%', 'Diskon 10%', 'Diskon 15%']];

  const [inputs, setInputs] = useState({
    vlookupValue: 'K02', vlookupCol: '2', vlookupRange: 'FALSE',
    hlookupValue: 'Mar', hlookupRow: '2', hlookupRange: 'FALSE',
    matchValue: 'Es Teh', matchArray: 'B1:B5', matchType: '0',
    indexRow: '3', indexCol: '2',
    chooseIndex: '1',
    countifCriteria: '>10',
    sumifCriteria: '>10000',
    countifsCrit1: '>5000', countifsCrit2: '<15',
    sumifsCrit1: '>10000', sumifsCrit2: '<15'
  });

  const getMatchOptions = () => {
    if (inputs.matchArray?.includes('A')) return verticalData.slice(1).map(r => r[0]);
    if (inputs.matchArray?.includes('B')) return verticalData.slice(1).map(r => r[1]);
    if (inputs.matchArray?.includes('C')) return verticalData.slice(1).map(r => r[2]);
    return [];
  };

  const evaluateCriteria = (value, criteria) => {
    const numVal = parseFloat(value);
    if (criteria.startsWith('>=')) return numVal >= parseFloat(criteria.slice(2));
    if (criteria.startsWith('<=')) return numVal <= parseFloat(criteria.slice(2));
    if (criteria.startsWith('>')) return numVal > parseFloat(criteria.slice(1));
    if (criteria.startsWith('<')) return numVal < parseFloat(criteria.slice(1));
    return value.toString().toLowerCase() === criteria.toLowerCase();
  };

  // --- ENGINE SIMULASI ---
  const generateSteps = () => {
    let steps = [];
    let finalRes = "";

    try {
      if (activeTab === 'VLOOKUP') {
        // STEP 1: Identifikasi Lookup Value
        steps.push({
          desc: `Mencari nilai "${inputs.vlookupValue}"...`,
          highlight: [],
          arg: 'lookup_value',
          res: '...'
        });

        // STEP 2: Scan Kolom Pertama
        const rowIndex = verticalData.findIndex(row => row[0] === inputs.vlookupValue);
        steps.push({
          desc: `Memindai kolom ID (A) untuk "${inputs.vlookupValue}"...`,
          highlight: verticalData.slice(1).map((_, i) => `v-r${i + 1}-c0`),
          arg: 'table_array',
          res: '...'
        });

        if (rowIndex !== -1) {
          // STEP 3: Ketemu
          steps.push({
            desc: `Ditemukan pada Baris ${rowIndex + 1}.`,
            highlight: [`v-r${rowIndex}-c0`],
            arg: 'table_array',
            res: 'Found'
          });

          // STEP 4: Geser ke Kolom
          const colIdx = parseInt(inputs.vlookupCol);
          if (colIdx >= 1 && colIdx <= 4) {
            steps.push({
              desc: `Mengambil data kolom ke-${colIdx}...`,
              highlight: [`v-r${rowIndex}-c0`, `v-r${rowIndex}-c${colIdx - 1}`],
              arg: 'col_index_num',
              res: verticalData[rowIndex][colIdx - 1]
            });
            finalRes = verticalData[rowIndex][colIdx - 1];
          } else {
            finalRes = "#REF!";
            steps.push({ desc: "Kolom tidak valid!", highlight: [], arg: 'col_index_num', res: "#REF!" });
          }
        } else {
          finalRes = "#N/A";
          steps.push({ desc: "Data tidak ditemukan.", highlight: [], arg: 'range_lookup', res: "#N/A" });
        }
      }
      else if (activeTab === 'HLOOKUP') {
        // STEP 1
        steps.push({ desc: `Mencari "${inputs.hlookupValue}" di baris pertama...`, highlight: [], arg: 'lookup_value', res: '...' });

        // STEP 2
        const colIndex = horizontalData[0].findIndex(col => col === inputs.hlookupValue);
        steps.push({
          desc: `Scanning Header Row...`,
          highlight: horizontalData[0].slice(1).map((_, i) => `h-r0-c${i + 1}`),
          arg: 'table_array',
          res: '...'
        });

        if (colIndex !== -1) {
          // STEP 3
          steps.push({ desc: `Ditemukan di Kolom ${colIndex}.`, highlight: [`h-r0-c${colIndex}`], arg: 'table_array', res: 'Found' });

          // STEP 4
          const rowIdx = parseInt(inputs.hlookupRow);
          if (rowIdx >= 1 && rowIdx <= 2) {
            steps.push({
              desc: `Mengambil data baris ke-${rowIdx}...`,
              highlight: [`h-r0-c${colIndex}`, `h-r${rowIdx - 1}-c${colIndex}`],
              arg: 'row_index_num',
              res: horizontalData[rowIdx - 1][colIndex]
            });
            finalRes = horizontalData[rowIdx - 1][colIndex];
          } else {
            finalRes = "#REF!";
            steps.push({ desc: "Index Baris Invalid", highlight: [], arg: 'row_index_num', res: "#REF!" });
          }
        } else {
          finalRes = "#N/A";
          steps.push({ desc: "Not Found", highlight: [], arg: 'range_lookup', res: "#N/A" });
        }
      }
      else if (activeTab === 'MATCH') {
        steps.push({ desc: `Mencari posisi "${inputs.matchValue}"...`, highlight: [], arg: 'lookup_value', res: '...' });
        const colToSearch = inputs.matchArray?.includes('A') ? 0 : inputs.matchArray?.includes('C') ? 2 : 1;

        steps.push({
          desc: `Scanning array ${inputs.matchArray}...`,
          highlight: verticalData.slice(1).map((_, i) => `v-r${i + 1}-c${colToSearch}`),
          arg: 'lookup_array',
          res: '...'
        });

        const rowIndex = verticalData.findIndex(row => row[colToSearch].toString().toLowerCase() === inputs.matchValue.toLowerCase());

        if (rowIndex !== -1) {
          steps.push({
            desc: `Ditemukan pada urutan ke-${rowIndex + 1}.`,
            highlight: [`v-r${rowIndex}-c${colToSearch}`],
            arg: 'match_type', // match_type is usually where we define exact match
            res: rowIndex + 1
          });
          finalRes = rowIndex + 1;
        } else {
          finalRes = "#N/A";
          steps.push({ desc: "Tidak ditemukan.", highlight: [], arg: 'match_type', res: "#N/A" });
        }
      }
      else {
        // Fallback Logic for others
        // Re-implement calculation to ensure result is correct
        if (activeTab === 'INDEX') {
          const r = parseInt(inputs.indexRow) - 1;
          const c = parseInt(inputs.indexCol) - 1;
          if (verticalData[r] && verticalData[r][c] !== undefined) {
            steps.push({ desc: `Baris ${r + 1}, Kolom ${c + 1}`, highlight: [`v-r${r}-c${c}`], arg: 'array', res: verticalData[r][c] });
            finalRes = verticalData[r][c];
          } else finalRes = "#REF!";
        }
        else if (activeTab === 'CHOOSE') {
          const idx = parseInt(inputs.chooseIndex) - 1;
          if (chooseData[0][idx]) {
            steps.push({ desc: `Index ${idx + 1}`, highlight: [`c-r0-c${idx}`], arg: 'index_num', res: chooseData[0][idx] });
            finalRes = chooseData[0][idx];
          } else finalRes = "#VALUE!";
        }
        else if (activeTab === 'COUNTIF') {
          // COUNTIF Logic for Summary Data
          // Default: Count match in Kategori (Col A->0, B->1, C->2, D->3)
          // Adjust logic to be flexible or hardcoded to Kategori logic if criteria is text
          const colIndex = 0; // Kategori
          steps.push({ desc: `Mencari "${inputs.countifCriteria}" di kolom Kategori...`, highlight: verticalData.slice(1).map((_, i) => `v-r${i + 1}-c${colIndex}`), arg: 'criteria', res: "..." });
          let count = 0;
          let matches = [];
          verticalData.slice(1).forEach((row, i) => {
            if (evaluateCriteria(row[colIndex], inputs.countifCriteria)) { count++; matches.push(`v-r${i + 1}-c${colIndex}`); }
          });
          steps.push({ desc: `Ditemukan ${count} item "${inputs.countifCriteria}".`, highlight: matches, arg: 'range', res: count });
          finalRes = count;
        }
        else if (activeTab === 'SUMIF') {
          // SUMIF Logic: Criteria on Kategori (0), Sum on Omzet (3)
          steps.push({ desc: `Filter Kategori "${inputs.sumifCriteria}"...`, highlight: [], arg: 'criteria', res: "..." });
          let sum = 0;
          let matches = [];

          verticalData.slice(1).forEach((row, i) => {
            if (evaluateCriteria(row[0], inputs.sumifCriteria)) {
              sum += parseFloat(row[3]); // Omzet
              matches.push(`v-r${i + 1}-c3`); // Highlight Omzet cell
            }
          });
          steps.push({ desc: `Total Omzet Kategori ${inputs.sumifCriteria}: ${sum}`, highlight: matches, arg: 'sum_range', res: sum });
          finalRes = sum;
        }
        else if (activeTab === 'COUNTIFS') {
          // COUNTIFS: Kategori (0) & Terjual (2)
          steps.push({ desc: `Filter 1: Kategori "${inputs.countifsCrit1}"...`, highlight: verticalData.slice(1).map((_, i) => `v-r${i + 1}-c0`), arg: 'criteria1', res: "..." });
          let count = 0;
          let matches = [];
          verticalData.slice(1).forEach((row, i) => {
            if (evaluateCriteria(row[0], inputs.countifsCrit1)) {
              matches.push(`v-r${i + 1}-c0`);
            }
          });
          steps.push({ desc: `Lolos Filter 1: ${matches.length} data.`, highlight: matches, arg: 'criteria_range1', res: matches.length });

          steps.push({ desc: `Filter 2: Terjual ${inputs.countifsCrit2}...`, highlight: verticalData.slice(1).map((_, i) => `v-r${i + 1}-c2`), arg: 'criteria2', res: "..." });
          let finalMatches = [];
          verticalData.slice(1).forEach((row, i) => {
            if (evaluateCriteria(row[0], inputs.countifsCrit1) && evaluateCriteria(row[2], inputs.countifsCrit2)) {
              count++;
              finalMatches.push(`v-r${i + 1}-c2`);
            }
          });

          finalRes = count;
          steps.push({ desc: `Total item "${inputs.countifsCrit1}" dengan Terjual ${inputs.countifsCrit2}: ${count}`, highlight: finalMatches, arg: 'all', res: count });
        }
        else if (activeTab === 'SUMIFS') {
          // SUMIFS: Sum Omzet (3), Criteria1 Kategori(0), Criteria2 Terjual(2)
          steps.push({ desc: "Identifikasi Range Omzet...", highlight: verticalData.slice(1).map((_, i) => `v-r${i + 1}-c3`), arg: 'sum_range', res: "..." });

          let val = 0;
          let finalMatches = [];

          steps.push({ desc: `Cek Kategori "${inputs.sumifsCrit1}"...`, highlight: verticalData.slice(1).map((_, i) => `v-r${i + 1}-c0`), arg: 'criteria1', res: "..." });

          verticalData.slice(1).forEach((row, i) => {
            if (evaluateCriteria(row[0], inputs.sumifsCrit1) && evaluateCriteria(row[2], inputs.sumifsCrit2)) {
              val += parseFloat(row[3]);
              finalMatches.push(`v-r${i + 1}-c3`);
            }
          });

          finalRes = val;
          steps.push({ desc: `Total Omzet (Filter gabungan): ${val}`, highlight: finalMatches, arg: 'all', res: val });
        }
      }

    } catch (e) { finalRes = "#ERROR"; console.error(e); }

    return { steps, finalRes };
  };

  const startAnimation = () => {
    const { steps, finalRes } = generateSteps();
    setAnimationSteps(steps);
    setResult(finalRes);
    setTempResult("...");
    setCurrentStep(0);
    setIsAnimating(true);
  };

  useEffect(() => {
    // Auto-update result when inputs change (Instant Mode) 
    if (!isAnimating) {
      const { steps, finalRes } = generateSteps();
      setResult(finalRes);
      if (steps.length > 0) {
        setHighlightedCells(steps[steps.length - 1].highlight);
        setTempResult(finalRes);
      } else {
        setHighlightedCells([]);
      }
    }
  }, [inputs, activeTab]);

  useEffect(() => {
    let timer;
    if (isAnimating) {
      if (currentStep < animationSteps.length) {
        timer = setTimeout(() => {
          const stepData = animationSteps[currentStep];
          setHighlightedCells(stepData.highlight);
          setActiveArg(stepData.arg);
          setTempResult(stepData.res);
          setCurrentStep(prev => prev + 1);
        }, playbackSpeed);
      } else {
        setIsAnimating(false);
        setActiveArg(null);
      }
    }
    return () => clearTimeout(timer);
  }, [isAnimating, currentStep, animationSteps, playbackSpeed]);


  const tabs = ['VLOOKUP', 'HLOOKUP', 'MATCH', 'INDEX', 'CHOOSE', 'COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'];

  const getFormulaInfo = () => {
    switch (activeTab) {
      case 'VLOOKUP': return { title: "Vertical Lookup", desc: "Mencari data ke bawah pada kolom pertama, lalu mengambil nilai di baris yang sama pada kolom tertentu.", syntax: "=VLOOKUP(lookup_value; table_array; col_index_num; [range_lookup])", challenge: "Ganti col_index_num menjadi 3. Perhatikan bagaimana highlight berpindah ke kolom Harga." };
      case 'HLOOKUP': return { title: "Horizontal Lookup", desc: "Mencari data ke samping pada baris pertama, lalu mengambil nilai di kolom yang sama pada baris tertentu.", syntax: "=HLOOKUP(lookup_value; table_array; row_index_num; [range_lookup])", challenge: "Ubah lookup_value menjadi 'Apr'. Tabel akan mencari omzet untuk bulan April secara horizontal." };
      case 'MATCH': return { title: "Match Function", desc: "Mencari posisi atau nomor urut suatu nilai di dalam daftar atau rentang sel.", syntax: "=MATCH(lookup_value; lookup_array; [match_type])", challenge: "Ganti lookup_array ke 'Kolom Menu'. Posisi data akan berubah sesuai urutan di kolom B." };
      case 'INDEX': return { title: "Index Function", desc: "Mengambil nilai dari sebuah sel berdasarkan koordinat nomor baris dan nomor kolom.", syntax: "=INDEX(array; row_num; [column_num])", challenge: "Masukkan baris 1 dan kolom 2. Komputer akan mengambil teks 'Menu' karena itu header baris 1." };
      case 'CHOOSE': return { title: "Choose Function", desc: "Memilih satu nilai dari daftar pilihan berdasarkan angka urut (index) yang diberikan.", syntax: "=CHOOSE(index_num; value1; [value2]; ...)", challenge: "Ubah index_num menjadi 3. Komputer akan otomatis memilih 'Diskon 15%' dari pilihan tersedia." };
      case 'COUNTIF': return { title: "Countif Function", desc: "Menghitung jumlah sel yang memenuhi satu kriteria atau syarat tertentu.", syntax: "=COUNTIF(range; criteria)", challenge: "Ganti kriteria menjadi 'Minuman'. Berapa kali kategori Minuman muncul di data?" };
      case 'SUMIF': return { title: "Sumif Function", desc: "Menjumlahkan nilai dalam rentang yang memenuhi satu kriteria atau syarat tertentu.", syntax: "=SUMIF(range; criteria; [sum_range])", challenge: "Coba kriteria 'Minuman'. Sistem akan menjumlahkan total Omzet dari semua Minuman." };
      case 'COUNTIFS': return { title: "Countifs Function", desc: "Menghitung jumlah sel berdasarkan banyak kriteria sekaligus (Kriteria 1 DAN Kriteria 2).", syntax: "=COUNTIFS(criteria_range1; criteria1; ...)", challenge: "Set kriteria Kategori 'Makanan' dan Terjual '>20'. Hitung menu makanan yang laris manis." };
      case 'SUMIFS': return { title: "Sumifs Function", desc: "Menjumlahkan nilai sel berdasarkan banyak kriteria sekaligus (Syarat 1 DAN Syarat 2).", syntax: "=SUMIFS(sum_range; criteria_range1; criteria1; ...)", challenge: "Ubah kriteria Terjual menjadi '>40'. Berapa omzet dari menu yang terjual sangat banyak?" };
      default: return { title: activeTab, desc: "Fungsi referensi dan statistik spreadsheet.", syntax: "Formula", challenge: "Bereksperimenlah dengan parameter input." };
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 font-sans text-slate-800 p-4 md:p-8 overflow-y-auto text-left custom-scrollbar">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

        {/* LEFT COLUMN: VISUALIZATION */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-green-600 text-white p-6 rounded-2xl shadow-md border-b-4 border-green-700">
            <h2 className="flex items-center gap-2 font-bold text-lg mb-2"><BookOpen className="w-5 h-5 text-green-200" /> {getFormulaInfo().title}</h2>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">{getFormulaInfo().desc}</p>
            <div className="bg-green-800/40 p-4 rounded-xl font-mono text-xs border border-white/10 select-all tracking-wider relative group">
              {getFormulaInfo().syntax}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            {/* Animation Overlay Info */}
            {isAnimating && (
              <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2 z-10">
                <Play size={10} className="fill-current" /> Simulasi Berjalan...
              </div>
            )}

            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Grid size={14} /> Worksheet View</h2>
            {/* VERTICAL TABLE (Hidden when HLOOKUP is active) */}
            {activeTab !== 'HLOOKUP' && (
              <div className="overflow-x-auto rounded-lg border border-slate-200 mb-6 shadow-sm relative">
                <div className="absolute top-0 right-0 bg-slate-100 text-[9px] text-slate-400 px-2 py-1 rounded-bl-lg font-bold uppercase tracking-wider">
                  {['COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'].includes(activeTab) ? 'Dataset: Laporan Penjualan' : 'Dataset: Referensi Harga'}
                </div>
                <table className="w-full border-collapse text-sm text-center mt-6">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500">
                      <th className="border border-slate-200 p-1 w-10 text-[10px] bg-slate-50 font-bold"></th>
                      {['A', 'B', 'C', 'D'].map(l => <th key={l} className="border border-slate-200 p-1 font-bold">{l}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {verticalData.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className={`border border-slate-200 p-1 text-[10px] bg-slate-50 font-bold ${rIdx === 0 ? 'text-slate-800' : 'text-slate-400'}`}>{rIdx + 1}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`border border-slate-200 p-3 transition-all duration-300 ${highlightedCells.includes(`v-r${rIdx}-c${cIdx}`) ? 'bg-yellow-100 border-yellow-500 font-bold text-yellow-900 ring-2 ring-yellow-400 ring-inset scale-95 rounded' : (rIdx === 0 && !['COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'].includes(activeTab) ? 'bg-slate-100 font-bold text-slate-700' : 'bg-white')}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* EXPERIMENTAL: HLOOKUP HORIZONTAL TABLE */}
            {activeTab === 'HLOOKUP' && (
              <div className="overflow-x-auto rounded-lg border border-slate-200 mb-6 shadow-sm">
                <p className="text-[10px] text-slate-500 mb-1 italic font-medium p-1">Tabel Horizontal (A10:E11)</p>
                <table className="w-full border-collapse text-sm text-center">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500">
                      <th className="border border-slate-200 p-1 w-10 text-[10px] bg-slate-50 font-bold"></th>
                      {['A', 'B', 'C', 'D', 'E'].map(l => <th key={l} className="border border-slate-200 p-1 font-bold">{l}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {horizontalData.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="border border-slate-200 p-1 text-[10px] text-slate-400 bg-slate-50 font-bold w-10">{rIdx + 10}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`border border-slate-200 p-3 transition-all duration-300 ${highlightedCells.includes(`h-r${rIdx}-c${cIdx}`) ? 'bg-orange-100 border-orange-500 font-bold text-orange-900 ring-2 ring-orange-400 ring-inset scale-95 rounded' : 'bg-white'}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'CHOOSE' && (
              <div className="mt-4 overflow-x-auto">
                <p className="text-[10px] text-slate-500 mb-1 italic font-medium">Data Lepas: Range A14:C14</p>
                <table className="border-collapse text-sm min-w-full">
                  <tbody>
                    <tr>
                      <td className="border border-slate-200 p-1 text-center text-[10px] text-slate-400 bg-slate-50 font-bold w-10">14</td>
                      {chooseData[0].map((cell, cIdx) => (
                        <td key={cIdx} className={`border border-slate-200 p-2 text-center transition-all duration-300 ${highlightedCells.includes(`c-r0-c${cIdx}`) ? 'bg-purple-100 border-purple-500 ring-2 ring-purple-400 ring-inset font-bold text-purple-900' : 'bg-white text-slate-400'}`}>{cell}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md border-t-4 border-green-500 overflow-hidden text-center relative transition-all">
            {/* Progress Bar */}
            {isAnimating && (
              <div className="h-1 bg-slate-100 w-full absolute top-0 left-0">
                <div className="h-full bg-green-500 transition-all duration-300 ease-linear" style={{ width: `${((currentStep) / animationSteps.length) * 100}%` }}></div>
              </div>
            )}

            <div className="bg-slate-900 px-4 py-3 flex items-center gap-3 overflow-x-auto border-b border-slate-800 text-left">
              <span className="italic font-serif text-green-400 font-bold text-lg">fx</span>
              <div className="font-mono text-sm text-slate-300 whitespace-nowrap">
                {activeTab === 'VLOOKUP' && `=VLOOKUP("${inputs.vlookupValue}"; A1:D5; ${inputs.vlookupCol}; ${inputs.vlookupRange})`}
                {activeTab === 'HLOOKUP' && `=HLOOKUP("${inputs.hlookupValue}"; A10:E11; ${inputs.hlookupRow}; ${inputs.hlookupRange})`}
                {activeTab === 'MATCH' && `=MATCH("${inputs.matchValue}"; ${inputs.matchArray}; 0)`}
                {activeTab === 'INDEX' && `=INDEX(A1:D5; ${inputs.indexRow}; ${inputs.indexCol})`}
                {/* ... Add others similarly ... */}
                {activeTab === 'CHOOSE' && `=CHOOSE(${inputs.chooseIndex}; "Diskon 5%"; "Diskon 10%"; "Diskon 15%")`}
                {activeTab === 'COUNTIF' && `=COUNTIF(Kategori; "${inputs.countifCriteria}")`}
                {activeTab === 'SUMIF' && `=SUMIF(Kategori; "${inputs.sumifCriteria}"; Omzet)`}
                {activeTab === 'COUNTIFS' && `=COUNTIFS(Kategori; "${inputs.countifsCrit1}"; Terjual; "${inputs.countifsCrit2}")`}
                {activeTab === 'SUMIFS' && `=SUMIFS(Omzet; Kategori; "${inputs.sumifsCrit1}"; Terjual; "${inputs.sumifsCrit2}")`}
              </div>
            </div>
            <div className="p-8 bg-green-50/20 flex flex-col items-center justify-center min-h-[140px]">
              {isAnimating ? (
                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status Kalkulasi</span>
                  <div className="text-xl font-medium text-slate-600">
                    {animationSteps[currentStep]?.desc || "Memulai..."}
                  </div>
                  <div className="text-sm font-mono text-slate-400 mt-2">
                    Val: {tempResult}
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest block mb-2">Output Terkalkulasi</span>
                  <div className="text-6xl font-mono font-black text-slate-900 drop-shadow-sm">{result}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-4 overflow-y-auto max-h-[85vh] custom-scrollbar text-left flex flex-col h-full">
            <div className="flex flex-col gap-3 mb-8">
              {/* First Row: Reference Functions */}
              <div>
                <span className="text-[10px] font-bold text-slate-300 uppercase mb-2 block tracking-widest">Lookup & Reference</span>
                <div className="flex gap-1.5 flex-wrap">
                  {tabs.slice(0, 5).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} disabled={isAnimating} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${activeTab === tab ? 'bg-green-600 border-green-700 text-white shadow-md scale-105' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50'}`}>{tab}</button>
                  ))}
                </div>
              </div>

              {/* Second Row: Statistical Functions */}
              <div>
                <span className="text-[10px] font-bold text-slate-300 uppercase mb-2 block tracking-widest">Statistical (Count/Sum)</span>
                <div className="flex gap-1.5 flex-wrap">
                  {tabs.slice(5).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} disabled={isAnimating} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${activeTab === tab ? 'bg-green-600 border-green-700 text-white shadow-md scale-105' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50'}`}>{tab}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <h3 className="text-[11px] font-extrabold text-slate-400 uppercase flex items-center gap-2 tracking-widest">
                <span className="text-slate-300">▼</span> ARGUMEN & INPUT FUNGSI
              </h3>
              <button
                onClick={startAnimation}
                disabled={isAnimating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${isAnimating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'}`}
              >
                {isAnimating ? <Pause size={14} /> : <Play size={14} />}
                {isAnimating ? 'Running...' : 'Simulasi'}
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {activeTab === 'VLOOKUP' && (
                <>
                  <ArgumentInput
                    label="lookup_value"
                    value={inputs.vlookupValue}
                    onChange={(e) => setInputs({ ...inputs, vlookupValue: e.target.value })}
                    highlight={activeArg === 'lookup_value'}
                    desc="Ketik ID Menu yang ingin dicari (Contoh: K01, K02). Mesin akan mencari ini di kolom pertama (ID)."
                    options={verticalData.slice(1).map(r => ({ label: r[0], value: r[0] }))}
                  />
                  <ArgumentInput
                    label="table_array"
                    value="A1:D5"
                    type="text"
                    highlight={activeArg === 'table_array'}
                    desc="Di tabel mana kita mencari data? (Blok tabel A1 sampai D5)."
                    onChange={() => { }}
                  />
                  <ArgumentInput
                    label="col_index_num"
                    value={inputs.vlookupCol}
                    onChange={(e) => setInputs({ ...inputs, vlookupCol: e.target.value })}
                    highlight={activeArg === 'col_index_num'}
                    desc="Hasil yang diinginkan ada di kolom ke berapa? Pilih Nama Kolom."
                    options={verticalData[0].map((col, idx) => ({ label: `${idx + 1} - ${col}`, value: idx + 1 }))}
                  />
                  <ArgumentInput
                    label="range_lookup"
                    value={inputs.vlookupRange}
                    onChange={(e) => setInputs({ ...inputs, vlookupRange: e.target.value })}
                    highlight={activeArg === 'range_lookup'}
                    desc="Apakah harus sama persis? Pilih FALSE untuk pencarian ID yang spesifik."
                    options={[{ label: "FALSE (Sama Persis)", value: "FALSE" }, { label: "TRUE (Mendekati)", value: "TRUE" }]}
                  />
                </>
              )}
              {activeTab === 'HLOOKUP' && (
                <>
                  <ArgumentInput
                    label="lookup_value"
                    value={inputs.hlookupValue}
                    onChange={(e) => setInputs({ ...inputs, hlookupValue: e.target.value })}
                    highlight={activeArg === 'lookup_value'}
                    desc="Pilih Bulan apa yang ingin dicari? (Contoh: Jan, Feb, Mar)."
                    options={horizontalData[0].slice(1).map(m => ({ label: m, value: m }))}
                  />
                  <ArgumentInput
                    label="table_array"
                    value="A10:E11"
                    type="text"
                    onChange={() => { }}
                    highlight={activeArg === 'table_array'}
                    desc="Tabel data horizontal (Baris 10 untuk Header, Baris 11 untuk Data)."
                  />
                  <ArgumentInput
                    label="row_index_num"
                    value={inputs.hlookupRow}
                    onChange={(e) => setInputs({ ...inputs, hlookupRow: e.target.value })}
                    highlight={activeArg === 'row_index_num'}
                    desc="Data yang mau diambil ada di baris ke berapa? (1:Bulan, 2:Omzet)."
                    type="number"
                    color="purple"
                  />
                  <ArgumentInput
                    label="range_lookup"
                    value={inputs.hlookupRange}
                    onChange={(e) => setInputs({ ...inputs, hlookupRange: e.target.value })}
                    highlight={activeArg === 'range_lookup'}
                    desc="TRUE (Mendekati) atau FALSE (Sama Persis)?"
                    options={[{ label: "FALSE (Sama Persis)", value: "FALSE" }, { label: "TRUE (Mendekati)", value: "TRUE" }]}
                  />
                </>
              )}
              {activeTab === 'MATCH' && (
                <>
                  <ArgumentInput
                    label="lookup_value"
                    value={inputs.matchValue}
                    onChange={(e) => setInputs({ ...inputs, matchValue: e.target.value })}
                    highlight={activeArg === 'lookup_value'}
                    desc="Benda/Teks apa yang ingin diketahui urutannya?"
                    options={getMatchOptions().map(opt => ({ label: opt, value: opt }))}
                  />
                  <ArgumentInput
                    label="lookup_array"
                    value={inputs.matchArray}
                    onChange={(e) => setInputs({ ...inputs, matchArray: e.target.value })}
                    highlight={activeArg === 'lookup_array'}
                    desc="Di daftar mana kita harus mencarinya? (Pilih kolom ID, Menu, atau Harga)."
                    options={[
                      { label: "A1:A5 (ID)", value: "A1:A5" },
                      { label: "B1:B5 (Menu)", value: "B1:B5" },
                      { label: "C1:C5 (Harga)", value: "C1:C5" }
                    ]}
                  />
                </>
              )}
              {activeTab === 'INDEX' && ( // Added missing UI for INDEX
                <>
                  <ArgumentInput label="row_num" value={inputs.indexRow} onChange={(e) => setInputs({ ...inputs, indexRow: e.target.value })} type="number" desc="Data yang dicari ada di baris ke berapa?" highlight={activeArg === 'array'} color="purple" />
                  <ArgumentInput label="column_num" value={inputs.indexCol} onChange={(e) => setInputs({ ...inputs, indexCol: e.target.value })} type="number" desc="Dan di kolom ke berapa? (Pertemuan baris & kolom adalah hasilnya)." highlight={activeArg === 'array'} color="purple" />
                </>
              )}
              {activeTab === 'CHOOSE' && (
                <ArgumentInput label="index_num" value={inputs.chooseIndex} onChange={e => setInputs({ ...inputs, chooseIndex: e.target.value })} type="number" desc="Mau pilih opsi urutan ke berapa? (Ketik 1, 2, atau 3)." highlight={activeArg === 'index_num'} color="purple" />
              )}
              {/* Fallback for others to simple inputs if needed or implement them all */}
              {activeTab === 'COUNTIF' && (
                <>
                  <ArgumentInput label="range" value="A2:A5 (Kategori)" desc="Di kolom mana kita mau menghitung datanya? (Kategori)." onChange={() => { }} highlight={false} />
                  <ArgumentInput label="criteria" value={inputs.countifCriteria} onChange={e => setInputs({ ...inputs, countifCriteria: e.target.value })} desc='Kategori apa yang mau dihitung? (Contoh: "Makanan").' highlight={false} />
                </>
              )}
              {activeTab === 'COUNTIFS' && (
                <>
                  <ArgumentInput label="criteria_range1" value="Kategori" desc="Syarat pertama dicek di kolom mana? (Kategori)." onChange={() => { }} highlight={false} />
                  <ArgumentInput label="criteria1" value={inputs.countifsCrit1} onChange={e => setInputs({ ...inputs, countifsCrit1: e.target.value })} desc='Apa syarat pertamanya? (Contoh: "Minuman").' highlight={false} />
                  <ArgumentInput label="criteria_range2" value="Terjual" desc="Syarat kedua dicek di kolom mana? (Terjual)." onChange={() => { }} highlight={false} />
                  <ArgumentInput label="criteria2" value={inputs.countifsCrit2} onChange={e => setInputs({ ...inputs, countifsCrit2: e.target.value })} desc='Apa syarat keduanya? (Contoh: ">20").' highlight={false} />
                </>
              )}
              {activeTab === 'SUMIF' && (
                <>
                  <ArgumentInput label="range" value="Kategori" desc="Kolom mana yang mau dicek syaratnya?" onChange={() => { }} highlight={false} />
                  <ArgumentInput label="criteria" value={inputs.sumifCriteria} onChange={e => setInputs({ ...inputs, sumifCriteria: e.target.value })} desc='Kategori apa? (Contoh: "Makanan").' highlight={false} />
                  <ArgumentInput label="sum_range" value="Omzet" desc="Kalau cocok, kolom mana yang harus dijumlahkan angkanya? (Omzet)." onChange={() => { }} highlight={false} />
                </>
              )}
              {activeTab === 'SUMIFS' && (
                <>
                  <ArgumentInput label="sum_range" value="Omzet" desc="Data mana yang mau dijumlahkan? (Kolom Omzet)." onChange={() => { }} highlight={false} />
                  <ArgumentInput label="criteria_range1" value="Kategori" desc="Syarat pertama dicek di kolom mana? (Kategori)." onChange={() => { }} highlight={false} />
                  <ArgumentInput label="criteria1" value={inputs.sumifsCrit1} onChange={e => setInputs({ ...inputs, sumifsCrit1: e.target.value })} desc='Apa syarat pertamanya? (Contoh: "Makanan").' highlight={false} />
                  <ArgumentInput label="criteria_range2" value="Terjual" desc="Syarat kedua dicek di kolom mana? (Terjual)." onChange={() => { }} highlight={false} />
                  <ArgumentInput label="criteria2" value={inputs.sumifsCrit2} onChange={e => setInputs({ ...inputs, sumifsCrit2: e.target.value })} desc='Apa syarat keduanya? (Contoh: ">20").' highlight={false} />
                </>
              )}

              {/* BOX TANTANGAN PRAKTIKUM */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 shadow-sm">
                  <h4 className="text-yellow-800 text-[11px] font-bold mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <Lightbulb size={16} className="text-yellow-600" /> Tantangan Praktikum
                  </h4>
                  <p className="text-[11px] text-yellow-700 leading-relaxed font-medium">
                    {getFormulaInfo().challenge}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetLab;

