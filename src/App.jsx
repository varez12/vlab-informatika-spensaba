import React, { useState, useEffect } from 'react';
import { 
  Table, Grid, List, HelpCircle, ArrowRight, MousePointer2, Info, 
  Settings2, Edit3, Lightbulb, Play, RotateCcw, ArrowUp, RotateCw, 
  RotateCcw as RotateLeft, Repeat, Trash2, CheckCircle2, Flag, Bot, 
  Trophy, Star, ChevronRight, Split, GitBranch, Layers, Zap, Target, 
  Navigation, BookOpen, X, Sparkles, Cpu, Code2, AlertCircle, LayoutGrid, Home, Code, Menu, ChevronDown
} from 'lucide-react';

// ============================================================
// MODUL 1: SPREADSHEET LAB (VERSI PALING LENGKAP & DETAIL)
// ============================================================
const SpreadsheetLab = () => {
  const [activeTab, setActiveTab] = useState('VLOOKUP');
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [result, setResult] = useState(null);
  
  const verticalData = [
    ['ID', 'Menu', 'Harga', 'Stok'],
    ['K01', 'Nasi Goreng', '15000', '10'],
    ['K02', 'Mie Ayam', '12000', '15'],
    ['K03', 'Es Teh', '5000', '50'],
    ['K04', 'Soto Ayam', '13000', '8']
  ];

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

  const runSimulation = () => {
    let cells = [];
    let res = "";
    try {
      if (activeTab === 'VLOOKUP') {
        const rowIndex = verticalData.findIndex(row => row[0] === inputs.vlookupValue);
        const colIdx = parseInt(inputs.vlookupCol);
        if (rowIndex !== -1 && colIdx >= 1 && colIdx <= 4) {
          cells = [`v-r${rowIndex}-c0`, `v-r${rowIndex}-c${colIdx - 1}`];
          res = verticalData[rowIndex][colIdx - 1];
        } else res = rowIndex === -1 ? "#N/A" : "#REF!";
      } 
      else if (activeTab === 'HLOOKUP') {
        const colIndex = horizontalData[0].findIndex(col => col === inputs.hlookupValue);
        const rowIdx = parseInt(inputs.hlookupRow);
        if (colIndex !== -1 && rowIdx >= 1 && rowIdx <= 2) {
          cells = [`h-r0-c${colIndex}`, `h-r${rowIdx - 1}-c${colIndex}`];
          res = horizontalData[rowIdx - 1][colIndex];
        } else res = colIndex === -1 ? "#N/A" : "#REF!";
      }
      else if (activeTab === 'MATCH') {
        const colToSearch = inputs.matchArray?.includes('A') ? 0 : inputs.matchArray?.includes('C') ? 2 : 1;
        const rowIndex = verticalData.findIndex(row => row[colToSearch].toString().toLowerCase() === inputs.matchValue.toLowerCase());
        if (rowIndex !== -1) { cells = [`v-r${rowIndex}-c${colToSearch}`]; res = rowIndex + 1; } else res = "#N/A";
      }
      else if (activeTab === 'INDEX') {
        const r = parseInt(inputs.indexRow) - 1;
        const c = parseInt(inputs.indexCol) - 1;
        if (verticalData[r] && verticalData[r][c] !== undefined) { cells = [`v-r${r}-c${c}`]; res = verticalData[r][c]; } else res = "#REF!";
      }
      else if (activeTab === 'CHOOSE') {
        const idx = parseInt(inputs.chooseIndex) - 1;
        if (chooseData[0][idx]) { cells = [`c-r0-c${idx}`]; res = chooseData[0][idx]; } else res = "#VALUE!";
      }
      else if (activeTab === 'COUNTIF') {
        let count = 0;
        verticalData.slice(1).forEach((row, i) => {
          if (evaluateCriteria(row[3], inputs.countifCriteria)) { count++; cells.push(`v-r${i+1}-c3`); }
        });
        res = count;
      }
      else if (activeTab === 'SUMIF') {
        let sum = 0;
        verticalData.slice(1).forEach((row, i) => {
          if (evaluateCriteria(row[2], inputs.sumifCriteria)) { sum += parseFloat(row[2]); cells.push(`v-r${i+1}-c2`); }
        });
        res = sum;
      }
      else if (activeTab === 'COUNTIFS') {
        let count = 0;
        verticalData.slice(1).forEach((row, i) => {
          if (evaluateCriteria(row[2], inputs.countifsCrit1) && evaluateCriteria(row[3], inputs.countifsCrit2)) {
            count++; cells.push(`v-r${i+1}-c2`, `v-r${i+1}-c3`);
          }
        });
        res = count;
      }
      else if (activeTab === 'SUMIFS') {
        let sum = 0;
        verticalData.slice(1).forEach((row, i) => {
          if (evaluateCriteria(row[2], inputs.sumifsCrit1) && evaluateCriteria(row[3], inputs.sumifsCrit2)) {
            sum += parseFloat(row[3]); cells.push(`v-r${i+1}-c2`, `v-r${i+1}-c3`);
          }
        });
        res = sum;
      }
    } catch (e) { res = "#ERROR!"; }
    setHighlightedCells(cells);
    setResult(res);
  };

  useEffect(() => { runSimulation(); }, [activeTab, inputs]);

  const tabs = ['VLOOKUP', 'HLOOKUP', 'MATCH', 'INDEX', 'CHOOSE', 'COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'];

  const getFormulaInfo = () => {
    switch(activeTab) {
      case 'VLOOKUP': return { title: "Vertical Lookup", desc: "Mencari data ke bawah pada kolom pertama, lalu mengambil nilai di baris yang sama pada kolom tertentu.", syntax: "=VLOOKUP(nilai_dicari; tabel; nomor_kolom; [range_lookup])" };
      case 'HLOOKUP': return { title: "Horizontal Lookup", desc: "Mencari data ke samping pada baris pertama, lalu mengambil nilai di kolom yang sama pada baris tertentu.", syntax: "=HLOOKUP(nilai_dicari; tabel; nomor_baris; [range_lookup])" };
      case 'MATCH': return { title: "Match Function", desc: "Mencari posisi atau nomor urut suatu nilai di dalam daftar atau rentang sel.", syntax: "=MATCH(nilai_dicari; rentang_data; 0)" };
      case 'INDEX': return { title: "Index Function", desc: "Mengambil nilai dari sebuah sel berdasarkan koordinat nomor baris dan nomor kolom.", syntax: "=INDEX(rentang_tabel; nomor_baris; nomor_kolom)" };
      case 'CHOOSE': return { title: "Choose Function", desc: "Memilih satu nilai dari daftar pilihan berdasarkan angka urut (index) yang diberikan.", syntax: "=CHOOSE(indeks; pilihan1; pilihan2; ...)" };
      case 'COUNTIF': return { title: "Countif Function", desc: "Menghitung jumlah sel yang memenuhi satu kriteria atau syarat tertentu.", syntax: "=COUNTIF(rentang; kriteria)" };
      case 'SUMIF': return { title: "Sumif Function", desc: "Menjumlahkan nilai dalam rentang yang memenuhi satu kriteria atau syarat tertentu.", syntax: "=SUMIF(rentang; kriteria; [rentang_jumlah])" };
      case 'COUNTIFS': return { title: "Countifs Function", desc: "Menghitung jumlah sel berdasarkan banyak kriteria sekaligus (Kriteria 1 DAN Kriteria 2).", syntax: "=COUNTIFS(r1; k1; r2; k2; ...)" };
      case 'SUMIFS': return { title: "Sumifs Function", desc: "Menjumlahkan nilai sel berdasarkan banyak kriteria sekaligus (Syarat 1 DAN Syarat 2).", syntax: "=SUMIFS(rentang_jumlah; r1; k1; r2; k2; ...)" };
      default: return { title: activeTab, desc: "Fungsi referensi dan statistik spreadsheet.", syntax: "Formula" };
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 font-sans text-slate-800 p-4 md:p-8 overflow-y-auto text-left custom-scrollbar">
      {/* HEADER TINGGI (h-24) */}
      <header className="h-24 mb-6 border-b border-slate-200 flex flex-col justify-center shrink-0">
        <div className="flex items-center gap-2 mb-1 pr-16 md:pr-0">
          <Settings2 className="text-green-600 w-7 h-7 shrink-0" />
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-900 truncate">Spreadsheet Pro</h1>
        </div>
        <p className="text-slate-500 text-xs md:text-sm italic">Anatomi formula pencarian data dan statistik bersyarat secara mendalam.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 space-y-6">
          {/* HEADER PENJELASAN (DINAMIS SESUAI TAB) */}
          <div className="bg-green-600 text-white p-6 rounded-2xl shadow-md border-b-4 border-green-700 animate-in fade-in slide-in-from-top duration-500">
            <h2 className="flex items-center gap-2 font-bold text-lg mb-2"><BookOpen className="w-5 h-5 text-green-200" /> {getFormulaInfo().title}</h2>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">{getFormulaInfo().desc}</p>
            <div className="bg-green-800/40 p-4 rounded-xl font-mono text-xs border border-white/10 select-all tracking-wider">
              {getFormulaInfo().syntax}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Grid size={14}/> Worksheet View</h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200 mb-6 shadow-sm">
              <table className="w-full border-collapse text-sm text-center">
                <thead>
                  <tr className="bg-slate-100 text-slate-500">
                    <th className="border border-slate-200 p-1 w-10 text-[10px] bg-slate-50"></th>
                    {['A','B','C','D'].map(l => <th key={l} className="border border-slate-200 p-1 font-normal">{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {verticalData.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="border border-slate-200 p-1 text-[10px] text-slate-400 bg-slate-50 font-bold">{rIdx + 1}</td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className={`border border-slate-200 p-2 transition-all duration-300 ${highlightedCells.includes(`v-r${rIdx}-c${cIdx}`) ? 'bg-yellow-100 border-yellow-500 font-bold text-yellow-900 ring-2 ring-yellow-400 ring-inset' : 'bg-white'}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FX BAR DINAMIS */}
          <div className="bg-white rounded-xl shadow-md border-t-4 border-green-500 overflow-hidden text-center">
             <div className="bg-slate-900 px-4 py-3 flex items-center gap-3 overflow-x-auto border-b border-slate-800 text-left">
               <span className="italic font-serif text-green-400 font-bold text-lg">fx</span>
               <div className="font-mono text-sm text-slate-300 whitespace-nowrap">
                  {activeTab === 'VLOOKUP' && `=VLOOKUP("${inputs.vlookupValue}"; A1:D5; ${inputs.vlookupCol}; ${inputs.vlookupRange})`}
                  {activeTab === 'HLOOKUP' && `=HLOOKUP("${inputs.hlookupValue}"; A10:E11; ${inputs.hlookupRow}; ${inputs.hlookupRange})`}
                  {activeTab === 'MATCH' && `=MATCH("${inputs.matchValue}"; ${inputs.matchArray}; 0)`}
                  {activeTab === 'INDEX' && `=INDEX(A1:D5; ${inputs.indexRow}; ${inputs.indexCol})`}
                  {activeTab === 'CHOOSE' && `=CHOOSE(${inputs.chooseIndex}; A14; B14; C14)`}
                  {activeTab === 'COUNTIF' && `=COUNTIF(D2:D5; "${inputs.countifCriteria}")`}
                  {activeTab === 'SUMIF' && `=SUMIF(C2:C5; "${inputs.sumifCriteria}"; C2:C5)`}
                  {activeTab === 'COUNTIFS' && `=COUNTIFS(C2:C5; "${inputs.countifsCrit1}"; D2:D5; "${inputs.countifsCrit2}")`}
                  {activeTab === 'SUMIFS' && `=SUMIFS(D2:D5; C2:C5; "${inputs.sumifsCrit1}"; D2:D5; "${inputs.sumifsCrit2}")`}
               </div>
             </div>
             <div className="p-10 bg-green-50/20">
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest block mb-2">Output Terkalkulasi</span>
                <div className="text-6xl font-mono font-black text-slate-900 drop-shadow-sm">{result}</div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-4 overflow-y-auto max-h-[85vh] custom-scrollbar text-left">
            <div className="flex gap-1.5 mb-8 flex-wrap">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-2.5 py-1.5 rounded-full text-[9px] font-bold transition-all ${activeTab === tab ? 'bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{tab}</button>
              ))}
            </div>
            
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 border-b border-slate-50 pb-2"><Edit3 size={14}/> Konfigurasi Argumen</h3>
            
            <div className="space-y-6">
              {activeTab === 'VLOOKUP' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">lookup_value:</label>
                    <select value={inputs.vlookupValue} onChange={(e) => setInputs({...inputs, vlookupValue: e.target.value})} className="w-full p-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-bold appearance-none outline-none">
                      {verticalData.slice(1).map(r => <option key={r[0]} value={r[0]}>{r[0]}</option>)}
                    </select>
                    <p className="text-[9px] text-slate-400 mt-1 italic">Data kunci yang dicari di kolom pertama tabel (ID K01-K04).</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">col_index_num:</label>
                    <input type="number" value={inputs.vlookupCol} onChange={(e) => setInputs({...inputs, vlookupCol: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono focus:ring-2 ring-green-500 outline-none" />
                    <p className="text-[9px] text-slate-400 mt-1 italic">Nomor urut kolom data yang ingin diambil (1-4).</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">range_lookup:</label>
                    <select value={inputs.vlookupRange} onChange={(e) => setInputs({...inputs, vlookupRange: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold uppercase outline-none">
                      <option value="FALSE">FALSE (Sama Persis)</option>
                      <option value="TRUE">TRUE (Mendekati)</option>
                    </select>
                    <p className="text-[9px] text-slate-400 mt-1 italic">Pilih FALSE untuk pencarian data yang identik.</p>
                  </div>
                </>
              )}
              {activeTab === 'MATCH' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">lookup_array:</label>
                    <select value={inputs.matchArray} onChange={(e) => setInputs({...inputs, matchArray: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold outline-none">
                      <option value="A1:A5">A1:A5 (ID)</option>
                      <option value="B1:B5">B1:B5 (Menu)</option>
                      <option value="C1:C5">C1:C5 (Harga)</option>
                    </select>
                    <p className="text-[9px] text-blue-600 mt-1 italic font-semibold leading-tight">Rentang sel atau daftar tempat komputer mencari data.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">lookup_value:</label>
                    <select value={inputs.matchValue} onChange={(e) => setInputs({...inputs, matchValue: e.target.value})} className="w-full p-2 bg-amber-50 border border-amber-200 rounded-md text-sm font-bold appearance-none outline-none">
                      {getMatchOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <p className="text-[9px] text-slate-400 mt-1 italic">Data yang ingin diketahui nomor urut barisnya.</p>
                  </div>
                </>
              )}
              {/* Isian formula lainnya tetap terjaga detail */}
              {activeTab === 'INDEX' && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">row_num:</label>
                    <input type="number" value={inputs.indexRow} onChange={(e) => setInputs({...inputs, indexRow: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-md text-sm font-mono focus:ring-2 ring-green-500 outline-none" />
                    <p className="text-[9px] text-slate-400 mt-1 italic">Nomor koordinat baris dalam tabel (1 s.d 5).</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">column_num:</label>
                    <input type="number" value={inputs.indexCol} onChange={(e) => setInputs({...inputs, indexCol: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-md text-sm font-mono focus:ring-2 ring-green-500 outline-none" />
                    <p className="text-[9px] text-slate-400 mt-1 italic">Nomor koordinat kolom dalam tabel (1 s.d 4).</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MODUL 2: CODING MAZE (MODE TERANG & TATA LETAK OPTIMAL)
// ============================================================
const CodingLab = () => {
  const levels = [
    { id: 1, name: "Garis Lurus", maze: [[0,0,0,0,0], [0,0,0,0,0], [1,1,1,1,1], [0,0,0,0,0], [0,0,0,0,0]], start: { x: 0, y: 2, dir: 0 }, target: { x: 4, y: 2 }, hint: "Bantu robot maju. Gunakan 'Ulangi sampai' agar efisien!" },
    { id: 2, name: "Belokan Pertama", maze: [[0,0,0,0,0], [0,0,1,1,1], [0,0,1,0,0], [1,1,1,0,0], [0,0,0,0,0]], start: { x: 0, y: 3, dir: 0 }, target: { x: 4, y: 1 }, hint: "Belokkan robot sebelum menabrak dinding!" },
    { id: 3, name: "Tangga Logika", maze: [[0,0,0,1,1], [0,0,1,1,0], [0,1,1,0,0], [1,1,0,0,0], [0,0,0,0,0]], start: { x: 0, y: 3, dir: 0 }, target: { x: 4, y: 0 }, hint: "Ada pola tangga. Gunakan perulangan!" },
    { id: 4, name: "Sensor Dasar", maze: [[0,0,1,1,1], [0,0,1,0,0], [1,1,1,0,0], [0,0,0,0,0], [0,0,0,0,0]], start: { x: 0, y: 2, dir: 0 }, target: { x: 4, y: 0 }, hint: "Pakai blok 'Jika ada jalan' untuk mendeteksi belokan." },
    { id: 5, name: "Labirin U", maze: [[1,1,1,1,1], [1,0,0,0,1], [1,0,1,0,1], [1,0,1,0,1], [1,1,1,0,0]], start: { x: 2, y: 2, dir: 3 }, target: { x: 0, y: 4 }, hint: "Kombinasikan Jika dan Belok!" },
    { id: 6, name: "Zig-Zag Menengah", maze: [[1,1,0,0,0], [0,1,1,0,0], [0,0,1,1,0], [0,0,0,1,1], [0,0,0,0,1]], start: { x: 0, y: 0, dir: 1 }, target: { x: 4, y: 4 }, hint: "Gunakan logika If di dalam Repeat." },
    { id: 7, name: "Persimpangan T", maze: [[1,1,1,1,1], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0]], start: { x: 2, y: 4, dir: 3 }, target: { x: 0, y: 0 }, hint: "Kapan robot harus berhenti maju dan mulai belok?" },
    { id: 8, name: "Algoritma Efisien", maze: [[1,0,0,0,0], [1,1,1,1,1], [0,0,0,0,1], [1,1,1,1,1], [1,0,0,0,0]], start: { x: 0, y: 4, dir: 3 }, target: { x: 0, y: 0 }, hint: "Gunakan 'Jika... lainnya' untuk jalur buntu." },
    { id: 9, name: "Pencarian Jejak", maze: [[1,1,1,0,0], [1,0,1,0,0], [1,1,1,1,1], [0,0,1,0,1], [0,0,1,1,1]], start: { x: 4, y: 4, dir: 2 }, target: { x: 0, y: 0 }, hint: "Hati-hati, jalur ini cukup menjebak!" },
    { id: 10, name: "The Grand Master", maze: [[1,1,1,1,1], [1,0,0,0,1], [1,1,1,1,1], [0,0,0,0,1], [1,1,1,1,1]], start: { x: 0, y: 4, dir: 0 }, target: { x: 0, y: 0 }, hint: "Level terakhir! Gabungkan Repeat, If, and Else." }
  ];

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = levels[currentLevelIdx];
  const [robotPos, setRobotPos] = useState(currentLevel.start);
  const [program, setProgram] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState(currentLevel.hint);
  const [score, setScore] = useState(0);

  const availableBlocks = [
    { id: 'move', label: 'gerak maju', icon: <ArrowUp size={20} />, color: 'from-blue-500 to-blue-700' },
    { id: 'turnLeft', label: 'belok kiri ↺', icon: <RotateLeft size={20} />, color: 'from-blue-500 to-blue-700' },
    { id: 'turnRight', label: 'belok kanan ↻', icon: <RotateCw size={20} />, color: 'from-blue-500 to-blue-700' },
    { id: 'repeatUntil', label: 'ulangi sampai 🏁', icon: <Repeat size={20} />, color: 'from-pink-500 to-rose-700' },
    { id: 'ifPathAhead', label: 'jika ada jalan di depan', icon: <Split size={20} />, color: 'from-yellow-500 to-orange-600' },
    { id: 'ifElsePath', label: 'jika jalan... lainnya...', icon: <GitBranch size={20} />, color: 'from-green-500 to-emerald-600' },
  ];

  useEffect(() => { setRobotPos(currentLevel.start); setProgram([]); setStatus('idle'); setMessage(currentLevel.hint); }, [currentLevelIdx]);

  const addBlock = (blockId) => { if (isRunning) return; const block = availableBlocks.find(b => b.id === blockId); setProgram([...program, { ...block, instanceId: Date.now() }]); };
  const removeBlock = (idx) => { if (isRunning) return; const newP = [...program]; newP.splice(idx,1); setProgram(newP); };

  const runProgram = async () => {
    if (program.length === 0 || isRunning) return;
    setIsRunning(true); setStatus('running');
    let currentRobot = { ...currentLevel.start };
    const hasLoop = program.some(b => b.id === 'repeatUntil');
    let iterations = 0;
    while (iterations < 80) {
      iterations++;
      for (let i = 0; i < program.length; i++) {
        if (program[i].id === 'repeatUntil') continue;
        setCurrentStep(i); const block = program[i];
        if (block.id === 'ifElsePath') { if (!checkPath(currentRobot, currentRobot.dir)) { i += 1; continue; } }
        if (block.id === 'ifPathAhead') { if (!checkPath(currentRobot, currentRobot.dir)) { i++; continue; } }
        await new Promise(r => setTimeout(r, 400));
        let nextX = currentRobot.x; let nextY = currentRobot.y;
        if (block.id === 'move') {
          if (currentRobot.dir === 0) nextX++; else if (currentRobot.dir === 1) nextY++; else if (currentRobot.dir === 2) nextX--; else if (currentRobot.dir === 3) nextY--;
          if (nextX < 0 || nextX >= 5 || nextY < 0 || nextY >= 5 || currentLevel.maze[nextY][nextX] === 0) {
            setStatus('crash'); setMessage("Robot menabrak tembok!"); setIsRunning(false); return;
          }
          currentRobot.x = nextX; currentRobot.y = nextY;
        } else if (block.id === 'turnRight') currentRobot.dir = (currentRobot.dir + 1) % 4;
        else if (block.id === 'turnLeft') currentRobot.dir = (currentRobot.dir + 3) % 4;
        setRobotPos({ ...currentRobot });
        if (currentRobot.x === currentLevel.target.x && currentRobot.y === currentLevel.target.y) {
          setStatus('success'); setScore(prev => prev + 100); setMessage("Misi Berhasil!"); setIsRunning(false); return;
        }
      }
      if (!hasLoop) break;
    }
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 font-sans text-slate-800 overflow-hidden relative select-none">
      {/* HEADER TINGGI MODE TERANG */}
      <header className="h-24 bg-white border-b border-slate-200 px-4 md:px-6 flex justify-between items-center z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg">
            <Bot size={28} className="text-white" />
          </div>
          <div className="text-left leading-none">
            <h1 className="text-sm md:text-xl font-bold text-slate-900 uppercase tracking-tighter">Coding Maze Hub</h1>
            <p className="text-[10px] text-blue-600 font-bold uppercase mt-1 tracking-widest">LEVEL {currentLevelIdx + 1} OF 10 &bull; {currentLevel.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mr-16 md:mr-20">
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-mono text-sm md:text-lg shadow-inner">
             <span className="opacity-50 text-[10px] mr-2">POIN:</span>
             {score} PTS
          </div>
          {status === 'success' && currentLevelIdx < levels.length - 1 && (
            <button onClick={() => setCurrentLevelIdx(prev => prev + 1)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-emerald-500 shadow-lg animate-bounce transition-all">Lanjut Misi</button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 md:p-4 gap-4 custom-scrollbar">
        
        {/* GAME BOARD SECTION (Kiri) */}
        <section className="flex-none lg:flex-1 bg-blue-50 rounded-3xl border border-slate-200 flex flex-col items-center justify-center p-6 min-h-[450px] shadow-sm relative overflow-hidden">
           <div className="absolute top-4 left-6 opacity-20 hidden md:flex items-center gap-2"><Zap size={14} className="text-blue-500" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Visual Engine</span></div>
           
           <div className="w-full max-w-[340px] aspect-square relative z-10 border-4 border-slate-100 rounded-[2.5rem] p-1 bg-slate-50 shadow-inner">
             <div className="grid grid-cols-5 grid-rows-5 gap-1.5 bg-slate-200 p-3.5 rounded-[2.2rem] w-full h-full">
                {currentLevel.maze.map((row, y) => row.map((cell, x) => (
                  <div key={`${x}-${y}`} className={`flex items-center justify-center rounded-xl aspect-square relative transition-all duration-300 ${cell === 1 ? 'bg-white shadow-[inset_0_-4px_0_#cbd5e1]' : 'bg-slate-300/50 border border-white/50 shadow-inner'}`}>
                    {x === currentLevel.target.x && y === currentLevel.target.y && <Target size={22} className="text-rose-500 animate-pulse" strokeWidth={3} />}
                    {robotPos.x === x && robotPos.y === y && <div className="text-3xl md:text-4xl transition-all duration-300 transform" style={{ transform: `rotate(${robotPos.dir * 90}deg)` }}>🤖</div>}
                  </div>
                )))}
             </div>
           </div>
           
           <div className="mt-8 flex gap-3 w-full max-w-[340px] relative z-10">
             <button onClick={runProgram} disabled={isRunning || program.length === 0} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 shadow-xl border-b-4 border-blue-800 active:border-b-0 disabled:opacity-30 transition-all flex items-center justify-center gap-3">
                <Play size={18} fill="white" /> JALANKAN PROGRAM
             </button>
             <button onClick={() => setRobotPos(currentLevel.start)} className="bg-slate-200 p-4 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-300 transition-all shadow-sm"><RotateCcw size={22} /></button>
           </div>

           <div className={`mt-5 px-6 py-2.5 rounded-full border text-[10px] uppercase font-black tracking-[0.2em] transition-all duration-500 ${status === 'crash' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-shake' : status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-100 border-slate-200 text-slate-500 opacity-60'}`}>
              {message}
           </div>
        </section>

        {/* PROGRAMMING AREA (Kanan) */}
        <section className="flex-none lg:flex-[3] flex flex-col md:flex-row gap-3 h-auto overflow-hidden">
          
          {/* DAFTAR PERINTAH (TOOLBOX - DIPERLEBAR: w-64) */}
          <aside className="w-full md:w-64 flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-slate-100 bg-slate-50 text-center">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Perintah</h3>
            </div>
            <div className="flex-1 overflow-x-auto md:overflow-y-auto p-3 flex md:flex-col gap-2 custom-scrollbar">
              {availableBlocks.map(b => (
                <button key={b.id} onClick={() => addBlock(b.id)} className={`min-w-[120px] md:min-w-0 bg-gradient-to-br ${b.color} text-white px-4 py-4 rounded-xl text-[10px] md:text-[11px] font-black uppercase active:scale-90 shadow-md hover:brightness-110 transition-all border-b-2 border-black/20 shrink-0`}>
                  <span className="flex items-center gap-2 md:justify-center">{b.icon}{b.label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* WORKSPACE (ALGORITMA SAYA - LEBIH RAMPING: w-48) */}
          <aside className="w-full md:w-64 bg-white rounded-3xl border border-slate-200 p-4 overflow-y-auto custom-scrollbar text-left shadow-inner shrink-0">
             <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Code2 size={15} className="text-blue-500"/> Algoritma</h3>
                <button onClick={() => setProgram([])} className="text-[9px] text-rose-500 font-black hover:text-rose-400 uppercase transition-colors">Reset</button>
             </div>
             <div className="space-y-2">
                {program.map((b, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 bg-gradient-to-r ${b.color} text-white rounded-xl text-[10px] font-bold shadow-md animate-in slide-in-from-left duration-200 border-l-4 border-black/20`}>
                    <span className="flex items-center gap-2"><span className="opacity-40 font-mono text-[9px]">S{i+1}</span>{b.icon}</span>
                    <button onClick={() => removeBlock(i)} className="p-1 hover:bg-black/20 rounded-lg"><X size={12}/></button>
                  </div>
                ))}
                {program.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-30 text-slate-400 py-20"><Bot size={40}/><p className="text-[9px] uppercase font-black mt-3 tracking-widest text-center">Kosong.</p></div>}
             </div>
          </aside>

          {/* PEDOMAN (KAMUS CODING - DIPERLEBAR: w-80 & HURUF BESAR) */}
          <aside className="w-full md:w-80 flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm shrink-0">
            <div className="p-3 border-b border-slate-100 bg-slate-50 text-center">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Pedoman Instruksi</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-left">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                    <span className="text-[11px] md:text-[12px] font-black text-blue-600 uppercase flex items-center gap-2 mb-2 leading-none"><ArrowUp size={12}/> Gerak Maju</span>
                    <p className="text-[10px] md:text-[11px] text-slate-600 leading-relaxed font-medium">Robot melangkah satu kotak ke arah depan sesuai dengan arah kepalanya saat ini.</p>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm">
                    <span className="text-[11px] md:text-[12px] font-black text-indigo-600 uppercase flex items-center gap-2 mb-2 leading-none"><RotateCw size={12}/> Turn (Belok)</span>
                    <p className="text-[10px] md:text-[11px] text-slate-600 leading-relaxed font-medium">Robot berputar 90 derajat tetap di kotak yang sama. Gunakan untuk mengubah arah gerak.</p>
                </div>
                <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl shadow-sm">
                    <span className="text-[11px] md:text-[12px] font-black text-pink-600 uppercase flex items-center gap-2 mb-2 leading-none"><Repeat size={12}/> Repeat (Loop)</span>
                    <p className="text-[10px] md:text-[11px] text-slate-600 leading-relaxed font-medium">Blok yang diletakkan di dalam instruksi ini akan dijalankan berulang sampai target 🏁 tercapai.</p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl shadow-sm">
                    <span className="text-[11px] md:text-[12px] font-black text-yellow-600 uppercase flex items-center gap-2 mb-2 leading-none"><Split size={12}/> IF (Sensor)</span>
                    <p className="text-[10px] md:text-[11px] text-slate-600 leading-relaxed font-medium">Robot akan mengecek apakah ada dinding di depannya sebelum memutuskan untuk melangkah.</p>
                </div>
            </div>
          </aside>

        </section>
      </main>

      <footer className="h-8 bg-slate-50 border-t border-slate-200 flex items-center justify-center shrink-0">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] italic">V-LAB Virtual informatics Hub &bull; Versi 1.0</span>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
      ` }} />
    </div>
  );
};

// ============================================================
// DASHBOARD UTAMA (HUB - TAMPILAN STANDAR & RESPONSIVE)
// ============================================================
export default function App() {
  const [activeApp, setActiveApp] = useState('home');

  const renderContent = () => {
    switch(activeApp) {
      case 'spreadsheet': return (
        <div className="fixed inset-0 z-[100] bg-white overflow-hidden animate-in fade-in duration-300">
          <button onClick={() => setActiveApp('home')} className="absolute top-4 right-4 z-[110] bg-slate-900 text-white p-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group shadow-2xl">
            <Home size={18} /><span className="text-xs font-black uppercase hidden group-hover:block pr-1">Kembali</span>
          </button>
          <SpreadsheetLab />
        </div>
      );
      case 'coding': return (
        <div className="fixed inset-0 z-[100] bg-slate-100 overflow-hidden animate-in fade-in duration-300">
          <button onClick={() => setActiveApp('home')} className="absolute top-4 right-4 z-[110] bg-slate-900 text-white p-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group shadow-2xl">
            <Home size={18} /><span className="text-xs font-black uppercase hidden group-hover:block pr-1">Kembali</span>
          </button>
          <div className="h-full w-full">
            <CodingLab />
          </div>
        </div>
      );
      default: return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc] animate-in zoom-in duration-500 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl w-full text-center py-10">
            <div className="mb-10">
                <div className="bg-indigo-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4 ring-indigo-50 shadow-indigo-200">
                    <LayoutGrid className="text-white w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight uppercase">Portal Lab Informatika</h1>
                <p className="text-base text-slate-500 max-w-lg mx-auto font-normal leading-relaxed">
                    Platform praktikum virtual terintegrasi. Pilih laboratorium di bawah ini untuk memulai sesi belajar mandiri.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left">
              <button onClick={() => setActiveApp('spreadsheet')} className="group p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] hover:border-green-500 hover:shadow-2xl transition-all flex flex-col gap-5 shadow-sm border-b-4 hover:border-b-green-600">
                <div className="p-4 md:p-5 bg-green-100 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all w-fit shadow-inner">
                  <Table size={32}/>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900 mb-1 uppercase tracking-tight">Spreadsheet Pro</h3>
                  <p className="text-sm text-slate-500 font-normal leading-relaxed">Analisis data visual dengan formula VLOOKUP, HLOOKUP, dan Statistik Bersyarat.</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Masuk Lab <ArrowRight size={14}/></div>
              </button>

              <button onClick={() => setActiveApp('coding')} className="group p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] hover:border-blue-500 hover:shadow-2xl transition-all flex flex-col gap-5 shadow-sm border-b-4 hover:border-b-blue-600">
                <div className="p-4 md:p-5 bg-blue-100 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all w-fit shadow-inner">
                  <Bot size={32}/>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900 mb-1 uppercase tracking-tight">Coding Robot Maze</h3>
                  <p className="text-sm text-slate-500 font-normal leading-relaxed">Selesaikan tantangan 10 misi robot cerdas menggunakan logika blok pemrograman.</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Jalankan Misi <ArrowRight size={14}/></div>
              </button>
            </div>

            <footer className="mt-20 border-t border-slate-200 pt-8 opacity-40">
               <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest italic tracking-tighter">SMP Virtual Informatics Hub &bull; Versi 1.0</span>
            </footer>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] overflow-hidden select-none font-sans">
      {renderContent()}
    </div>
  );
}
