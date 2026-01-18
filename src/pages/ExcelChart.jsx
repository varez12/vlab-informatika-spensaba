import React, { useState, useMemo, useRef } from 'react';
import {
    FileSpreadsheet,
    BarChart3,
    PieChart,
    LineChart,
    Grid3X3,
    Search,
    Plus,
    MousePointer2,
    ChevronDown,
    HelpCircle,
    BookOpen,
    ChevronRight,
    X,
    Check,
    LayoutGrid,
    Settings2,
    Filter,
    ArrowUpDown,
    GalleryHorizontalEnd,
    GalleryHorizontalEnd,
    Download,
    Trophy
} from 'lucide-react';
import QuizMode, { excelChartQuizQuestions } from '../components/QuizMode';

const ExcelChart = () => {
    // Data Spreadsheet
    const [data, setData] = useState([
        { label: 'Januari', value: 45 },
        { label: 'Februari', value: 52 },
        { label: 'Maret', value: 38 },
        { label: 'April', value: 65 },
        { label: 'Mei', value: 48 },
    ]);

    // UI States
    const [activeTab, setActiveTab] = useState('Insert');
    const [isDataSelected, setIsDataSelected] = useState(false);
    const [chartType, setChartType] = useState(null);
    const [zoom, setZoom] = useState(100); // Zoom State
    const [guideOpen, setGuideOpen] = useState(false); // Guide Drawer State
    const [selectedCell, setSelectedCell] = useState(null); // { row: 0, col: 0 }
    const [showQuiz, setShowQuiz] = useState(false); // Quiz State

    const handleCellChange = (index, newValue) => {
        const newData = [...data];
        newData[index].value = parseInt(newValue) || 0;
        setData(newData);
    };

    const handleLabelChange = (index, newLabel) => {
        const newData = [...data];
        newData[index].label = newLabel;
        setData(newData);
    };

    // Fungsi sakti untuk memunculkan grafik
    const handleSelectChart = (type) => {
        if (!isDataSelected) {
            alert("⚠️ Harap blok dulu area data (Tabel) yang ingin dibuat grafiknya!\n\nKlik tombol segitiga di pojok kiri atas tabel untuk memblok data.");
            return;
        }
        setChartType(type);
    };

    const maxVal = useMemo(() => Math.max(...data.map(d => d.value), 10), [data]);

    // Custom Tooltip Component (Matched with WordPageLayout)
    const SimTooltip = ({ content, children }) => {
        const [show, setShow] = useState(false);
        return (
            <div className="relative flex flex-col items-center"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                {/* Tooltip Popup */}
                {show && (
                    <div className="absolute top-full mt-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl z-50 animate-in fade-in zoom-in-95 leading-tight text-center pointer-events-none after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-slate-800">
                        {content}
                    </div>
                )}
                {children}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-white font-sans text-slate-800 overflow-y-auto">

            {/* --- HEADER (Green Bar) --- */}
            <header className="bg-[#217346] text-white px-4 py-1.5 flex justify-between items-center z-30 shadow-sm relative">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1 rounded">
                        <FileSpreadsheet size={18} />
                    </div>
                    <h1 className="text-sm font-semibold tracking-wide uppercase">Fitur Chart & Visualisasi</h1>
                </div>
                <div className="text-[10px] font-mono opacity-70 hidden md:block"></div>
                <div className="flex items-center gap-5 opacity-80 text-xs">
                    <div className="flex gap-4">
                        <span className="cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">—</span>
                        <span className="cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded">▢</span>
                        <span className="cursor-pointer hover:bg-red-500/50 px-2 py-0.5 rounded">✕</span>
                    </div>
                </div>
            </header>

            {/* --- EXCEL NAVIGATION & RIBBON --- */}
            <nav className="bg-white border-b border-slate-200 z-20">
                <div className="flex text-sm px-4 bg-white border-b border-slate-100">
                    {['File', 'Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'View'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 border-b-2 transition-colors ${activeTab === tab
                                ? 'border-[#217346] text-[#217346] font-semibold bg-slate-50'
                                : 'border-transparent hover:bg-slate-50 text-slate-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Ribbon Toolbar (Visible only for Insert to save space/context) */}
                <div className="bg-[#f8f9fa] border-b border-slate-200 min-h-[90px] p-2 flex items-center overflow-x-auto">
                    {activeTab === 'Insert' ? (
                        <div className="flex items-center gap-2 h-full animate-in fade-in slide-in-from-top-1">
                            {/* Tables Group */}
                            <div className="flex flex-col items-center px-4 border-r border-[#d2d0ce]">
                                <div className="p-2 text-[#217346] opacity-40 hover:bg-white hover:shadow-sm rounded cursor-not-allowed">
                                    <Grid3X3 size={24} />
                                </div>
                                <span className="text-[10px] text-[#605e5d] mt-1">Table</span>
                            </div>

                            {/* Charts Group */}
                            <div className="flex items-center gap-2 px-4">
                                <SimTooltip content="Column Chart: Cocok untuk membandingkan nilai antar kategori.">
                                    <button
                                        onClick={() => handleSelectChart('column')}
                                        className={`flex flex-col items-center p-2 rounded hover:bg-white hover:shadow-sm transition-all group ${chartType === 'column' ? 'bg-white shadow ring-1 ring-[#217346]' : ''}`}
                                    >
                                        <BarChart3 size={24} className={chartType === 'column' ? 'text-[#217346]' : 'text-slate-600'} />
                                        <span className="text-[11px] mt-1 text-slate-600">Column</span>
                                    </button>
                                </SimTooltip>

                                <SimTooltip content="Line Chart: Ideal untuk melihat tren data dari waktu ke waktu.">
                                    <button
                                        onClick={() => handleSelectChart('line')}
                                        className={`flex flex-col items-center p-2 rounded hover:bg-white hover:shadow-sm transition-all group ${chartType === 'line' ? 'bg-white shadow ring-1 ring-blue-500' : ''}`}
                                    >
                                        <LineChart size={24} className={chartType === 'line' ? 'text-blue-600' : 'text-slate-600'} />
                                        <span className="text-[11px] mt-1 text-slate-600">Line</span>
                                    </button>
                                </SimTooltip>

                                <SimTooltip content="Pie Chart: Terbaik untuk proporsi persentase.">
                                    <button
                                        onClick={() => handleSelectChart('pie')}
                                        className={`flex flex-col items-center p-2 rounded hover:bg-white hover:shadow-sm transition-all group ${chartType === 'pie' ? 'bg-white shadow ring-1 ring-orange-500' : ''}`}
                                    >
                                        <PieChart size={24} className={chartType === 'pie' ? 'text-orange-600' : 'text-slate-600'} />
                                        <span className="text-[11px] mt-1 text-slate-600">Pie</span>
                                    </button>
                                </SimTooltip>

                                <SimTooltip content="Bar Chart: Grafik batang horizontal.">
                                    <button
                                        onClick={() => handleSelectChart('bar')}
                                        className={`flex flex-col items-center p-2 rounded hover:bg-white hover:shadow-sm transition-all group ${chartType === 'bar' ? 'bg-white shadow ring-1 ring-purple-500' : ''}`}
                                    >
                                        <GalleryHorizontalEnd size={24} className={chartType === 'bar' ? 'text-purple-600' : 'text-slate-600'} />
                                        <span className="text-[11px] mt-1 text-slate-600">Bar</span>
                                    </button>
                                </SimTooltip>

                                <div className="ml-2 border-l border-[#d2d0ce] pl-4 flex flex-col justify-center h-full">
                                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                        Charts <ChevronDown size={10} />
                                    </div>
                                    <p className="text-[9px] text-slate-500 w-20 leading-tight">Pilih visualisasi data.</p>
                                    <p className="text-[9px] text-slate-500 w-20 leading-tight">Pilih visualisasi data.</p>
                                </div>
                            </div>
                            {/* Quiz Button */}
                            <div className="flex items-center gap-2 px-4 border-l border-[#d2d0ce]">
                                <button
                                    onClick={() => setShowQuiz(true)}
                                    className="flex flex-col items-center p-2 rounded hover:bg-white hover:shadow-sm transition-all group bg-yellow-50"
                                >
                                    <Trophy size={24} className="text-yellow-600" />
                                    <span className="text-[11px] mt-1 text-slate-700 font-bold">Kuis</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 text-slate-400 text-sm px-6 italic">
                            Fitur menu {activeTab} tidak tersedia dalam mode demo ini. Silakan gunakan menu <strong>Insert</strong>.
                        </div>
                    )}
                </div>
            </nav>

            {/* --- FORMULA BAR --- */}
            <div className="bg-white border-b border-slate-300 flex items-center p-1.5 gap-2 z-10 shadow-sm sticky top-0">
                {/* Name Box */}
                <div className="w-10 h-6 bg-white border border-slate-300 flex items-center justify-center text-xs font-medium text-slate-700 shadow-inner relative group cursor-default">
                    {selectedCell ? `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row}` : 'A1'}
                    <div className="absolute inset-0 ring-1 ring-transparent group-hover:ring-slate-400 rounded-sm pointer-events-none"></div>
                </div>

                {/* Divider & Icons */}
                <div className="flex items-center gap-1.5 text-slate-400 px-1 border-r border-slate-300 mr-1">
                    <X size={12} className="hover:bg-slate-200 hover:text-red-500 rounded cursor-pointer transition-colors" />
                    <Check size={12} className="hover:bg-slate-200 hover:text-green-500 rounded cursor-pointer transition-colors" />
                    <span className="font-serif italic font-bold text-xs text-slate-600 cursor-pointer hover:bg-slate-200 px-1 rounded transition-colors">fx</span>
                </div>

                {/* Formula Input */}
                <div className="flex-1 h-6 relative">
                    <input
                        type="text"
                        readOnly
                        value={isDataSelected ? `=CHART(${chartType || '...'}, A2:B${data.length + 1})` : selectedCell ? 'Value' : ''}
                        placeholder="Pilih data atau insert chart..."
                        className="w-full h-full border-none focus:ring-0 text-xs font-mono text-slate-800 bg-transparent"
                    />
                </div>
            </div>

            {/* --- MAIN SPREADSHEET AREA --- */}
            <main className="flex flex-col relative bg-[#E6E6E6] flex-1 overflow-hidden">
                <div className="relative custom-scrollbar overflow-auto">

                    {/* Zoomable Container */}
                    <div
                        className="bg-white shadow-xl origin-top-left transition-transform duration-200 ease-out inline-block min-w-full"
                        style={{ transform: `scale(${zoom / 100})`, width: `${100 * (100 / zoom)}%` }}
                    >
                        <table className="w-full border-collapse bg-white table-fixed">
                            <colgroup>
                                <col className="w-10 bg-[#F8F9FA] border-r border-slate-300" /> {/* Row Numbers */}
                                <col className="w-24" /> {/* A - Kategori */}
                                <col className="w-20" /> {/* B - Nilai */}
                                <col style={{ width: '200px' }} className="border-r border-slate-300" /> {/* C */}
                                <col style={{ width: '200px' }} className="border-r border-slate-300" /> {/* D */}
                                <col className="w-full" /> {/* Remaining */}
                            </colgroup>

                            <thead className="bg-[#E6E6E6] sticky top-0 z-20 shadow-sm">
                                {/* SYSTEM HEADERS (A, B, C...) */}
                                <tr>
                                    <th
                                        className="h-6 border border-slate-300 bg-[#E6E6E6] relative text-center cursor-pointer hover:bg-slate-300 transition-colors group"
                                        onClick={() => setIsDataSelected(!isDataSelected)}
                                        title="Klik untuk blok seluruh tabel"
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                            <svg width="10" height="10" viewBox="0 0 10 10">
                                                <path d="M10 10 L0 10 L10 0 Z" fill={isDataSelected ? "#217346" : "#666"} />
                                            </svg>
                                        </div>
                                    </th>
                                    {['A', 'B', 'C', 'D'].map((col) => (
                                        <th key={col} className="border border-slate-300 bg-[#E6E6E6] text-slate-700 font-normal hover:bg-[#D4D4D4] transition-colors text-xs h-6">
                                            {col}
                                        </th>
                                    ))}
                                    <th className="border border-slate-300 bg-[#E6E6E6]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Row 1: Headers */}
                                <tr>
                                    <td className="h-6 border border-slate-300 bg-[#F8F9FA] text-slate-500 font-mono text-center text-xs">1</td>
                                    <td className="border border-slate-300 px-2 py-1 bg-slate-50 font-bold text-xs text-slate-700" onClick={() => { setSelectedCell({ row: 1, col: 0 }); setIsDataSelected(true); }}>Kategori</td>
                                    <td className="border border-slate-300 px-2 py-1 bg-slate-50 font-bold text-xs text-slate-700 text-right" onClick={() => { setSelectedCell({ row: 1, col: 1 }); setIsDataSelected(true); }}>Jumlah</td>
                                    <td className="border border-slate-300 bg-white"></td>
                                    <td className="border border-slate-300 bg-white"></td>
                                    <td className="border border-slate-300 bg-white"></td>
                                </tr>

                                {/* Data Rows */}
                                {data.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 group">
                                        <td className="h-6 border border-slate-300 bg-[#F8F9FA] text-slate-500 font-mono text-center text-xs">{idx + 2}</td>

                                        {/* Kategori Input */}
                                        <td className="border border-slate-300 p-0 relative" onClick={() => { setSelectedCell({ row: idx + 2, col: 0 }); setIsDataSelected(true); }}>
                                            <input
                                                className="w-full h-full px-2 py-1 text-xs border-none focus:ring-2 focus:ring-[#217346] focus:ring-inset bg-transparent"
                                                value={item.label}
                                                onChange={(e) => handleLabelChange(idx, e.target.value)}
                                            />
                                        </td>

                                        {/* Value Input */}
                                        <td className="border border-slate-300 p-0 relative" onClick={() => { setSelectedCell({ row: idx + 2, col: 1 }); setIsDataSelected(true); }}>
                                            <input
                                                className="w-full h-full px-2 py-1 text-xs border-none focus:ring-2 focus:ring-[#217346] focus:ring-inset bg-transparent text-right font-mono"
                                                value={item.value}
                                                onChange={(e) => handleCellChange(idx, e.target.value)}
                                            />
                                        </td>

                                        <td className="border border-slate-300 bg-white"></td>
                                        <td className="border border-slate-300 bg-white"></td>
                                        <td className="border border-slate-300 bg-white"></td>
                                    </tr>
                                ))}

                                {/* Empty Rows */}
                                {[...Array(8)].map((_, i) => (
                                    <tr key={`empty-${i}`}>
                                        <td className="h-6 border border-slate-300 bg-[#F8F9FA] text-slate-500 font-mono text-center text-xs">{data.length + 2 + i}</td>
                                        <td className="border border-slate-300 bg-white"></td>
                                        <td className="border border-slate-300 bg-white"></td>
                                        <td className="border border-slate-300 bg-white"></td>
                                        <td className="border border-slate-300 bg-white"></td>
                                        <td className="border border-slate-300 bg-white"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* SELECTION OVERLAY (Visual Green Box) */}
                        {isDataSelected && (
                            <div className="absolute top-[25px] left-[40px] w-[320px] h-[155px] border-2 border-[#217346] bg-[#217346]/10 pointer-events-none z-10 animate-in fade-in zoom-in-95 duration-100">
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#217346] border border-white"></div>
                            </div>
                        )}

                        {/* CHART OVERLAY (Floating) */}
                        {chartType && isDataSelected && (
                            <div className="absolute top-[80px] left-[380px] bg-white border border-slate-300 shadow-xl p-4 rounded-sm min-w-[400px] z-50 animate-in fade-in zoom-in duration-200">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2 drag-handle cursor-move">
                                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                        <BarChart3 size={14} /> Chart Object
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => alert("📸 Chart diekspor sebagai 'chart_export.png'")}
                                            className="hover:bg-slate-100 text-slate-500 hover:text-green-600 p-1 rounded transition-colors"
                                            title="Export Chart"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={() => setChartType(null)}
                                            className="hover:bg-red-50 text-gray-400 hover:text-red-500 w-5 h-5 rounded flex items-center justify-center transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-center font-bold text-slate-800 mb-2 text-sm">Grafik Penjualan Bulanan</h3>
                                <div className="h-56 relative flex items-center justify-center bg-white">
                                    {/* Reuse existing SVG Logic */}
                                    {chartType === 'column' && (
                                        <svg width="100%" height="100%" viewBox="0 0 400 250" className="overflow-visible">
                                            <line x1="40" y1="220" x2="380" y2="220" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="40" y1="20" x2="40" y2="220" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="40" y1="120" x2="380" y2="120" stroke="#e2e8f0" strokeDasharray="4" />
                                            <line x1="40" y1="70" x2="380" y2="70" stroke="#e2e8f0" strokeDasharray="4" />
                                            {data.map((item, i) => {
                                                const max = Math.max(...data.map(d => d.value)) * 1.2;
                                                const barH = (item.value / max) * 200;
                                                const x = 60 + (i * 65);
                                                const y = 220 - barH;
                                                return (
                                                    <g key={i}>
                                                        <rect x={x} y={y} width="40" height={barH} fill="#2f75b5" className="hover:fill-[#1f4e79] transition-colors" rx="2" />
                                                        <text x={x + 20} y={y - 5} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">{item.value}</text>
                                                        <text x={x + 20} y={235} textAnchor="middle" fontSize="10" fill="#666">{item.label}</text>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    )}
                                    {chartType === 'line' && (
                                        <svg width="100%" height="100%" viewBox="0 0 400 250">
                                            <line x1="40" y1="220" x2="380" y2="220" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="40" y1="20" x2="40" y2="220" stroke="#cbd5e1" strokeWidth="2" />
                                            <path
                                                d={data.map((item, i) => {
                                                    const max = Math.max(...data.map(d => d.value)) * 1.2;
                                                    const x = 60 + (i * 65) + 20;
                                                    const y = 220 - ((item.value / max) * 200);
                                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                                }).join(' ')}
                                                fill="none" stroke="#d83b01" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                                            />
                                            {data.map((item, i) => {
                                                const max = Math.max(...data.map(d => d.value)) * 1.2;
                                                const x = 60 + (i * 65) + 20;
                                                const y = 220 - ((item.value / max) * 200);
                                                return (
                                                    <g key={i}>
                                                        <circle cx={x} cy={y} r="4" fill="white" stroke="#d83b01" strokeWidth="2" />
                                                        <text x={x} y={235} textAnchor="middle" fontSize="10" fill="#666">{item.label}</text>
                                                        <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">{item.value}</text>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    )}
                                    {chartType === 'pie' && (
                                        <svg width="100%" height="100%" viewBox="0 0 300 250">
                                            <g transform="translate(150, 125)">
                                                {(() => {
                                                    const total = data.reduce((a, b) => a + b.value, 0);
                                                    let acc = 0;
                                                    const colors = ['#2f75b5', '#d83b01', '#107c10', '#a4262c', '#8764b8'];
                                                    return data.map((item, i) => {
                                                        const val = (item.value / total) * 360;
                                                        const startA = acc;
                                                        const endA = startA + val;
                                                        acc += val;
                                                        const r = 80;
                                                        const x1 = r * Math.cos(Math.PI * (startA - 90) / 180);
                                                        const y1 = r * Math.sin(Math.PI * (startA - 90) / 180);
                                                        const x2 = r * Math.cos(Math.PI * (endA - 90) / 180);
                                                        const y2 = r * Math.sin(Math.PI * (endA - 90) / 180);
                                                        const largeArc = val > 180 ? 1 : 0;
                                                        const d = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                                                        const midA = startA + val / 2;
                                                        const lx = (r + 20) * Math.cos(Math.PI * (midA - 90) / 180);
                                                        const ly = (r + 20) * Math.sin(Math.PI * (midA - 90) / 180); // Fixed ly
                                                        return (
                                                            <g key={i}>
                                                                <path d={d} fill={colors[i % colors.length]} stroke="white" strokeWidth="1" className="hover:opacity-80 transition-opacity" />
                                                                <text x={lx} y={ly} textAnchor="middle" fontSize="9" fill="#333" fontWeight="bold">{item.label}</text>
                                                            </g>
                                                        );
                                                    })
                                                })()}
                                            </g>
                                        </svg>
                                    )}
                                    {chartType === 'bar' && (
                                        <svg width="100%" height="100%" viewBox="0 0 400 250">
                                            <line x1="40" y1="220" x2="40" y2="20" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="40" y1="220" x2="380" y2="220" stroke="#cbd5e1" strokeWidth="2" />
                                            {data.map((item, i) => {
                                                const max = Math.max(...data.map(d => d.value)) * 1.2;
                                                const barW = (item.value / max) * 340;
                                                const y = 40 + (i * 35);
                                                return (
                                                    <g key={i}>
                                                        <rect x="41" y={y} width={barW} height="20" fill="#8764b8" className="hover:fill-[#6e4e9e] transition-colors" rx="2" />
                                                        <text x="35" y={y + 14} textAnchor="end" fontSize="10" fill="#666">{item.label}</text>
                                                        <text x={45 + barW} y={y + 14} textAnchor="start" fontSize="10" fontWeight="bold" fill="#333">{item.value}</text>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Instruction Bubble (If no chart yet) */}
                        {!chartType && !isDataSelected && (
                            <div className="absolute top-10 left-[220px] bg-yellow-50 border border-yellow-200 p-4 rounded shadow-md z-40 max-w-xs animate-bounce cursor-pointer" onClick={() => setIsDataSelected(true)}>
                                <div className="flex gap-3 items-start">
                                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-600"><MousePointer2 size={18} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-yellow-800">Langkah 1: Blok Data</p>
                                        <p className="text-[10px] text-yellow-600 mt-1">Klik pojok kiri atas tabel (segitiga abu-abu) untuk memblok seluruh data sebelum membuat grafik.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* --- STATUS BAR (Header Style) --- */}
                <div className="bg-[#217346] text-white text-[10px] px-4 py-1.5 flex items-center justify-between z-50 shadow-sm border-t border-[#1e6b41] overflow-hidden">
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="font-bold uppercase tracking-wider">READY</div>
                        <div className="flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer">
                            <FileSpreadsheet size={10} />
                            <span>Page 1 of 1</span>
                        </div>
                        <div className="opacity-80">
                            {data.length} data points
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 mr-2 opacity-80">
                            <button className="p-0.5 hover:bg-white/20 rounded"><LayoutGrid size={12} /></button>
                            <button className="p-0.5 hover:bg-white/20 rounded"><Settings2 size={12} /></button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="hover:bg-white/20 rounded p-0.5"> - </button>
                            <input
                                type="range"
                                min="50"
                                max="200"
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="hover:bg-white/20 rounded p-0.5"> + </button>
                            <span className="w-8 text-right font-mono">{zoom}%</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- FAB GUIDE --- */}
            <button
                onClick={() => setGuideOpen(true)}
                className="absolute bottom-10 right-6 z-50 bg-[#217346] hover:bg-[#1e6b41] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 animate-in zoom-in slide-in-from-bottom-4 duration-500"
                title="Buka Panduan"
            >
                <HelpCircle size={24} />
            </button>

            {/* --- DRAWER --- */}
            {guideOpen && (
                <div className="absolute inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setGuideOpen(false)} />
                    <div className="w-[350px] bg-white h-full shadow-2xl border-l border-gray-200 relative animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#217346] text-white">
                            <h3 className="font-bold flex items-center gap-2"><BookOpen size={18} /> Panduan Praktik</h3>
                            <button onClick={() => setGuideOpen(false)} className="hover:bg-white/20 p-1 rounded"><ChevronRight size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-slate-700">
                            <div className="space-y-2">
                                <h4 className="font-bold text-[#217346] text-sm uppercase tracking-wider border-b pb-1 border-gray-100">Step 1: Input Data</h4>
                                <p className="text-xs opacity-80">Isi data pada tabel. Klik kolom Kategori atau Jumlah untuk mengedit.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-[#217346] text-sm uppercase tracking-wider border-b pb-1 border-gray-100">Step 2: Blok Data</h4>
                                <p className="text-xs opacity-80">Klik tombol segitiga di pojok kanan atas untuk memblok tabel.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-[#217346] text-sm uppercase tracking-wider border-b pb-1 border-gray-100">Step 3: Insert Chart</h4>
                                <p className="text-xs opacity-80">Pergi ke menu <strong>Insert</strong> dan pilih jenis grafik (Column, Line, Pie, Bar).</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded text-xs text-green-800 border border-green-200">
                                Tips: Gunakan tombol Export (gbr. unduh) di atas grafik untuk menyimpan hasil.
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Quiz Mode */}
            {showQuiz && (
                <QuizMode
                    moduleId="excel_chart"
                    moduleName="Microsoft Excel: Chart & Visualisasi"
                    questions={excelChartQuizQuestions}
                    onClose={() => setShowQuiz(false)}
                />
            )}
        </div>
    );
};

export default ExcelChart;