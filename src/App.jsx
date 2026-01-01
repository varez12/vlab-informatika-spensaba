import React, { useState, useEffect } from 'react';
import { Table, Grid, List, HelpCircle, ArrowRight, MousePointer2, Info, Settings2, Edit3, Lightbulb, ChevronDown, BookOpen, Sigma, Calculator } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('VLOOKUP');
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [result, setResult] = useState(null);
  
  // Data Tabel Utama (A1:D5) - Format Vertikal
  const verticalData = [
    ['ID', 'Menu', 'Harga', 'Stok'],
    ['K01', 'Nasi Goreng', '15000', '10'],
    ['K02', 'Mie Ayam', '12000', '15'],
    ['K03', 'Es Teh', '5000', '50'],
    ['K04', 'Soto Ayam', '13000', '8']
  ];

  // Data Tabel Omzet (A10:E11) - Format Horizontal
  const horizontalData = [
    ['Bulan', 'Jan', 'Feb', 'Mar', 'Apr'],
    ['Omzet', '200k', '250k', '210k', '300k']
  ];

  // Data Pilihan (A14:C14)
  const chooseData = [['Diskon 5%', 'Diskon 10%', 'Diskon 15%']];

  const [inputs, setInputs] = useState({
    vlookupValue: 'K02',
    vlookupCol: '2',
    vlookupRange: 'FALSE',
    hlookupValue: 'Mar',
    hlookupRow: '2',
    hlookupRange: 'FALSE',
    matchValue: 'Es Teh',
    matchArray: 'B1:B5',
    matchType: '0',
    indexRow: '3',
    indexCol: '2',
    chooseIndex: '1',
    // New Inputs for Conditional Math
    countifRange: 'D2:D5',
    countifCriteria: '>10',
    sumifRange: 'C2:C5',
    sumifCriteria: '>10000',
    sumifSumRange: 'C2:C5',
    countifsCrit1: '>5000',
    countifsCrit2: '<15',
    sumifsSumRange: 'D2:D5',
    sumifsCrit1: '>10000',
    sumifsCrit2: '<15'
  });

  const getMatchOptions = () => {
    if (inputs.matchArray.includes('A')) return verticalData.slice(1).map(r => r[0]);
    if (inputs.matchArray.includes('B')) return verticalData.slice(1).map(r => r[1]);
    if (inputs.matchArray.includes('C')) return verticalData.slice(1).map(r => r[2]);
    return [];
  };

  const evaluateCriteria = (value, criteria) => {
    const strVal = value.toString();
    const numVal = parseFloat(value);
    
    if (criteria.startsWith('>=')) return numVal >= parseFloat(criteria.slice(2));
    if (criteria.startsWith('<=')) return numVal <= parseFloat(criteria.slice(2));
    if (criteria.startsWith('>')) return numVal > parseFloat(criteria.slice(1));
    if (criteria.startsWith('<')) return numVal < parseFloat(criteria.slice(1));
    return strVal.toLowerCase() === criteria.toLowerCase();
  };

  const runSimulation = () => {
    let cells = [];
    let res = 0;

    try {
      if (activeTab === 'VLOOKUP') {
        const colIdx = parseInt(inputs.vlookupCol);
        const rowIndex = verticalData.findIndex(row => row[0] === inputs.vlookupValue);
        if (isNaN(colIdx) || colIdx < 1 || colIdx > 4) res = "#REF!";
        else if (rowIndex !== -1) {
          cells = [`v-r${rowIndex}-c0`, `v-r${rowIndex}-c${colIdx - 1}`];
          res = verticalData[rowIndex][colIdx - 1];
        } else res = "#N/A";
      } 
      else if (activeTab === 'HLOOKUP') {
        const rowIdx = parseInt(inputs.hlookupRow);
        const colIndex = horizontalData[0].findIndex(col => col === inputs.hlookupValue);
        if (isNaN(rowIdx) || rowIdx < 1 || rowIdx > 2) res = "#REF!";
        else if (colIndex !== -1) {
          cells = [`h-r0-c${colIndex}`, `h-r${rowIdx - 1}-c${colIndex}`];
          res = horizontalData[rowIdx - 1][colIndex];
        } else res = "#N/A";
      }
      else if (activeTab === 'MATCH') {
        let colToSearch = 1; 
        if (inputs.matchArray.includes('A')) colToSearch = 0;
        if (inputs.matchArray.includes('C')) colToSearch = 2;
        const rowIndex = verticalData.findIndex(row => row[colToSearch].toString().toLowerCase() === inputs.matchValue.toLowerCase());
        if (rowIndex !== -1) {
          cells = [`v-r${rowIndex}-c${colToSearch}`];
          res = rowIndex + 1;
        } else res = "#N/A";
      }
      else if (activeTab === 'INDEX') {
        const r = parseInt(inputs.indexRow) - 1;
        const c = parseInt(inputs.indexCol) - 1;
        if (!isNaN(r) && !isNaN(c) && verticalData[r] && verticalData[r][c] !== undefined) {
          cells = [`v-r${r}-c${c}`];
          res = verticalData[r][c];
        } else res = "#REF!";
      }
      else if (activeTab === 'CHOOSE') {
        const idx = parseInt(inputs.chooseIndex) - 1;
        if (!isNaN(idx) && chooseData[0][idx]) {
          cells = [`c-r0-c${idx}`];
          res = chooseData[0][idx];
        } else res = "#VALUE!";
      }
      else if (activeTab === 'COUNTIF') {
        const col = 3; // Stok
        let count = 0;
        verticalData.slice(1).forEach((row, i) => {
          if (evaluateCriteria(row[col], inputs.countifCriteria)) {
            count++;
            cells.push(`v-r${i+1}-c${col}`);
          }
        });
        res = count;
      }
      else if (activeTab === 'SUMIF') {
        const critCol = 2; // Harga
        const sumCol = 2; // Harga
        let sum = 0;
        verticalData.slice(1).forEach((row, i) => {
          if (evaluateCriteria(row[critCol], inputs.sumifCriteria)) {
            sum += parseFloat(row[sumCol]);
            cells.push(`v-r${i+1}-c${critCol}`);
          }
        });
        res = sum;
      }
      else if (activeTab === 'COUNTIFS') {
        let count = 0;
        verticalData.slice(1).forEach((row, i) => {
          const match1 = evaluateCriteria(row[2], inputs.countifsCrit1); // Harga
          const match2 = evaluateCriteria(row[3], inputs.countifsCrit2); // Stok
          if (match1 && match2) {
            count++;
            cells.push(`v-r${i+1}-c2`, `v-r${i+1}-c3`);
          }
        });
        res = count;
      }
      else if (activeTab === 'SUMIFS') {
        let sum = 0;
        verticalData.slice(1).forEach((row, i) => {
          const match1 = evaluateCriteria(row[2], inputs.sumifsCrit1); // Harga
          const match2 = evaluateCriteria(row[3], inputs.sumifsCrit2); // Stok
          if (match1 && match2) {
            sum += parseFloat(row[3]); // Sum Stok
            cells.push(`v-r${i+1}-c2`, `v-r${i+1}-c3`);
          }
        });
        res = sum;
      }
    } catch (e) { res = "#ERROR!"; }
    setHighlightedCells(cells);
    setResult(res);
  };

  useEffect(() => { runSimulation(); }, [activeTab, inputs]);

  const colLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const getFormulaInfo = () => {
    switch(activeTab) {
      case 'VLOOKUP': return {
        title: "Vertical Lookup (Mencari ke Bawah)",
        desc: "Mencari data di kolom pertama, lalu mengambil nilai di baris yang sama pada kolom tertentu.",
        syntax: "=VLOOKUP(nilai_dicari; tabel_data; nomor_kolom; [range_lookup])"
      };
      case 'HLOOKUP': return {
        title: "Horizontal Lookup (Mencari ke Samping)",
        desc: "Mencari data di baris pertama, lalu mengambil nilai di kolom yang sama pada baris tertentu.",
        syntax: "=HLOOKUP(nilai_dicari; tabel_data; nomor_baris; [range_lookup])"
      };
      case 'MATCH': return {
        title: "Match (Mencari Posisi)",
        desc: "Bukan mengambil datanya, tapi mencari tahu 'di urutan ke berapa' data tersebut berada.",
        syntax: "=MATCH(nilai_dicari; rentang_data; tipe_cocok)"
      };
      case 'INDEX': return {
        title: "Index (Mengambil dari Koordinat)",
        desc: "Mirip GPS, kamu memberikan nomor baris dan kolom, komputer memberikan isi selnya.",
        syntax: "=INDEX(tabel_data; nomor_baris; nomor_kolom)"
      };
      case 'CHOOSE': return {
        title: "Choose (Memilih dari Daftar)",
        desc: "Memilih satu nilai dari beberapa pilihan berdasarkan angka urutan yang diberikan.",
        syntax: "=CHOOSE(indeks_pilihan; pilihan1; pilihan2; ...)"
      };
      case 'COUNTIF': return {
        title: "Countif (Menghitung Bersyarat)",
        desc: "Menghitung jumlah sel yang memenuhi satu kriteria tertentu.",
        syntax: "=COUNTIF(rentang; kriteria)"
      };
      case 'SUMIF': return {
        title: "Sumif (Menjumlahkan Bersyarat)",
        desc: "Menjumlahkan nilai sel yang memenuhi satu kriteria tertentu.",
        syntax: "=SUMIF(rentang; kriteria; [rentang_jumlah])"
      };
      case 'COUNTIFS': return {
        title: "Countifs (Banyak Kriteria)",
        desc: "Menghitung sel berdasarkan banyak kriteria sekaligus (Kriteria 1 DAN Kriteria 2).",
        syntax: "=COUNTIFS(rentang1; kriteria1; rentang2; kriteria2; ...)"
      };
      case 'SUMIFS': return {
        title: "Sumifs (Banyak Kriteria)",
        desc: "Menjumlahkan nilai sel berdasarkan banyak kriteria sekaligus.",
        syntax: "=SUMIFS(rentang_jumlah; rentang1; kriteria1; ...)"
      };
      default: return {};
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-green-600 p-2 rounded-lg shadow-sm">
              <Settings2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">V-Lab Informatika: <span className="text-green-600">Spreadsheet Lab</span></h1>
          </div>
          <p className="text-slate-500 text-sm italic">Eksperimen Interaktif Formula Lookup & Reference untuk Siswa SMP.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 space-y-6">
          {/* Section Penjelasan Konsep */}
          <div className="bg-green-600 text-white p-5 rounded-2xl shadow-md">
            <h2 className="flex items-center gap-2 font-bold mb-2">
              <BookOpen className="w-5 h-5" /> {getFormulaInfo().title}
            </h2>
            <p className="text-sm text-green-50 opacity-90 mb-3">{getFormulaInfo().desc}</p>
            <div className="bg-green-700/50 p-3 rounded-lg font-mono text-xs border border-green-500/30">
              {getFormulaInfo().syntax}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Grid className="w-4 h-4" /> Spreadsheet View (Tabel Referensi)
            </h2>
            
            {/* Tabel Vertikal (Utama) */}
            <div className="mb-6">
              <p className="text-[10px] text-slate-500 mb-1 italic font-medium">Tabel Vertikal: Range A1:D5 (Data Utama Kantin).</p>
              <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-200 p-1 w-10 text-[10px] text-slate-400 bg-slate-50"></th>
                      {verticalData[0].map((_, i) => (<th key={i} className="border border-slate-200 p-1 text-center font-normal text-slate-500 bg-slate-50 w-32">{colLetters[i]}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {verticalData.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="border border-slate-200 p-1 text-center text-[10px] text-slate-400 bg-slate-50 font-bold">{rIdx + 1}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`border border-slate-200 p-2 transition-all duration-300 ${highlightedCells.includes(`v-r${rIdx}-c${cIdx}`) ? 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400 ring-inset font-bold text-yellow-900' : 'bg-white'} ${rIdx === 0 ? 'font-bold bg-slate-50/50 text-slate-600' : ''}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hidden for simplicity unless needed */}
            {(activeTab === 'HLOOKUP') && (
               <div className="mb-6">
               <p className="text-[10px] text-slate-500 mb-1 italic font-medium">Tabel Horizontal: Range A10:E11 (Record disusun menyamping).</p>
               <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                 <table className="border-collapse text-sm min-w-full">
                   <tbody>
                     <tr className="bg-slate-100">
                       <th className="border border-slate-200 p-1 w-10 text-[10px] text-slate-400 bg-slate-50"></th>
                       {horizontalData[0].map((_, i) => (<th key={i} className="border border-slate-200 p-1 text-center font-normal text-slate-500 bg-slate-50">{colLetters[i]}</th>))}
                     </tr>
                     {horizontalData.map((row, rIdx) => (
                       <tr key={rIdx}>
                         <td className="border border-slate-200 p-1 text-center text-[10px] text-slate-400 bg-slate-50 font-bold">{rIdx + 10}</td>
                         {row.map((cell, cIdx) => (
                           <td key={cIdx} className={`border border-slate-200 p-2 min-w-[80px] transition-all duration-300 ${highlightedCells.includes(`h-r${rIdx}-c${cIdx}`) ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-400 ring-inset font-bold text-emerald-900' : 'bg-white'} ${rIdx === 0 ? 'font-bold bg-slate-50/50 text-slate-600' : ''}`}>{cell}</td>
                         ))}
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
            )}

            {/* Tabel CHOOSE */}
            {activeTab === 'CHOOSE' && (
               <div className="mt-4">
               <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <MousePointer2 className="w-3 h-3 text-purple-500" /> Data Lepas untuk CHOOSE (Baris 14)
               </h2>
               <div className="overflow-x-auto rounded-lg border border-slate-200">
                 <table className="border-collapse text-sm min-w-full">
                   <thead>
                     <tr className="bg-slate-100">
                       <th className="border border-slate-200 p-1 w-10 text-[10px] text-slate-400 bg-slate-50"></th>
                       {chooseData[0].map((_, i) => (<th key={i} className="border border-slate-200 p-1 text-center font-normal text-slate-500 bg-slate-50">{colLetters[i]}</th>))}
                     </tr>
                   </thead>
                   <tbody>
                     <tr>
                       <td className="border border-slate-200 p-1 text-center text-[10px] text-slate-400 bg-slate-50 font-bold">14</td>
                       {chooseData[0].map((cell, cIdx) => (
                         <td key={cIdx} className={`border border-slate-200 p-2 min-w-[100px] text-center transition-all duration-300 ${highlightedCells.includes(`c-r0-c${cIdx}`) ? 'bg-purple-100 border-purple-500 ring-2 ring-purple-400 ring-inset font-bold text-purple-900' : 'bg-white text-slate-400'}`}>{cell}</td>
                       ))}
                     </tr>
                   </tbody>
                 </table>
               </div>
             </div>
            )}
          </div>

          {/* Bar Formula */}
          <div className="bg-white rounded-xl shadow-md border-t-4 border-green-500 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2 overflow-x-auto">
              <span className="italic font-serif text-slate-400 font-bold text-lg">fx</span>
              <div className="h-6 w-[1px] bg-slate-300 mx-2 flex-shrink-0"></div>
              <div className="font-mono text-sm text-slate-700 whitespace-nowrap py-1">
                {activeTab === 'VLOOKUP' && `=VLOOKUP("${inputs.vlookupValue}"; A1:D5; ${inputs.vlookupCol}; ${inputs.vlookupRange})`}
                {activeTab === 'HLOOKUP' && `=HLOOKUP("${inputs.hlookupValue}"; A10:E11; ${inputs.hlookupRow}; ${inputs.hlookupRange})`}
                {activeTab === 'MATCH' && `=MATCH("${inputs.matchValue}"; ${inputs.matchArray}; ${inputs.matchType})`}
                {activeTab === 'INDEX' && `=INDEX(A1:D5; ${inputs.indexRow}; ${inputs.indexCol})`}
                {activeTab === 'CHOOSE' && `=CHOOSE(${inputs.chooseIndex}; A14; B14; C14)`}
                {activeTab === 'COUNTIF' && `=COUNTIF(D2:D5; "${inputs.countifCriteria}")`}
                {activeTab === 'SUMIF' && `=SUMIF(C2:C5; "${inputs.sumifCriteria}"; C2:C5)`}
                {activeTab === 'COUNTIFS' && `=COUNTIFS(C2:C5; "${inputs.countifsCrit1}"; D2:D5; "${inputs.countifsCrit2}")`}
                {activeTab === 'SUMIFS' && `=SUMIFS(D2:D5; C2:C5; "${inputs.sumifsCrit1}"; D2:D5; "${inputs.sumifsCrit2}")`}
              </div>
            </div>
            <div className="p-8 flex flex-col items-center justify-center bg-green-50/20">
               <span className="text-[10px] font-bold text-green-700 uppercase mb-2 tracking-widest">Hasil yang Tampil di Sel:</span>
               <div className="text-4xl md:text-5xl font-mono font-black text-slate-900 drop-shadow-sm">{result}</div>
            </div>
          </div>
        </div>

        {/* Panel Kontrol & Detail */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex gap-2 mb-8 flex-wrap">
              {['VLOOKUP', 'HLOOKUP', 'MATCH', 'INDEX', 'CHOOSE', 'COUNTIF', 'SUMIF', 'COUNTIFS', 'SUMIFS'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`px-3 py-1.5 rounded-full text-[9px] font-bold transition-all ${activeTab === tab ? 'bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Edit3 className="w-3 h-3"/> Argumen Formula (Input)
            </h3>

            <div className="space-y-6">
              {activeTab === 'VLOOKUP' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">lookup_value (Nilai Kunci):</label>
                    <div className="relative">
                      <select value={inputs.vlookupValue} onChange={(e) => setInputs({...inputs, vlookupValue: e.target.value})} className="w-full p-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-bold text-blue-800 appearance-none focus:ring-2 ring-green-500 outline-none">
                        {verticalData.slice(1).map(r => <option key={r[0]} value={r[0]}>{r[0]}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-blue-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">col_index_num (Kolom Ke-):</label>
                    <input type="number" value={inputs.vlookupCol} onChange={(e) => setInputs({...inputs, vlookupCol: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono focus:ring-2 ring-green-500 outline-none" />
                  </div>
                </>
              )}

              {activeTab === 'COUNTIF' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Rentang (Kolom Stok D2:D5):</label>
                    <input type="text" disabled value="D2:D5" className="w-full p-2 bg-slate-100 border border-slate-200 rounded-md text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Kriteria:</label>
                    <select value={inputs.countifCriteria} onChange={(e) => setInputs({...inputs, countifCriteria: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm">
                      <option value=">10">Ada lebih dari 10 Stok (&gt;10)</option>
                      <option value="<15">Kurang dari 15 Stok (&lt;15)</option>
                      <option value=">=15">Minimal 15 Stok (&gt;=15)</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'SUMIF' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Rentang Cek (Kolom Harga):</label>
                    <input type="text" disabled value="C2:C5" className="w-full p-2 bg-slate-100 border border-slate-200 rounded-md text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Kriteria:</label>
                    <select value={inputs.sumifCriteria} onChange={(e) => setInputs({...inputs, sumifCriteria: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm">
                      <option value=">10000">Harga di atas 10rb (&gt;10000)</option>
                      <option value="<=12000">Harga maks 12rb (&lt;=12000)</option>
                    </select>
                  </div>
                  <p className="text-[9px] text-slate-400 italic">Keterangan: Menjumlahkan harga yang memenuhi kriteria.</p>
                </>
              )}

              {activeTab === 'COUNTIFS' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Kriteria 1 (Harga):</label>
                    <select value={inputs.countifsCrit1} onChange={(e) => setInputs({...inputs, countifsCrit1: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm">
                      <option value=">5000">Harga &gt; 5000</option>
                      <option value=">12000">Harga &gt; 12000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">DAN Kriteria 2 (Stok):</label>
                    <select value={inputs.countifsCrit2} onChange={(e) => setInputs({...inputs, countifsCrit2: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm">
                      <option value="<15">Stok &lt; 15</option>
                      <option value=">10">Stok &gt; 10</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'SUMIFS' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Rentang Jumlah (Stok):</label>
                    <input type="text" disabled value="D2:D5" className="w-full p-2 bg-slate-100 border border-slate-200 rounded-md text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Kriteria 1 (Harga):</label>
                    <select value={inputs.sumifsCrit1} onChange={(e) => setInputs({...inputs, sumifsCrit1: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm">
                      <option value=">10000">Harga &gt; 10rb</option>
                      <option value=">5000">Harga &gt; 5rb</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Kriteria 2 (Stok):</label>
                    <select value={inputs.sumifsCrit2} onChange={(e) => setInputs({...inputs, sumifsCrit2: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm">
                      <option value="<15">Stok &lt; 15</option>
                      <option value=">5">Stok &gt; 5</option>
                    </select>
                  </div>
                  <p className="text-[9px] text-slate-400 italic">Keterangan: Menjumlahkan Stok yang menunya mahal DAN stoknya sedikit.</p>
                </>
              )}

              {/* Simplified existing ones to save space */}
              {activeTab === 'INDEX' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Baris:</label>
                    <input type="number" value={inputs.indexRow} onChange={(e) => setInputs({...inputs, indexRow: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Kolom:</label>
                    <input type="number" value={inputs.indexCol} onChange={(e) => setInputs({...inputs, indexCol: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-mono" />
                  </div>
                </div>
              )}

              {activeTab === 'MATCH' && (
                <>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Data Dicari:</label>
                  <div className="relative">
                    <select value={inputs.matchValue} onChange={(e) => setInputs({...inputs, matchValue: e.target.value})} className="w-full p-2 bg-amber-50 border border-amber-200 rounded-md text-sm font-bold appearance-none">
                      {getMatchOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-amber-400 pointer-events-none" />
                  </div>
                </>
              )}
            </div>

            {/* Kotak Analisis Informatika */}
            <div className="mt-8 pt-6 border-t border-slate-100">
               <div className="bg-slate-900 p-5 rounded-xl border-l-4 border-yellow-400 shadow-lg">
                 <h4 className="text-white text-[11px] font-bold mb-2 flex items-center gap-2">
                   <Lightbulb className="w-3 h-3 text-yellow-400" /> Analisis Computational Thinking
                 </h4>
                 <div className="space-y-3 text-[10px] text-slate-300 leading-relaxed">
                    <p><span className="text-yellow-400 font-bold uppercase">Algoritma:</span> Langkah sistematis komputer mencari data: Mulai dari baris/kolom pertama → Cek kesesuaian → Berikan hasil.</p>
                    <p><span className="text-yellow-400 font-bold uppercase">Logika Matematika:</span> SUMIF dan COUNTIF menggunakan operator perbandingan (&gt;, &lt;, =) untuk memproses data secara otomatis berdasarkan kondisi.</p>
                    <p><span className="text-yellow-400 font-bold uppercase">Dekomposisi:</span> Memecah masalah (misal: "Berapa total stok barang mahal?") menjadi rentang kriteria, kriteria itu sendiri, dan rentang jumlah.</p>
                 </div>
               </div>
               
               <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <h4 className="text-blue-700 text-[10px] font-bold mb-1 uppercase tracking-tighter">Tantangan Praktikum:</h4>
                  <p className="text-[10px] text-blue-600 leading-relaxed">{getFormulaInfo().desc}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
