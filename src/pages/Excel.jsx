import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Table, Grid, List, HelpCircle, ArrowRight, MousePointer2, Info,
  Settings2, Edit3, Lightbulb, Play, RotateCcw, ArrowUp, RotateCw,
  RotateCcw as RotateLeft, Repeat, Trash2, CheckCircle2, Flag, Bot,
  Trophy, Star, ChevronRight, Split, GitBranch, Layers, Zap, Target,
  Navigation, BookOpen, X, Sparkles, Cpu, Code2, AlertCircle, LayoutGrid, Home, Code, Menu, ChevronDown,
  Pause, FastForward, Gauge, Check, ChevronLeft
} from 'lucide-react';
import { markCompleted, isCompleted, getPreferences, savePreferences, incrementSimulationCount, getBreadcrumb, findModuleInfo, moduleGroups } from '../utils/progress';
import QuizMode, { excelQuizQuestions } from '../components/QuizMode';


// ============================================================
// MODUL 1: SPREADSHEET LAB (UI BARU & ANIMASI)
// ============================================================

const ArgumentInput = ({ label, value, onChange, options, type = "text", desc, highlight, color = "blue", compact = false }) => (
  <div className={`${compact ? 'mb-3' : 'mb-6'} transition-all duration-300 ${highlight ? 'transform scale-[1.02]' : ''}`}>
    <label className={`${compact ? 'text-[9px] mb-1.5' : 'text-[11px] mb-3'} font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1`}>
      {label}
      {type === 'number' ? <span className="text-purple-400">#</span> : <HelpCircle size={compact ? 8 : 10} className="text-blue-400" />}
    </label>
    <div className={`relative ${compact ? 'mb-1' : 'mb-3'}`}>
      {options ? (
        <div className="relative">
          <select
            value={value}
            onChange={onChange}
            className={`w-full ${compact ? 'pl-2.5 pr-7 py-1.5 text-xs rounded-lg' : 'pl-4 pr-10 py-3 text-sm rounded-xl'} bg-white border border-slate-200 font-bold text-slate-700 appearance-none outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono shadow-sm`}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className={`absolute ${compact ? 'right-2' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} size={compact ? 14 : 18} />
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full ${compact ? 'px-2.5 py-1.5 text-xs rounded-lg' : 'px-4 py-3 text-sm rounded-xl'} bg-white border border-slate-200 font-bold text-slate-700 font-mono focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm`}
        />
      )}
    </div>
    {desc && (
      <div className={`flex gap-2 ${compact ? 'pl-2 border-l-2' : 'pl-3 border-l-[3px]'} ${color === 'purple' ? 'border-purple-400' : 'border-blue-400'}`}>
        <p className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-slate-400 italic font-medium leading-relaxed`}>
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

  // Reset inputs when switching between Simple and Complex mode
  // This will be called after the state simulationMode is declared

  // Animation State
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSteps, setAnimationSteps] = useState([]);

  // Speed Control: 0.5 = slow, 1 = normal, 2 = fast
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const baseSpeed = 1500; // ms per step at 1x speed

  const [highlightedCells, setHighlightedCells] = useState([]);
  const [activeArg, setActiveArg] = useState(null); // Which argument is currently being processed
  const [result, setResult] = useState(null);
  const [tempResult, setTempResult] = useState(null); // Visual feedback during animation

  // Mode simulasi: 'simple' = 1 tabel, 'complex' = 2 tabel (tabel utama + referensi)
  const [simulationMode, setSimulationMode] = useState('simple');

  // Pause/Resume state
  const [isPaused, setIsPaused] = useState(false);

  // Input validation hints
  const [inputHint, setInputHint] = useState(null);

  // Progress Tracking
  const [completedFunctions, setCompletedFunctions] = useState([]);
  const [showNextModule, setShowNextModule] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const prefs = getPreferences('excel');
    if (prefs.animationSpeed) setAnimationSpeed(prefs.animationSpeed);
    if (prefs.simulationMode) setSimulationMode(prefs.simulationMode);

    // Load completed functions
    const functions = ['VLOOKUP', 'HLOOKUP', 'MATCH', 'INDEX', 'CHOOSE', 'COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'];
    const completed = functions.filter(f => isCompleted('excel', f));
    setCompletedFunctions(completed);
  }, []);

  // Save preferences when they change
  useEffect(() => {
    savePreferences('excel', { animationSpeed, simulationMode });
  }, [animationSpeed, simulationMode]);

  // Reset VLOOKUP/HLOOKUP inputs when mode changes
  useEffect(() => {
    if (simulationMode === 'simple') {
      setInputs(prev => ({
        ...prev,
        vlookupValue: 'K02', vlookupCol: '3', // K02 = Mie Ayam, Kolom 3 = Harga
        hlookupValue: 'Mar', hlookupRow: '2'  // Mar, Baris 2 = Omzet
      }));
    } else {
      // Simulasi 2: Gunakan alamat sel untuk lebih realistis
      setInputs(prev => ({
        ...prev,
        vlookupValue: 'C2', vlookupCol: '3', // C2 = sel Kode Menu baris pertama, Kolom 3 = Harga
        hlookupValue: 'C2', hlookupRow: '2'   // C2 = sel Golongan baris pertama, Baris 2 = Gaji Pokok
      }));
    }
  }, [simulationMode]);

  // Ref for auto-scroll to worksheet when animation starts
  const mobileWorksheetRef = useRef(null);

  // Navigation info
  const moduleInfo = findModuleInfo('/excel');
  const breadcrumb = getBreadcrumb('/excel', activeTab);

  // ============ DATA SIMULASI ============

  // === Mode SEDERHANA (1 tabel saja - mudah dipahami) ===
  // VLOOKUP sederhana: Daftar Menu Warung
  const simpleVlookupData = [
    ['ID', 'Menu', 'Harga', 'Stok'],
    ['K01', 'Nasi Goreng', '15000', '10'],
    ['K02', 'Mie Ayam', '12000', '15'],
    ['K03', 'Es Teh', '5000', '50'],
    ['K04', 'Soto Ayam', '13000', '8']
  ];

  // HLOOKUP sederhana: Omzet per Bulan
  const simpleHlookupData = [
    ['Bulan', 'Jan', 'Feb', 'Mar', 'Apr'],
    ['Omzet', '200k', '250k', '210k', '300k']
  ];

  // === Mode KOMPLEKS (2 tabel - lebih realistis) ===
  // VLOOKUP: Tabel Pesanan + Tabel Referensi Menu (Vertikal)
  const orderTable = [
    ['No', 'Pelanggan', 'Kode Menu', 'Qty', 'Harga', 'Total'],
    ['1', 'Budi', 'M02', '2', '?', '?'],
    ['2', 'Ani', 'M01', '1', '?', '?'],
    ['3', 'Dedi', 'M04', '3', '?', '?'],
    ['4', 'Sari', 'M03', '2', '?', '?']
  ];

  const menuRefTable = [
    ['Kode', 'Menu', 'Harga', 'Kategori'],
    ['M01', 'Nasi Goreng', '15000', 'Makanan'],
    ['M02', 'Mie Ayam', '12000', 'Makanan'],
    ['M03', 'Es Teh', '5000', 'Minuman'],
    ['M04', 'Soto Ayam', '13000', 'Makanan']
  ];

  // HLOOKUP: Tabel Gaji + Tabel Referensi Golongan (Horizontal)
  const employeeTable = [
    ['No', 'Nama', 'Golongan', 'Gaji Pokok', 'Tunjangan'],
    ['1', 'Widhi', '2B', '?', '?'],
    ['2', 'Bambang', '2C', '?', '?'],
    ['3', 'Santoso', '2A', '?', '?'],
    ['4', 'Sardi', '2D', '?', '?']
  ];

  const salaryRefTable = [
    ['Golongan', '2A', '2B', '2C', '2D'],
    ['Gaji Pokok', '750000', '1000000', '1200000', '1500000'],
    ['Tunjangan', '10%', '15%', '20%', '25%']
  ];

  // Data untuk fungsi lainnya
  const summaryData = [
    ['Kategori', 'Menu', 'Terjual', 'Omzet'],
    ['Makanan', 'Nasi Goreng', '25', '375000'],
    ['Minuman', 'Es Teh', '50', '250000'],
    ['Makanan', 'Mie Ayam', '20', '240000'],
    ['Minuman', 'Jus Jeruk', '30', '300000']
  ];

  const referenceData = simpleVlookupData; // Alias untuk kompatibilitas

  // Pilih data berdasarkan tab aktif DAN mode simulasi
  const verticalData = activeTab === 'VLOOKUP'
    ? (simulationMode === 'complex' ? menuRefTable : simpleVlookupData)
    : ['COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'].includes(activeTab)
      ? summaryData
      : referenceData;

  const horizontalData = activeTab === 'HLOOKUP'
    ? (simulationMode === 'complex' ? salaryRefTable : simpleHlookupData)
    : simpleHlookupData;

  const chooseData = [['Diskon 5%', 'Diskon 10%', 'Diskon 15%']];

  const [inputs, setInputs] = useState({
    vlookupValue: 'M02', vlookupCol: '3', vlookupRange: 'FALSE', // Cari harga berdasarkan kode menu
    hlookupValue: '2B', hlookupRow: '2', hlookupRange: 'FALSE', // Cari gaji berdasarkan golongan
    matchValue: 'Mie Ayam', matchArray: 'B1:B5', matchType: '0',
    indexRow: '3', indexCol: '2',
    chooseIndex: '1',
    countifCriteria: 'Makanan',
    sumifCriteria: 'Makanan',
    countifsCrit1: 'Minuman', countifsCrit2: '>20',
    sumifsCrit1: 'Makanan', sumifsCrit2: '>20'
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
        // Pilih data berdasarkan mode
        const lookupData = simulationMode === 'complex' ? menuRefTable : simpleVlookupData;

        // Untuk Simulasi 2, resolve alamat sel ke nilai aktual
        let lookupValue = inputs.vlookupValue;
        let cellAddress = null;

        if (simulationMode === 'complex' && inputs.vlookupValue.match(/^C[2-5]$/)) {
          cellAddress = inputs.vlookupValue;
          const rowNum = parseInt(inputs.vlookupValue.charAt(1)) - 1; // C2 -> row 1 (index 1 in orderTable)
          lookupValue = orderTable[rowNum][2]; // Kolom C = index 2 (Kode Menu)
        }

        const modeLabel = simulationMode === 'complex' ? 'kode menu' : 'ID';

        // STEP 1: Identifikasi Lookup Value
        if (cellAddress) {
          steps.push({
            desc: `Sel ${cellAddress} berisi "${lookupValue}". Mencari di Tabel Referensi...`,
            highlight: [],
            arg: 'lookup_value',
            res: lookupValue
          });
        } else {
          steps.push({
            desc: `Mencari ${modeLabel} "${lookupValue}"...`,
            highlight: [],
            arg: 'lookup_value',
            res: '...'
          });
        }

        // STEP 2: Scan Kolom Pertama
        const rowIndex = lookupData.findIndex(row => row[0] === lookupValue);
        steps.push({
          desc: `Memindai kolom pertama (A) di Tabel Referensi...`,
          highlight: lookupData.slice(1).map((_, i) => `v-r${i + 1}-c0`),
          arg: 'table_array',
          res: '...'
        });

        if (rowIndex !== -1) {
          // STEP 3: Ketemu
          const rowLabel = simulationMode === 'complex' ? rowIndex + 10 : rowIndex + 1;
          steps.push({
            desc: `Ditemukan "${lookupValue}" pada Baris ${rowLabel}.`,
            highlight: [`v-r${rowIndex}-c0`],
            arg: 'table_array',
            res: 'Found'
          });

          // STEP 4: Geser ke Kolom
          const colIdx = parseInt(inputs.vlookupCol);
          if (colIdx >= 1 && colIdx <= 4) {
            steps.push({
              desc: `Mengambil data kolom ke-${colIdx} (${lookupData[0][colIdx - 1]})...`,
              highlight: [`v-r${rowIndex}-c0`, `v-r${rowIndex}-c${colIdx - 1}`],
              arg: 'col_index_num',
              res: lookupData[rowIndex][colIdx - 1]
            });
            finalRes = lookupData[rowIndex][colIdx - 1];
          } else {
            finalRes = "#REF!";
            steps.push({ desc: "Kolom tidak valid!", highlight: [], arg: 'col_index_num', res: "#REF!" });
          }
        } else {
          finalRes = "#N/A";
          steps.push({ desc: `${modeLabel} tidak ditemukan.`, highlight: [], arg: 'range_lookup', res: "#N/A" });
        }
      }
      else if (activeTab === 'HLOOKUP') {
        // Pilih data berdasarkan mode
        const lookupData = simulationMode === 'complex' ? salaryRefTable : simpleHlookupData;

        // Untuk Simulasi 2, resolve alamat sel ke nilai aktual
        let lookupValue = inputs.hlookupValue;
        let cellAddress = null;

        if (simulationMode === 'complex' && inputs.hlookupValue.match(/^C[2-5]$/)) {
          cellAddress = inputs.hlookupValue;
          const rowNum = parseInt(inputs.hlookupValue.charAt(1)) - 1; // C2 -> row 1 (index 1 in employeeTable)
          lookupValue = employeeTable[rowNum][2]; // Kolom C = index 2 (Golongan)
        }

        const modeLabel = simulationMode === 'complex' ? 'golongan' : 'bulan';

        // STEP 1: Mencari nilai
        if (cellAddress) {
          steps.push({ desc: `Sel ${cellAddress} berisi "${lookupValue}". Mencari di Tabel Referensi...`, highlight: [], arg: 'lookup_value', res: lookupValue });
        } else {
          steps.push({ desc: `Mencari ${modeLabel} "${lookupValue}" di baris Header...`, highlight: [], arg: 'lookup_value', res: '...' });
        }

        // STEP 2: Scan baris Header
        const colIndex = lookupData[0].findIndex(col => col === lookupValue);
        steps.push({
          desc: `Memindai ${modeLabel} di Tabel Referensi...`,
          highlight: lookupData[0].slice(1).map((_, i) => `h-r0-c${i + 1}`),
          arg: 'table_array',
          res: '...'
        });

        if (colIndex !== -1) {
          // STEP 3: Ketemu
          steps.push({ desc: `Ditemukan ${modeLabel} ${lookupValue} di Kolom ${colIndex}.`, highlight: [`h-r0-c${colIndex}`], arg: 'table_array', res: 'Found' });

          // STEP 4: Ambil data dari baris
          const rowIdx = parseInt(inputs.hlookupRow);
          const maxRows = lookupData.length;
          if (rowIdx >= 1 && rowIdx <= maxRows) {
            const rowLabel = simulationMode === 'complex'
              ? (rowIdx === 2 ? 'Gaji Pokok' : rowIdx === 3 ? 'Tunjangan' : 'Golongan')
              : (rowIdx === 2 ? 'Omzet' : 'Bulan');
            steps.push({
              desc: `Mengambil data baris ke-${rowIdx} (${rowLabel})...`,
              highlight: [`h-r0-c${colIndex}`, `h-r${rowIdx - 1}-c${colIndex}`],
              arg: 'row_index_num',
              res: lookupData[rowIdx - 1][colIndex]
            });
            finalRes = lookupData[rowIdx - 1][colIndex];
          } else {
            finalRes = "#REF!";
            steps.push({ desc: "Index Baris Invalid", highlight: [], arg: 'row_index_num', res: "#REF!" });
          }
        } else {
          finalRes = "#N/A";
          steps.push({ desc: `${modeLabel} tidak ditemukan`, highlight: [], arg: 'range_lookup', res: "#N/A" });
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
    // Clear previous hints
    setInputHint(null);

    // Validate inputs for current function
    let validationError = null;

    if (activeTab === 'VLOOKUP') {
      const colNum = parseInt(inputs.vlookupCol);
      if (colNum > 4 || colNum < 1) {
        validationError = `col_index_num harus antara 1-4. Anda memasukkan ${colNum}.`;
      }
      if (!inputs.vlookupValue || inputs.vlookupValue.trim() === '') {
        validationError = 'lookup_value tidak boleh kosong!';
      }
    }

    if (activeTab === 'HLOOKUP') {
      const rowNum = parseInt(inputs.hlookupRow);
      if (rowNum > 3 || rowNum < 1) {
        validationError = `row_index_num harus antara 1-3. Anda memasukkan ${rowNum}.`;
      }
    }

    if (activeTab === 'INDEX') {
      const rowNum = parseInt(inputs.indexRow);
      const colNum = parseInt(inputs.indexCol);
      if (rowNum > 5 || rowNum < 1) {
        validationError = `row_num harus antara 1-5. Anda memasukkan ${rowNum}.`;
      }
      if (colNum > 4 || colNum < 1) {
        validationError = `col_num harus antara 1-4. Anda memasukkan ${colNum}.`;
      }
    }

    if (activeTab === 'CHOOSE') {
      const idx = parseInt(inputs.chooseIndex);
      if (idx > 3 || idx < 1) {
        validationError = `index_num harus 1, 2, atau 3. Anda memasukkan ${idx}.`;
      }
    }

    // Show hint if validation error
    if (validationError) {
      setInputHint(validationError);
      return; // Don't start animation if there's an error
    }

    const { steps, finalRes } = generateSteps();

    // Check if result is an error
    if (finalRes === '#N/A' || finalRes === '#ERROR' || finalRes === '#REF!') {
      setInputHint(`Hasil ${finalRes}: Nilai tidak ditemukan di tabel. Coba pilih nilai lain.`);
    }

    setAnimationSteps(steps);
    setResult(finalRes);
    setTempResult("...");
    setCurrentStep(0);
    setIsAnimating(true);
    setIsPaused(false);

    // Auto-scroll to worksheet on mobile so students can see the animation
    if (mobileWorksheetRef.current) {
      setTimeout(() => {
        mobileWorksheetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  useEffect(() => {
    // Auto-update result when inputs change (Instant Mode) 
    // Highlight only appears after clicking Simulasi button
    if (!isAnimating) {
      const { steps, finalRes } = generateSteps();
      setResult(finalRes);
      setTempResult(finalRes);
      // Clear highlights when inputs change - only show during simulation
      setHighlightedCells([]);
    }
  }, [inputs, activeTab]);

  useEffect(() => {
    let timer;
    if (isAnimating && !isPaused) {
      if (currentStep < animationSteps.length) {
        // Use animationSpeed to control timing
        const delay = baseSpeed / animationSpeed;
        timer = setTimeout(() => {
          const stepData = animationSteps[currentStep];
          setHighlightedCells(stepData.highlight);
          setActiveArg(stepData.arg);
          setTempResult(stepData.res);
          setCurrentStep(prev => prev + 1);
        }, delay);
      } else {
        // Animation completed
        setIsAnimating(false);
        setIsPaused(false);
        setActiveArg(null);

        // Mark function as completed and track progress
        markCompleted('excel', activeTab);
        incrementSimulationCount('excel');
        setCompletedFunctions(prev =>
          prev.includes(activeTab) ? prev : [...prev, activeTab]
        );

        // Show next module suggestion if all functions completed
        const allFunctions = ['VLOOKUP', 'HLOOKUP', 'MATCH', 'INDEX', 'CHOOSE', 'COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'];
        const nowCompleted = [...completedFunctions, activeTab];
        if (allFunctions.every(f => nowCompleted.includes(f))) {
          setShowNextModule(true);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isAnimating, isPaused, currentStep, animationSteps, animationSpeed]);

  // Reset animation function
  const resetAnimation = () => {
    setIsAnimating(false);
    setIsPaused(false);
    setCurrentStep(0);
    setHighlightedCells([]);
    setActiveArg(null);
    setTempResult(null);
    setInputHint(null);
  };

  // Toggle pause/resume
  const togglePause = () => {
    if (isAnimating) {
      setIsPaused(prev => !prev);
    }
  };


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

      {/* Speed Control & Progress Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Current Function Label */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-green-100 border border-green-200 rounded-lg">
            <span className="text-xs font-bold text-green-700">{activeTab}</span>
          </div>
          {completedFunctions.includes(activeTab) && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Check size={14} />
              <span className="hidden sm:inline">Selesai</span>
            </div>
          )}
        </div>

        {/* Speed Control + Progress */}
        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Trophy size={12} className="text-amber-500" />
            <span>{completedFunctions.length}/9</span>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <Gauge size={14} className="text-slate-400 ml-1.5" />
            {[0.5, 1, 2].map(speed => (
              <button
                key={speed}
                onClick={() => setAnimationSpeed(speed)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${animationSpeed === speed
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200'
                  }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE-FIRST LAYOUT: Hasil, Kontrol, lalu Worksheet */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8 pb-10">

        {/* ===== MOBILE: RESULT OUTPUT (Sticky on top for mobile) ===== */}
        <div className="lg:hidden sticky top-0 z-20 -mx-4 px-4 py-3 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
          <div className="bg-white rounded-xl shadow-md border-t-4 border-green-500 overflow-hidden text-center relative transition-all">
            {/* Progress Bar */}
            {isAnimating && (
              <div className="h-1 bg-slate-100 w-full absolute top-0 left-0">
                <div className="h-full bg-green-500 transition-all duration-300 ease-linear" style={{ width: `${((currentStep) / animationSteps.length) * 100}%` }}></div>
              </div>
            )}

            <div className="bg-slate-900 px-3 py-2 flex flex-col gap-1 overflow-x-auto border-b border-slate-800 text-left">
              <div className="flex items-center gap-2">
                <span className="italic font-serif text-green-400 font-bold text-base">fx</span>
                <div className="font-mono text-xs text-slate-300 whitespace-nowrap">
                  {activeTab === 'VLOOKUP' && (simulationMode === 'complex'
                    ? `=VLOOKUP(${inputs.vlookupValue}; $A$10:$D$14; ${inputs.vlookupCol}; ${inputs.vlookupRange})`
                    : `=VLOOKUP("${inputs.vlookupValue}"; A1:D5; ${inputs.vlookupCol}; ${inputs.vlookupRange})`)}
                  {activeTab === 'HLOOKUP' && (simulationMode === 'complex'
                    ? `=HLOOKUP(${inputs.hlookupValue}; $A$10:$E$12; ${inputs.hlookupRow}; ${inputs.hlookupRange})`
                    : `=HLOOKUP("${inputs.hlookupValue}"; A1:E2; ${inputs.hlookupRow}; ${inputs.hlookupRange})`)}
                  {activeTab === 'MATCH' && `=MATCH("${inputs.matchValue}"; ${inputs.matchArray}; 0)`}
                  {activeTab === 'INDEX' && `=INDEX(A1:D5; ${inputs.indexRow}; ${inputs.indexCol})`}
                  {activeTab === 'CHOOSE' && `=CHOOSE(${inputs.chooseIndex}; "Diskon 5%"; "Diskon 10%"; "Diskon 15%")`}
                  {activeTab === 'COUNTIF' && `=COUNTIF(Kategori; "${inputs.countifCriteria}")`}
                  {activeTab === 'SUMIF' && `=SUMIF(Kategori; "${inputs.sumifCriteria}"; Omzet)`}
                  {activeTab === 'COUNTIFS' && `=COUNTIFS(Kategori; "${inputs.countifsCrit1}"; Terjual; "${inputs.countifsCrit2}")`}
                  {activeTab === 'SUMIFS' && `=SUMIFS(Omzet; Kategori; "${inputs.sumifsCrit1}"; Terjual; "${inputs.sumifsCrit2}")`}
                </div>
              </div>
              {/* Konteks formula untuk Simulasi 2 */}
              {simulationMode === 'complex' && (activeTab === 'VLOOKUP' || activeTab === 'HLOOKUP') && (
                <div className="text-[9px] text-slate-400 italic ml-6">
                  {activeTab === 'VLOOKUP' && inputs.vlookupValue.match(/^C[2-5]$/) && (() => {
                    const rowIdx = inputs.vlookupValue.charAt(1); // "2", "3", etc.
                    const rowNum = parseInt(rowIdx) - 1;
                    const pelanggan = orderTable[rowNum]?.[1] || '';
                    const kodeMenu = orderTable[rowNum]?.[2] || '';
                    // Kolom E = Harga (index 4), kolom F = Total (index 5) di Tabel Pesanan
                    const kolomTujuan = inputs.vlookupCol === '3' ? `E${rowIdx}` : inputs.vlookupCol === '4' ? 'Kategori' : inputs.vlookupCol === '2' ? 'Menu' : 'Kode';
                    const namaKolom = inputs.vlookupCol === '3' ? 'Harga' : inputs.vlookupCol === '4' ? 'Kategori' : inputs.vlookupCol === '2' ? 'Nama Menu' : 'Kode';
                    return `→ Mengisi kolom ${namaKolom} (${kolomTujuan}) di Tabel Pesanan untuk ${pelanggan}, cari ${kodeMenu} di Tabel Referensi`;
                  })()}
                  {activeTab === 'HLOOKUP' && inputs.hlookupValue.match(/^C[2-5]$/) && (() => {
                    const rowIdx = inputs.hlookupValue.charAt(1);
                    const rowNum = parseInt(rowIdx) - 1;
                    const nama = employeeTable[rowNum]?.[1] || '';
                    const golongan = employeeTable[rowNum]?.[2] || '';
                    // Kolom D = Gaji Pokok, kolom E = Tunjangan di Tabel Karyawan
                    const kolomTujuan = inputs.hlookupRow === '2' ? `D${rowIdx}` : `E${rowIdx}`;
                    const namaKolom = inputs.hlookupRow === '2' ? 'Gaji Pokok' : 'Tunjangan';
                    return `→ Mengisi kolom ${namaKolom} (${kolomTujuan}) di Tabel Karyawan untuk ${nama}, cari golongan ${golongan} di Tabel Referensi`;
                  })()}
                </div>
              )}
            </div>
            <div className="p-4 bg-green-50/20 flex flex-col items-center justify-center min-h-[80px]">
              {isAnimating ? (
                <div className="space-y-1 animate-in fade-in zoom-in duration-300">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Kalkulasi</span>
                  <div className="text-sm font-medium text-slate-600">
                    {animationSteps[currentStep]?.desc || "Memulai..."}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Val: {tempResult}
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest block mb-1">Output</span>
                  <div className="text-4xl font-mono font-black text-slate-900 drop-shadow-sm">{result}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== MOBILE: CONTROLS FIRST ===== */}
        <div className="lg:hidden space-y-4">
          {/* Formula Info - Compact for Mobile */}
          <div className="bg-green-600 text-white p-4 rounded-xl shadow-md border-b-4 border-green-700">
            <h2 className="flex items-center gap-2 font-bold text-base mb-1"><BookOpen className="w-4 h-4 text-green-200" /> {getFormulaInfo().title}</h2>
            <p className="text-xs opacity-90 leading-relaxed">{getFormulaInfo().desc}</p>
          </div>

          {/* Tab Selector - Mobile Optimized */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[9px] font-bold text-slate-300 uppercase mb-2 block tracking-widest">Lookup & Reference</span>
                <div className="flex gap-1.5 flex-wrap">
                  {tabs.slice(0, 5).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} disabled={isAnimating} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1 ${activeTab === tab ? 'bg-green-600 border-green-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'}`}>
                      {completedFunctions.includes(tab) && <Check size={10} className={activeTab === tab ? 'text-white' : 'text-green-500'} />}
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-300 uppercase mb-2 block tracking-widest">Statistical</span>
                <div className="flex gap-1.5 flex-wrap">
                  {tabs.slice(5).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} disabled={isAnimating} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1 ${activeTab === tab ? 'bg-green-600 border-green-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'}`}>
                      {completedFunctions.includes(tab) && <Check size={10} className={activeTab === tab ? 'text-white' : 'text-green-500'} />}
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Arguments Input - Mobile */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1.5 tracking-widest">
                <span className="text-slate-300">▼</span> INPUT ARGUMEN
              </h3>
              <div className="flex items-center gap-2">
                {/* Reset Button - Only show when animating or has result */}
                {(isAnimating || currentStep > 0) && (
                  <button
                    onClick={resetAnimation}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                    title="Reset simulasi"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}

                {/* Pause/Resume Button - Only show when animating */}
                {isAnimating && (
                  <button
                    onClick={togglePause}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isPaused
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    title={isPaused ? 'Lanjutkan' : 'Pause'}
                  >
                    {isPaused ? <Play size={12} /> : <Pause size={12} />}
                  </button>
                )}

                {/* Start Simulation Button */}
                <button
                  onClick={startAnimation}
                  disabled={isAnimating}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isAnimating
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    }`}
                >
                  {isAnimating ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      {isPaused ? 'Paused' : `Step ${currentStep}/${animationSteps.length}`}
                    </>
                  ) : (
                    <>
                      <Play size={12} />
                      Simulasi
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Toggle Mode untuk VLOOKUP/HLOOKUP */}
            {(activeTab === 'VLOOKUP' || activeTab === 'HLOOKUP') && (
              <div className="flex items-center justify-between mb-3 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Mode:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSimulationMode('simple')}
                    className={`px-2.5 py-1 rounded text-[9px] font-bold transition-all ${simulationMode === 'simple' ? 'bg-green-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                  >
                    Simulasi 1
                  </button>
                  <button
                    onClick={() => setSimulationMode('complex')}
                    className={`px-2.5 py-1 rounded text-[9px] font-bold transition-all ${simulationMode === 'complex' ? 'bg-purple-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                  >
                    Simulasi 2
                  </button>
                </div>
              </div>
            )}

            {/* Hint untuk siswa - bisa warning atau informasi */}
            {inputHint ? (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200 animate-pulse">
                <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                <p className="text-[10px] text-amber-700 font-medium">
                  <span className="font-bold">Perhatian:</span> {inputHint}
                </p>
                <button onClick={() => setInputHint(null)} className="ml-auto text-amber-400 hover:text-amber-600">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Edit3 size={14} className="text-blue-500 flex-shrink-0" />
                <p className="text-[10px] text-blue-700 font-medium">
                  <span className="font-bold">Coba ubah nilai!</span> Klik dropdown di bawah untuk mengubah parameter dan lihat hasilnya.
                </p>
              </div>
            )}

            <div className="space-y-1">
              {activeTab === 'VLOOKUP' && (
                <>
                  <ArgumentInput compact label="lookup_value"
                    desc={simulationMode === 'complex'
                      ? "Alamat sel Kode Menu di Tabel Pesanan → nilai di sel ini dicari di Tabel Referensi"
                      : "Nilai yang dicari di kolom pertama tabel"}
                    value={inputs.vlookupValue} onChange={(e) => setInputs({ ...inputs, vlookupValue: e.target.value })} highlight={activeArg === 'lookup_value'}
                    options={simulationMode === 'complex'
                      ? [{ label: "C2 → M02 (Budi)", value: "C2" }, { label: "C3 → M01 (Ani)", value: "C3" }, { label: "C4 → M04 (Dedi)", value: "C4" }, { label: "C5 → M03 (Sari)", value: "C5" }]
                      : verticalData.slice(1).map(r => ({ label: `${r[0]} - ${r[1]}`, value: r[0] }))} />
                  <ArgumentInput compact label="table_array"
                    desc={simulationMode === 'complex'
                      ? "Tabel Referensi Menu dengan $ (absolute) agar tidak bergeser saat copy"
                      : "Rentang tabel untuk pencarian"}
                    value={simulationMode === 'complex' ? "$A$10:$D$14" : "A1:D5"} onChange={() => { }} highlight={activeArg === 'table_array'} />
                  <ArgumentInput compact label="col_index_num"
                    desc={simulationMode === 'complex'
                      ? "Kolom dari Tabel Referensi yang diambil (misal: 3=Harga)"
                      : "Nomor kolom yang diambil datanya"}
                    value={inputs.vlookupCol} onChange={(e) => setInputs({ ...inputs, vlookupCol: e.target.value })} highlight={activeArg === 'col_index_num'} options={verticalData[0].map((col, idx) => ({ label: `${idx + 1} - ${col}`, value: idx + 1 }))} color="purple" />
                  <ArgumentInput compact label="range_lookup" desc="FALSE = harus sama persis" value={inputs.vlookupRange} onChange={(e) => setInputs({ ...inputs, vlookupRange: e.target.value })} highlight={activeArg === 'range_lookup'} options={[{ label: "FALSE", value: "FALSE" }, { label: "TRUE", value: "TRUE" }]} />
                </>
              )}
              {activeTab === 'HLOOKUP' && (
                <>
                  <ArgumentInput compact label="lookup_value"
                    desc={simulationMode === 'complex'
                      ? "Alamat sel Golongan di Tabel Karyawan → nilai di sel ini dicari di Tabel Referensi"
                      : "Nilai yang dicari di baris pertama tabel"}
                    value={inputs.hlookupValue} onChange={(e) => setInputs({ ...inputs, hlookupValue: e.target.value })} highlight={activeArg === 'lookup_value'}
                    options={simulationMode === 'complex'
                      ? [{ label: "C2 → 2B (Widhi)", value: "C2" }, { label: "C3 → 2C (Bambang)", value: "C3" }, { label: "C4 → 2A (Santoso)", value: "C4" }, { label: "C5 → 2D (Sardi)", value: "C5" }]
                      : horizontalData[0].slice(1).map(val => ({ label: val, value: val }))} />
                  <ArgumentInput compact label="table_array"
                    desc={simulationMode === 'complex'
                      ? "Tabel Referensi Golongan dengan $ (absolute) agar tidak bergeser saat copy"
                      : "Rentang tabel untuk pencarian"}
                    value={simulationMode === 'complex' ? "$A$10:$E$12" : "A1:E2"} onChange={() => { }} highlight={activeArg === 'table_array'} />
                  <ArgumentInput compact label="row_index_num"
                    desc={simulationMode === 'complex'
                      ? "Baris dari Tabel Referensi yang diambil"
                      : "Nomor baris yang diambil datanya"}
                    value={inputs.hlookupRow} onChange={(e) => setInputs({ ...inputs, hlookupRow: e.target.value })} highlight={activeArg === 'row_index_num'} options={simulationMode === 'complex' ? [{ label: "2 - Gaji Pokok", value: "2" }, { label: "3 - Tunjangan", value: "3" }] : [{ label: "2 - Omzet", value: "2" }]} color="purple" />
                  <ArgumentInput compact label="range_lookup" desc="FALSE = harus sama persis" value={inputs.hlookupRange} onChange={(e) => setInputs({ ...inputs, hlookupRange: e.target.value })} highlight={activeArg === 'range_lookup'} options={[{ label: "FALSE", value: "FALSE" }, { label: "TRUE", value: "TRUE" }]} />
                </>
              )}
              {activeTab === 'MATCH' && (
                <>
                  <ArgumentInput compact label="lookup_value" desc="Nilai yang dicari posisinya" value={inputs.matchValue} onChange={(e) => setInputs({ ...inputs, matchValue: e.target.value })} highlight={activeArg === 'lookup_value'} options={getMatchOptions().map(opt => ({ label: opt, value: opt }))} />
                  <ArgumentInput compact label="lookup_array" desc="Rentang sel untuk pencarian" value={inputs.matchArray} onChange={(e) => setInputs({ ...inputs, matchArray: e.target.value })} highlight={activeArg === 'lookup_array'} options={[{ label: "A1:A5 (ID)", value: "A1:A5" }, { label: "B1:B5 (Menu)", value: "B1:B5" }, { label: "C1:C5 (Harga)", value: "C1:C5" }]} />
                  <ArgumentInput compact label="match_type" desc="0=sama persis, 1=≤, -1=≥" value={inputs.matchType} onChange={(e) => setInputs({ ...inputs, matchType: e.target.value })} highlight={activeArg === 'match_type'} options={[{ label: "0 (Sama Persis)", value: "0" }, { label: "1 (≤ terdekat)", value: "1" }, { label: "-1 (≥ terdekat)", value: "-1" }]} color="purple" />
                </>
              )}
              {activeTab === 'INDEX' && (
                <>
                  <ArgumentInput compact label="array" desc="Rentang data yang diambil" value="A1:D5" onChange={() => { }} highlight={activeArg === 'array'} />
                  <ArgumentInput compact label="row_num" desc="Nomor baris yang diambil" value={inputs.indexRow} onChange={(e) => setInputs({ ...inputs, indexRow: e.target.value })} type="number" highlight={activeArg === 'array'} color="purple" />
                  <ArgumentInput compact label="column_num" desc="Nomor kolom yang diambil" value={inputs.indexCol} onChange={(e) => setInputs({ ...inputs, indexCol: e.target.value })} type="number" highlight={activeArg === 'array'} color="purple" />
                </>
              )}
              {activeTab === 'CHOOSE' && (
                <>
                  <ArgumentInput compact label="index_num" desc="Nomor urut nilai yang dipilih" value={inputs.chooseIndex} onChange={e => setInputs({ ...inputs, chooseIndex: e.target.value })} type="number" highlight={activeArg === 'index_num'} color="purple" />
                  <ArgumentInput compact label="value1" desc="Pilihan pertama" value="Diskon 5%" onChange={() => { }} highlight={false} />
                  <ArgumentInput compact label="value2" desc="Pilihan kedua" value="Diskon 10%" onChange={() => { }} highlight={false} />
                  <ArgumentInput compact label="value3" desc="Pilihan ketiga" value="Diskon 15%" onChange={() => { }} highlight={false} />
                </>
              )}
              {activeTab === 'COUNTIF' && (
                <>
                  <ArgumentInput compact label="range" desc="Rentang sel yang dihitung" value="A2:A5 (Kategori)" onChange={() => { }} highlight={false} />
                  <ArgumentInput compact label="criteria" desc="Kriteria yang harus dipenuhi" value={inputs.countifCriteria} onChange={e => setInputs({ ...inputs, countifCriteria: e.target.value })} highlight={false} />
                </>
              )}
              {activeTab === 'COUNTIFS' && (
                <>
                  <ArgumentInput compact label="criteria_range1" desc="Rentang kriteria pertama" value="Kategori" onChange={() => { }} highlight={false} />
                  <ArgumentInput compact label="criteria1" desc="Kriteria pertama" value={inputs.countifsCrit1} onChange={e => setInputs({ ...inputs, countifsCrit1: e.target.value })} highlight={false} />
                  <ArgumentInput compact label="criteria_range2" desc="Rentang kriteria kedua" value="Terjual" onChange={() => { }} highlight={false} />
                  <ArgumentInput compact label="criteria2" desc="Kriteria kedua" value={inputs.countifsCrit2} onChange={e => setInputs({ ...inputs, countifsCrit2: e.target.value })} highlight={false} />
                </>
              )}
              {activeTab === 'SUMIF' && (
                <>
                  <ArgumentInput compact label="range" desc="Rentang sel untuk kriteria" value="Kategori" onChange={() => { }} highlight={false} />
                  <ArgumentInput compact label="criteria" desc="Kriteria yang harus dipenuhi" value={inputs.sumifCriteria} onChange={e => setInputs({ ...inputs, sumifCriteria: e.target.value })} highlight={false} />
                  <ArgumentInput compact label="sum_range" desc="Rentang sel yang dijumlahkan" value="Omzet" onChange={() => { }} highlight={false} />
                </>
              )}
              {activeTab === 'SUMIFS' && (
                <>
                  <ArgumentInput compact label="sum_range" desc="Rentang sel yang dijumlahkan" value="Omzet" onChange={() => { }} highlight={false} />
                  <ArgumentInput compact label="criteria_range1" desc="Rentang kriteria pertama" value="Kategori" onChange={() => { }} highlight={false} />
                  <ArgumentInput compact label="criteria1" desc="Kriteria pertama" value={inputs.sumifsCrit1} onChange={e => setInputs({ ...inputs, sumifsCrit1: e.target.value })} highlight={false} />
                  <ArgumentInput compact label="criteria_range2" desc="Rentang kriteria kedua" value="Terjual" onChange={() => { }} highlight={false} />
                  <ArgumentInput compact label="criteria2" desc="Kriteria kedua" value={inputs.sumifsCrit2} onChange={e => setInputs({ ...inputs, sumifsCrit2: e.target.value })} highlight={false} />
                </>
              )}
            </div>

            {/* Tantangan - Collapsed on Mobile */}
            <details className="mt-4 pt-3 border-t border-slate-100">
              <summary className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider cursor-pointer flex items-center gap-1.5">
                <Lightbulb size={12} className="text-yellow-600" /> Tantangan Praktikum
              </summary>
              <p className="text-[10px] text-yellow-700 leading-relaxed mt-2 pl-4 border-l-2 border-yellow-200">
                {getFormulaInfo().challenge}
              </p>
            </details>
          </div>
        </div>

        {/* ===== MOBILE: WORKSHEET VIEW (Last) ===== */}
        <div className="lg:hidden space-y-4" ref={mobileWorksheetRef}>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Grid size={12} /> Worksheet</h2>

            {/* VLOOKUP: Tampilan berdasarkan mode */}
            {activeTab === 'VLOOKUP' && (
              <>
                {/* Mode KOMPLEKS: 2 Tabel */}
                {simulationMode === 'complex' && (
                  <>
                    {/* Tabel Utama: Pesanan */}
                    <div className="mb-4">
                      <p className="text-[9px] font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                        <Table size={10} /> Tabel Pesanan (Data Utama)
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-blue-200 shadow-sm -mx-2">
                        <table className="w-full border-collapse text-[10px] text-center">
                          <thead>
                            <tr className="bg-blue-50 text-blue-600">
                              <th className="border border-blue-200 p-1 w-5 text-[8px] font-bold"></th>
                              {['A', 'B', 'C', 'D', 'E', 'F'].map(l => <th key={l} className="border border-blue-200 p-1 font-bold text-[9px]">{l}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {orderTable.map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td className="border border-blue-200 p-1 text-[8px] bg-blue-50 font-bold text-blue-400">{rIdx + 1}</td>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className={`border border-blue-200 p-1 transition-all ${rIdx === 0 ? 'bg-blue-100 font-bold text-blue-700' : 'bg-white'} ${cell === '?' ? 'text-orange-500 font-bold' : ''}`}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Tabel Referensi: Menu */}
                    <div>
                      <p className="text-[9px] font-bold text-green-600 uppercase mb-2 flex items-center gap-1">
                        <List size={10} /> Tabel Referensi Menu (VLOOKUP mencari di sini)
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-green-200 shadow-sm -mx-2">
                        <table className="w-full border-collapse text-[10px] text-center">
                          <thead>
                            <tr className="bg-green-50 text-green-600">
                              <th className="border border-green-200 p-1 w-5 text-[8px] font-bold"></th>
                              {['A', 'B', 'C', 'D'].map(l => <th key={l} className="border border-green-200 p-1 font-bold text-[9px]">{l}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {menuRefTable.map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td className="border border-green-200 p-1 text-[8px] bg-green-50 font-bold text-green-400">{rIdx + 10}</td>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className={`border border-green-200 p-1 transition-all duration-300 ${highlightedCells.includes(`v-r${rIdx}-c${cIdx}`) ? 'bg-yellow-100 font-bold text-yellow-900' : (rIdx === 0 ? 'bg-green-100 font-bold text-green-700' : 'bg-white')}`}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* Mode SEDERHANA: 1 Tabel saja */}
                {simulationMode === 'simple' && (
                  <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm relative -mx-2">
                    <div className="absolute top-0 right-0 bg-green-100 text-[8px] text-green-600 px-1.5 py-0.5 rounded-bl-lg font-bold uppercase">
                      Daftar Menu
                    </div>
                    <table className="w-full border-collapse text-xs text-center mt-4">
                      <thead>
                        <tr className="bg-slate-100 text-slate-500">
                          <th className="border border-slate-200 p-1 w-6 text-[9px] bg-slate-50 font-bold"></th>
                          {['A', 'B', 'C', 'D'].map(l => <th key={l} className="border border-slate-200 p-1 font-bold text-[10px]">{l}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {simpleVlookupData.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td className={`border border-slate-200 p-1 text-[9px] bg-slate-50 font-bold ${rIdx === 0 ? 'text-slate-800' : 'text-slate-400'}`}>{rIdx + 1}</td>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={`border border-slate-200 p-2 transition-all duration-300 text-[11px] ${highlightedCells.includes(`v-r${rIdx}-c${cIdx}`) ? 'bg-yellow-100 font-bold text-yellow-900' : (rIdx === 0 ? 'bg-slate-100 font-bold text-slate-700' : 'bg-white')}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Fungsi lainnya: Tabel biasa */}
            {activeTab !== 'VLOOKUP' && activeTab !== 'HLOOKUP' && (
              <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm relative -mx-2">
                <div className="absolute top-0 right-0 bg-slate-100 text-[8px] text-slate-400 px-1.5 py-0.5 rounded-bl-lg font-bold uppercase">
                  {['COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'].includes(activeTab) ? 'Penjualan' : 'Referensi'}
                </div>
                <table className="w-full border-collapse text-xs text-center mt-4">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500">
                      <th className="border border-slate-200 p-1 w-6 text-[9px] bg-slate-50 font-bold"></th>
                      {['A', 'B', 'C', 'D'].map(l => <th key={l} className="border border-slate-200 p-1 font-bold text-[10px]">{l}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {verticalData.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className={`border border-slate-200 p-1 text-[9px] bg-slate-50 font-bold ${rIdx === 0 ? 'text-slate-800' : 'text-slate-400'}`}>{rIdx + 1}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`border border-slate-200 p-2 transition-all duration-300 text-[11px] ${highlightedCells.includes(`v-r${rIdx}-c${cIdx}`) ? 'bg-yellow-100 font-bold text-yellow-900' : (rIdx === 0 && !['COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'].includes(activeTab) ? 'bg-slate-100 font-bold text-slate-700' : 'bg-white')}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'HLOOKUP' && (
              <>
                {/* Mode KOMPLEKS: 2 Tabel */}
                {simulationMode === 'complex' && (
                  <>
                    {/* Tabel Utama: Karyawan */}
                    <div className="mb-4">
                      <p className="text-[9px] font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                        <Table size={10} /> Tabel Karyawan (Data Utama)
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-blue-200 shadow-sm -mx-2">
                        <table className="w-full border-collapse text-[10px] text-center">
                          <thead>
                            <tr className="bg-blue-50 text-blue-600">
                              <th className="border border-blue-200 p-1 w-5 text-[8px] font-bold"></th>
                              {['A', 'B', 'C', 'D', 'E'].map(l => <th key={l} className="border border-blue-200 p-1 font-bold text-[9px]">{l}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {employeeTable.map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td className="border border-blue-200 p-1 text-[8px] bg-blue-50 font-bold text-blue-400">{rIdx + 1}</td>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className={`border border-blue-200 p-1 transition-all ${rIdx === 0 ? 'bg-blue-100 font-bold text-blue-700' : 'bg-white'} ${cell === '?' ? 'text-orange-500 font-bold' : ''}`}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Tabel Referensi: Golongan & Gaji (Horizontal) */}
                    <div>
                      <p className="text-[9px] font-bold text-orange-600 uppercase mb-2 flex items-center gap-1">
                        <List size={10} /> Tabel Referensi Golongan (HLOOKUP mencari di sini)
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-orange-200 shadow-sm -mx-2">
                        <table className="w-full border-collapse text-[10px] text-center">
                          <thead>
                            <tr className="bg-orange-50 text-orange-600">
                              <th className="border border-orange-200 p-1 w-5 text-[8px] font-bold"></th>
                              {['A', 'B', 'C', 'D', 'E'].map(l => <th key={l} className="border border-orange-200 p-1 font-bold text-[9px]">{l}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {salaryRefTable.map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td className="border border-orange-200 p-1 text-[8px] bg-orange-50 font-bold text-orange-400">{rIdx + 10}</td>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className={`border border-orange-200 p-1 transition-all duration-300 ${highlightedCells.includes(`h-r${rIdx}-c${cIdx}`) ? 'bg-yellow-100 font-bold text-yellow-900' : (cIdx === 0 ? 'bg-orange-100 font-bold text-orange-700' : 'bg-white')}`}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* Mode SEDERHANA: 1 Tabel saja */}
                {simulationMode === 'simple' && (
                  <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm relative -mx-2">
                    <div className="absolute top-0 right-0 bg-orange-100 text-[8px] text-orange-600 px-1.5 py-0.5 rounded-bl-lg font-bold uppercase">
                      Omzet Bulanan
                    </div>
                    <table className="w-full border-collapse text-xs text-center mt-4">
                      <thead>
                        <tr className="bg-slate-100 text-slate-500">
                          <th className="border border-slate-200 p-1 w-6 text-[9px] bg-slate-50 font-bold"></th>
                          {['A', 'B', 'C', 'D', 'E'].map(l => <th key={l} className="border border-slate-200 p-1 font-bold text-[10px]">{l}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {simpleHlookupData.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td className="border border-slate-200 p-1 text-[9px] text-slate-400 bg-slate-50 font-bold w-6">{rIdx + 1}</td>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={`border border-slate-200 p-2 transition-all duration-300 text-[11px] ${highlightedCells.includes(`h-r${rIdx}-c${cIdx}`) ? 'bg-orange-100 font-bold text-orange-900' : 'bg-white'}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === 'CHOOSE' && (
              <div className="overflow-x-auto -mx-2">
                <table className="border-collapse text-xs min-w-full">
                  <tbody>
                    <tr>
                      <td className="border border-slate-200 p-1 text-center text-[9px] text-slate-400 bg-slate-50 font-bold w-6">14</td>
                      {chooseData[0].map((cell, cIdx) => (
                        <td key={cIdx} className={`border border-slate-200 p-2 text-center transition-all duration-300 text-[11px] ${highlightedCells.includes(`c-r0-c${cIdx}`) ? 'bg-purple-100 font-bold text-purple-900' : 'bg-white text-slate-400'}`}>{cell}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ===== DESKTOP: LEFT COLUMN - VISUALIZATION ===== */}
        <div className="hidden lg:block lg:col-span-2 space-y-6">
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
                          <td key={cIdx} className={`border border-slate-200 p-3 transition-all duration-300 ${highlightedCells.includes(`v-r${rIdx}-c${cIdx}`) ? 'bg-yellow-100 font-bold text-yellow-900' : (rIdx === 0 && !['COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'].includes(activeTab) ? 'bg-slate-100 font-bold text-slate-700' : 'bg-white')}`}>{cell}</td>
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
                          <td key={cIdx} className={`border border-slate-200 p-3 transition-all duration-300 ${highlightedCells.includes(`h-r${rIdx}-c${cIdx}`) ? 'bg-orange-100 font-bold text-orange-900' : 'bg-white'}`}>{cell}</td>
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
                        <td key={cIdx} className={`border border-slate-200 p-2 text-center transition-all duration-300 ${highlightedCells.includes(`c-r0-c${cIdx}`) ? 'bg-purple-100 font-bold text-purple-900' : 'bg-white text-slate-400'}`}>{cell}</td>
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

        {/* ===== DESKTOP: RIGHT COLUMN - CONTROLS ===== */}
        <div className="hidden lg:block space-y-6">
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

            {/* Hint untuk siswa */}
            <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
              <Edit3 size={16} className="text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700 font-medium">
                <span className="font-bold">Coba ubah nilai!</span> Klik dropdown di bawah untuk mengubah parameter dan lihat bagaimana hasilnya berubah.
              </p>
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

      {/* Next Module Suggestion - Shows after completing all functions */}
      {showNextModule && moduleInfo?.nextModule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Selamat! 🎉</h2>
            <p className="text-slate-600 text-sm mb-4">
              Anda sudah menyelesaikan semua 9 fungsi Excel di modul ini!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowNextModule(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Tetap di sini
              </button>
              <Link
                to={moduleInfo.nextModule.path}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Lanjut ke {moduleInfo.nextModule.name}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Mode Modal */}
      {showQuiz && (
        <QuizMode
          moduleId="excel"
          moduleName="Excel Formula"
          questions={excelQuizQuestions}
          onClose={() => setShowQuiz(false)}
          onComplete={(score, total) => {
            console.log(`Quiz completed: ${score}/${total}`);
          }}
        />
      )}

      {/* Floating Quiz Button */}
      {completedFunctions.length >= 3 && !showQuiz && (
        <button
          onClick={() => setShowQuiz(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-xl hover:scale-105 transition-all"
          title="Ambil Quiz"
        >
          <Lightbulb size={16} className="md:w-5 md:h-5" />
          <span className="text-xs md:text-sm font-bold">Quiz</span>
        </button>
      )}
    </div>
  );
};

export default SpreadsheetLab;
