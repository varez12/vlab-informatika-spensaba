import React, { useState, useMemo } from 'react';
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
    HelpCircle
} from 'lucide-react';

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
        setIsDataSelected(true); // Auto-select data agar grafik langsung muncul
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
        <div className="flex flex-col h-screen bg-[#f3f2f1] font-sans overflow-hidden text-[#323130]">

            {/* AREA KERJA UTAMA (EXCEL UI) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Branding Bar */}
                <div className="bg-[#1D6F42] text-white px-3 py-1.5 flex items-center justify-between text-xs shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-0.5 bg-white/10 rounded">
                            <FileSpreadsheet size={16} />
                        </div>
                        <span className="font-semibold tracking-wide">Book1.xlsx - Excel Virtual</span>
                    </div>
                    <div className="flex items-center gap-5 opacity-80">
                        <Search size={14} />
                        <span>?</span>
                        <div className="flex gap-4 ml-2">
                            <span>—</span>
                            <span>▢</span>
                            <span className="text-red-200">✕</span>
                        </div>
                    </div>
                </div>

                {/* Ribbon Menu Tabs */}
                <div className="bg-[#1D6F42] flex text-[13px] px-2 shadow-sm z-10">
                    {['File', 'Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 transition-all ${activeTab === tab
                                ? 'bg-[#f3f2f1] text-[#1D6F42] font-semibold rounded-t-sm'
                                : 'text-white hover:bg-[#165a35]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Ribbon Tools Container */}
                <div className="bg-[#f3f2f1] border-b border-[#d2d0ce] p-2 flex items-center gap-1 min-h-[95px] shadow-sm relative z-20 overflow-visible">
                    {activeTab === 'Insert' ? (
                        <div className="flex items-center gap-1 h-full animate-in fade-in slide-in-from-top-2">
                            {/* Tables Group */}
                            <div className="flex flex-col items-center px-4 border-r border-[#d2d0ce]">
                                <div className="p-2 text-[#1D6F42] opacity-40 hover:bg-white hover:shadow-sm rounded cursor-not-allowed">
                                    <Grid3X3 size={28} />
                                </div>
                                <span className="text-[10px] text-[#605e5d] mt-1">Table</span>
                            </div>

                            {/* Charts Group */}
                            <div className="flex items-center gap-1 px-4">
                                <SimTooltip content="Column Chart: Cocok untuk membandingkan nilai antar kategori (Contoh: Penjualan per Bulan).">
                                    <button
                                        onClick={() => handleSelectChart('column')}
                                        className={`flex flex-col items-center p-2 rounded-md transition-all group ${chartType === 'column' ? 'bg-white shadow-md ring-1 ring-[#1D6F42]/20' : 'hover:bg-white hover:shadow-sm'
                                            }`}
                                    >
                                        <BarChart3 size={30} className="text-[#1D6F42]" />
                                        <span className="text-[10px] mt-1 font-medium group-hover:text-[#1D6F42]">Column</span>
                                    </button>
                                </SimTooltip>

                                <SimTooltip content="Line Chart: Ideal untuk melihat tren data dari waktu ke waktu.">
                                    <button
                                        onClick={() => handleSelectChart('line')}
                                        className={`flex flex-col items-center p-2 rounded-md transition-all group ${chartType === 'line' ? 'bg-white shadow-md ring-1 ring-blue-300' : 'hover:bg-white hover:shadow-sm'
                                            }`}
                                    >
                                        <LineChart size={30} className="text-[#0078d4]" />
                                        <span className="text-[10px] mt-1 font-medium group-hover:text-blue-600">Line</span>
                                    </button>
                                </SimTooltip>

                                <SimTooltip content="Pie Chart: Terbaik untuk menampilkan proporsi atau persentase dari keseluruhan.">
                                    <button
                                        onClick={() => handleSelectChart('pie')}
                                        className={`flex flex-col items-center p-2 rounded-md transition-all group ${chartType === 'pie' ? 'bg-white shadow-md ring-1 ring-orange-200' : 'hover:bg-white hover:shadow-sm'
                                            }`}
                                    >
                                        <PieChart size={30} className="text-[#d83b01]" />
                                        <span className="text-[10px] mt-1 font-medium group-hover:text-orange-700">Pie</span>
                                    </button>
                                </SimTooltip>

                                <div className="ml-4 border-l border-[#d2d0ce] pl-4 h-12 flex flex-col justify-center">
                                    <div className="text-[11px] font-bold text-[#323130] flex items-center gap-1 leading-none mb-1">
                                        Charts <ChevronDown size={12} />
                                    </div>
                                    <p className="text-[9px] text-[#605e5d] w-24 leading-tight italic">Pilih jenis grafik untuk visualisasi data.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 text-[#a19f9d] text-sm px-6 italic">
                            Fitur menu {activeTab} terkunci. Silakan gunakan menu <strong>Insert</strong>.
                        </div>
                    )}
                </div>

                {/* Formula Bar */}
                <div className="bg-white border-b border-[#d2d0ce] flex items-center h-8 text-xs shrink-0">
                    <div className="w-12 border-r border-[#d2d0ce] text-center font-medium text-[#605e5d]">A1</div>
                    <div className="px-2 text-[#a19f9d] border-r border-[#d2d0ce] italic px-3 font-bold">fx</div>
                    <div className="flex-1 px-3 text-[#323130] font-mono">
                        {isDataSelected ? `=SUM(B2:B${data.length + 1})` : ''}
                    </div>
                </div>

                {/* Spreadsheet Area (Zoomable) */}
                <div className="flex-1 overflow-auto bg-[#e1dfdd] relative p-0 custom-scrollbar min-h-[300px]">
                    <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', minWidth: `${100 * (100 / zoom)}%`, minHeight: `${100 * (100 / zoom)}%` }}>

                        {/* Main Grid View */}
                        <div className="inline-block bg-white shadow-sm min-w-full lg:min-w-0">
                            {/* Headers */}
                            <div className="flex select-none">
                                <div className="w-10 h-6 bg-[#f3f2f1] border-r border-b border-[#d2d0ce] flex items-center justify-center">
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#a19f9d] rotate-45 transform translate-x-1 translate-y-1"></div>
                                </div>
                                <div className="w-40 h-6 bg-[#f3f2f1] border-r border-b border-[#d2d0ce] text-center text-[11px] text-[#605e5d] leading-6 font-medium">A</div>
                                <div className="w-28 h-6 bg-[#f3f2f1] border-r border-b border-[#d2d0ce] text-center text-[11px] text-[#605e5d] leading-6 font-medium">B</div>
                                <div className="flex-1 h-6 bg-[#f3f2f1] border-b border-[#d2d0ce]"></div>
                            </div>

                            {/* Row 1 (Header Tabel) */}
                            <div className="flex">
                                <div className="w-10 h-6 bg-[#f3f2f1] border-r border-b border-[#d2d0ce] text-center text-[11px] text-[#605e5d] leading-6 font-medium">1</div>
                                <div className="w-40 h-6 border-r border-b border-[#d2d0ce] px-2 text-[12px] font-bold bg-gray-50">Kategori</div>
                                <div className="w-28 h-6 border-r border-b border-[#d2d0ce] px-2 text-[12px] font-bold bg-gray-50 text-right">Jumlah</div>
                                <div className="flex-1 h-6 border-b border-[#d2d0ce]"></div>
                            </div>

                            {/* Data Rows */}
                            <div className="relative" onClick={() => setIsDataSelected(true)}>
                                {data.map((item, idx) => (
                                    <div key={idx} className="flex group">
                                        <div className="w-10 h-6 bg-[#f3f2f1] border-r border-b border-[#d2d0ce] text-center text-[11px] text-[#605e5d] leading-6 font-medium">{idx + 2}</div>
                                        <div className="w-40 h-6 border-r border-b border-[#d2d0ce] relative">
                                            <input
                                                className="w-full h-full px-2 outline-none text-[12px] focus:ring-2 focus:ring-[#1D6F42] focus:z-10"
                                                value={item.label}
                                                onChange={(e) => handleLabelChange(idx, e.target.value)}
                                            />
                                        </div>
                                        <div className="w-28 h-6 border-r border-b border-[#d2d0ce] relative">
                                            <input
                                                className="w-full h-full px-2 outline-none text-[12px] text-right font-mono focus:ring-2 focus:ring-[#1D6F42] focus:z-10"
                                                value={item.value}
                                                onChange={(e) => handleCellChange(idx, e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1 h-6 border-b border-[#d2d0ce]"></div>
                                    </div>
                                ))}

                                {/* Excel "Selection" Overlay */}
                                {isDataSelected && (
                                    <div className="absolute top-0 left-10 w-[17.1rem] h-full border-2 border-[#1D6F42] bg-[#1D6F42]/10 pointer-events-none">
                                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1D6F42] border border-white"></div>
                                    </div>
                                )}
                            </div>

                            {/* Empty Rows */}
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex">
                                    <div className="w-10 h-6 bg-[#f3f2f1] border-r border-b border-[#d2d0ce] text-center text-[11px] text-[#605e5d] leading-6 font-medium">{data.length + i + 2}</div>
                                    <div className="w-40 h-6 border-r border-b border-[#d2d0ce]"></div>
                                    <div className="w-28 h-6 border-r border-b border-[#d2d0ce]"></div>
                                    <div className="flex-1 h-6 border-b border-[#d2d0ce]"></div>
                                </div>
                            ))}
                        </div>

                        {/* CHART OBJECT (Hybrid: Flow on Mobile, Float on Desktop) */}
                        {chartType && isDataSelected && (
                            <div className="mt-8 mx-auto md:mx-0 md:mt-0 md:absolute md:top-10 md:left-[380px] bg-white border border-[#d2d0ce] shadow-2xl p-6 rounded-sm min-w-[300px] md:min-w-[450px] animate-in fade-in zoom-in duration-300 z-[100]">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                                    <span className="text-[11px] font-bold text-[#605e5d] flex items-center gap-2 italic">
                                        <BarChart3 size={14} /> Chart Area
                                    </span>
                                    <button
                                        onClick={() => setChartType(null)}
                                        className="hover:bg-red-50 text-gray-300 hover:text-red-500 w-6 h-6 rounded flex items-center justify-center transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <h3 className="text-center font-bold text-gray-800 mb-4 text-sm">Grafik Penjualan Bulanan</h3>

                                {/* SVG CHART RENDERING */}
                                <div className="h-64 relative flex items-center justify-center bg-white">
                                    {chartType === 'column' && (
                                        <svg width="100%" height="100%" viewBox="0 0 400 250" className="overflow-visible">
                                            {/* Axes */}
                                            <line x1="40" y1="220" x2="380" y2="220" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="40" y1="20" x2="40" y2="220" stroke="#cbd5e1" strokeWidth="2" />

                                            {/* Guide Lines */}
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
                                            {/* Axes */}
                                            <line x1="40" y1="220" x2="380" y2="220" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="40" y1="20" x2="40" y2="220" stroke="#cbd5e1" strokeWidth="2" />

                                            {/* Path */}
                                            <path
                                                d={data.map((item, i) => {
                                                    const max = Math.max(...data.map(d => d.value)) * 1.2;
                                                    const x = 60 + (i * 65) + 20; // center of col
                                                    const y = 220 - ((item.value / max) * 200);
                                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                                }).join(' ')}
                                                fill="none"
                                                stroke="#d83b01"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />

                                            {/* Points */}
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

                                                        // Label pos
                                                        const midA = startA + val / 2;
                                                        const lx = (r + 20) * Math.cos(Math.PI * (midA - 90) / 180);
                                                        const ly = (r + 20) * Math.sin(Math.PI * (midA - 90) / 180);

                                                        return (
                                                            <g key={i}>
                                                                <path d={d} fill={colors[i % colors.length]} stroke="white" strokeWidth="1" className="hover:opacity-80 transition-opacity" />
                                                                <text x={lx} y={ly} textAnchor="middle" fontSize="9" fill="#333" fontWeight="bold">{item.label}</text>
                                                            </g>
                                                        );
                                                    })
                                                })()}
                                            </g>
                                            {/* Legend Right */}
                                            <g transform="translate(250, 50)">
                                                {data.map((item, i) => (
                                                    <g key={i} transform={`translate(0, ${i * 15})`}>
                                                        <rect width="8" height="8" fill={['#2f75b5', '#d83b01', '#107c10', '#a4262c', '#8764b8'][i % 5]} rx="1" />
                                                        <text x="12" y="7" fontSize="8" fill="#666">{item.label}</text>
                                                    </g>
                                                ))}
                                            </g>
                                        </svg>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty Instruction State */}
                        {!chartType && isDataSelected && (
                            <div className="absolute top-20 left-[400px] bg-blue-50 border-2 border-dashed border-blue-200 p-8 rounded-lg flex flex-col items-center text-blue-400 max-w-xs text-center shadow-sm">
                                <MousePointer2 size={40} className="mb-4 opacity-30 animate-bounce" />
                                <p className="text-sm font-bold text-blue-700">Data Sudah Diblok!</p>
                                <p className="text-xs mt-1">Sekarang, klik menu <strong>Insert</strong> di atas dan pilih ikon grafik yang kamu suka.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Bar (Gray Style like WordPageLayout) */}
                <footer className="bg-[#f3f3f3] text-slate-600 px-4 py-1 flex items-center justify-between z-30 relative shadow-md border-t border-[#d2d0ce]">
                    <div className="flex gap-6 items-center uppercase tracking-wider font-medium text-[11px]">
                        <span className="hover:bg-[#e0e0e0] px-2 py-0.5 rounded cursor-default">Ready</span>
                        <span className="flex items-center gap-1 hover:bg-[#e0e0e0] px-1 rounded cursor-pointer"><MousePointer2 size={10} /> Selection: A2:B6</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Zoom Controls (Gray Style) */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setZoom(z => Math.max(z - 10, 50))}
                                className="text-slate-500 hover:bg-[#d0d0d0] font-bold rounded px-2 transition-all active:scale-95"
                            >-</button>

                            <div className="flex items-center gap-2 w-32 group">
                                <input
                                    type="range"
                                    min="50"
                                    max="200"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-slate-600 group-hover:accent-blue-600 transition-all"
                                />
                                <div className="w-[1px] h-3 bg-slate-400"></div>
                            </div>

                            <button
                                onClick={() => setZoom(z => Math.min(z + 10, 200))}
                                className="text-slate-500 hover:bg-[#d0d0d0] font-bold rounded px-2 transition-all active:scale-95"
                            >+</button>

                            <span className="w-10 text-right font-mono text-xs">{zoom}%</span>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default ExcelChart;