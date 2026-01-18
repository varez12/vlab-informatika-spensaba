import React, { useState, useRef } from 'react';
import {
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Bold, Italic, Underline, CheckCircle, FileText,
    Layout, Minimize, Settings, X, Scaling,
    CornerDownLeft, Trash2, MoveHorizontal, MousePointer2, Info,
    Pilcrow, SlidersHorizontal, TableProperties
} from 'lucide-react';

const WordLab = () => {
    // Main Lab Tab
    const [labTab, setLabTab] = useState('paragraph'); // paragraph | layout | tabulator

    // ===== PARAGRAPH STATE =====
    const [alignment, setAlignment] = useState('text-justify');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    // ===== PAGE LAYOUT STATE =====
    const [orientation, setOrientation] = useState('portrait');
    const [pageSize, setPageSize] = useState('a4');
    const [marginType, setMarginType] = useState('normal');
    const [customMargins, setCustomMargins] = useState({ top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 });
    const [showPageSetup, setShowPageSetup] = useState(false);

    // ===== TABULATOR STATE =====
    const [activeTabType, setActiveTabType] = useState('left');
    const [tabStops, setTabStops] = useState([
        { id: 1, pos: 1.5, type: 'left' },
        { id: 2, pos: 3, type: 'center' },
        { id: 3, pos: 7, type: 'center' }
    ]);
    const [lines, setLines] = useState([
        "Nama\t: Budi Santoso",
        "Kelas\t: VI (Enam)",
        "",
        "\t\tMengetahui,\tMenyetujui,"
    ]);
    const [activeLineIndex, setActiveLineIndex] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(0);

    // ===== SHARED STATE =====
    const [zoom, setZoom] = useState(100);
    const [toast, setToast] = useState(null);

    // Constants for Tabulator
    const CM_TO_PX = 37.8;
    const MARGIN_LEFT_CM = 1;
    const MARGIN_LEFT_PX = MARGIN_LEFT_CM * CM_TO_PX;
    const DOC_WIDTH_PX = 794;

    const showMessage = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    // ===== PARAGRAPH FUNCTIONS =====
    const handleAlign = (alignClass, name) => {
        setAlignment(alignClass);
        showMessage(`✅ Perataan "${name}" Diterapkan!`);
    };

    const toggleStyle = (style, setter) => {
        setter(!style);
    };

    // ===== PAGE LAYOUT FUNCTIONS =====
    const handleOrientation = (type) => {
        setOrientation(type);
        showMessage(`✅ Orientasi "${type === 'portrait' ? 'Portrait' : 'Landscape'}" Diterapkan!`);
    };

    const handleSize = (size, label) => {
        setPageSize(size);
        showMessage(`✅ Ukuran Kertas "${label}" Dipilih!`);
    };

    const handleMargin = (type, label) => {
        setMarginType(type);
        if (type !== 'custom') {
            showMessage(`✅ Margin "${label}" Diterapkan!`);
        } else {
            setShowPageSetup(true);
        }
    };

    const applyCustomMargins = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        setCustomMargins({
            top: parseFloat(formData.get('top')),
            bottom: parseFloat(formData.get('bottom')),
            left: parseFloat(formData.get('left')),
            right: parseFloat(formData.get('right')),
        });
        setMarginType('custom');
        setShowPageSetup(false);
        showMessage("✅ Custom Margin Diterapkan!");
    };

    const getPageStyle = () => {
        let width = '21cm', height = '29.7cm';
        if (pageSize === 'letter') { width = '21.59cm'; height = '27.94cm'; }
        else if (pageSize === 'legal') { width = '21.59cm'; height = '35.56cm'; }
        if (orientation === 'landscape') [width, height] = [height, width];

        let padding = '2.54cm';
        if (marginType === 'narrow') padding = '1.27cm';
        else if (marginType === 'wide') padding = '5.08cm 5.08cm';
        else if (marginType === 'custom') {
            padding = `${customMargins.top}cm ${customMargins.right}cm ${customMargins.bottom}cm ${customMargins.left}cm`;
        }
        return { width, height, padding, transition: 'all 0.5s ease-in-out' };
    };

    // ===== TABULATOR FUNCTIONS =====
    const cycleTabType = () => {
        const types = ['left', 'center', 'right'];
        const nextIdx = (types.indexOf(activeTabType) + 1) % types.length;
        setActiveTabType(types[nextIdx]);
        showMessage(`Tipe Tab: ${types[nextIdx].toUpperCase()}`);
    };

    const handleRulerClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const rawPosCm = clickX / CM_TO_PX;
        const posCm = Math.round(rawPosCm * 2) / 2;
        if (posCm < 0) return;

        const existing = tabStops.find(t => Math.abs(t.pos - posCm) < 0.5);
        if (existing) {
            setTabStops(tabStops.filter(t => t.id !== existing.id));
            showMessage("🗑️ Tab Stop Dihapus");
        } else {
            setTabStops([...tabStops, { id: Date.now(), pos: posCm, type: activeTabType }].sort((a, b) => a.pos - b.pos));
            showMessage(`✅ Tab ${activeTabType} di ${posCm}cm`);
        }
    };

    const handleLineChange = (val, idx) => {
        const newLines = [...lines];
        newLines[idx] = val;
        setLines(newLines);
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const currentLine = lines[idx];
            const before = currentLine.slice(0, cursorPosition);
            const after = currentLine.slice(cursorPosition);
            const newLines = [...lines];
            newLines[idx] = before + "\t" + after;
            setLines(newLines);
            setCursorPosition(cursorPosition + 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const newLines = [...lines];
            newLines.splice(idx + 1, 0, "");
            setLines(newLines);
            setActiveLineIndex(idx + 1);
            setCursorPosition(0);
        }
    };

    const TabIconSVG = ({ type }) => {
        if (type === 'left') return <svg width="8" height="8" viewBox="0 0 12 12"><polyline points="2,0 2,10 10,10" fill="none" stroke="black" strokeWidth="2" /></svg>;
        if (type === 'center') return <svg width="8" height="8" viewBox="0 0 12 12"><line x1="6" y1="0" x2="6" y2="10" stroke="#000" strokeWidth="2" /><line x1="2" y1="10" x2="10" y2="10" stroke="#000" strokeWidth="2" /></svg>;
        if (type === 'right') return <svg width="8" height="8" viewBox="0 0 12 12"><polyline points="10,0 10,10 2,10" fill="none" stroke="black" strokeWidth="2" /></svg>;
        return null;
    };

    const labTabs = [
        { id: 'paragraph', label: 'Paragraf', icon: Pilcrow, desc: 'Alignment & Font Style' },
        { id: 'layout', label: 'Page Layout', icon: SlidersHorizontal, desc: 'Orientation, Size, Margins' },
        { id: 'tabulator', label: 'Tabulator', icon: TableProperties, desc: 'Tab Stops & Ruler' }
    ];

    return (
        <div className="h-[calc(100vh-4rem)] bg-slate-100 flex flex-col overflow-hidden">
            {/* TOAST */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{toast}</span>
                </div>
            )}

            {/* PAGE SETUP DIALOG */}
            {showPageSetup && (
                <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-50">
                            <h3 className="font-bold text-sm text-slate-700">Page Setup - Margins</h3>
                            <button onClick={() => setShowPageSetup(false)} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
                        </div>
                        <form onSubmit={applyCustomMargins} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {['top', 'bottom', 'left', 'right'].map(side => (
                                    <div key={side}>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 capitalize">{side} (cm)</label>
                                        <input type="number" step="0.1" name={side} defaultValue={customMargins[side]} className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t flex justify-end gap-2">
                                <button type="button" onClick={() => setShowPageSetup(false)} className="px-4 py-2 rounded text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md">OK</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* HEADER with Lab Tabs */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 py-3 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-lg font-black">Word Lab</h1>
                        <p className="text-[10px] text-blue-200">Simulasi Microsoft Word</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-white/20 px-2 py-1 rounded">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.max(z - 10, 50))} className="w-6 h-6 rounded bg-white/20 hover:bg-white/30">-</button>
                        <button onClick={() => setZoom(z => Math.min(z + 10, 200))} className="w-6 h-6 rounded bg-white/20 hover:bg-white/30">+</button>
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {labTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setLabTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${labTab === tab.id
                                ? 'bg-white text-indigo-700 shadow-lg'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* RIBBON - Changes based on labTab */}
            <div className="bg-[#f3f3f3] border-b border-slate-300 shrink-0 overflow-x-auto">
                <div className="p-2 flex items-center gap-2 md:gap-4 min-h-[70px] md:min-h-[80px] min-w-max">
                    {labTab === 'paragraph' && (
                        <>
                            {/* Font Group */}
                            <div className="flex flex-col items-center px-2 md:px-4 border-r border-slate-300">
                                <div className="flex gap-1 mb-1">
                                    <button onClick={() => toggleStyle(isBold, setIsBold)} className={`p-2 md:p-1.5 border rounded min-w-[36px] min-h-[36px] flex items-center justify-center ${isBold ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-transparent hover:bg-slate-200'}`}><Bold size={18} /></button>
                                    <button onClick={() => toggleStyle(isItalic, setIsItalic)} className={`p-2 md:p-1.5 border rounded min-w-[36px] min-h-[36px] flex items-center justify-center ${isItalic ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-transparent hover:bg-slate-200'}`}><Italic size={18} /></button>
                                    <button onClick={() => toggleStyle(isUnderline, setIsUnderline)} className={`p-2 md:p-1.5 border rounded min-w-[36px] min-h-[36px] flex items-center justify-center ${isUnderline ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-transparent hover:bg-slate-200'}`}><Underline size={18} /></button>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-medium text-slate-600">Font</span>
                            </div>
                            {/* Paragraph Group */}
                            <div className="flex flex-col items-center px-2 md:px-4">
                                <div className="flex gap-1">
                                    <button onClick={() => handleAlign('text-left', 'Left')} className={`p-2 rounded border min-w-[36px] min-h-[36px] flex items-center justify-center ${alignment === 'text-left' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-transparent hover:bg-slate-200'}`}><AlignLeft size={18} /></button>
                                    <button onClick={() => handleAlign('text-center', 'Center')} className={`p-2 rounded border min-w-[36px] min-h-[36px] flex items-center justify-center ${alignment === 'text-center' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-transparent hover:bg-slate-200'}`}><AlignCenter size={18} /></button>
                                    <button onClick={() => handleAlign('text-right', 'Right')} className={`p-2 rounded border min-w-[36px] min-h-[36px] flex items-center justify-center ${alignment === 'text-right' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-transparent hover:bg-slate-200'}`}><AlignRight size={18} /></button>
                                    <button onClick={() => handleAlign('text-justify', 'Justify')} className={`p-2 rounded border min-w-[36px] min-h-[36px] flex items-center justify-center ${alignment === 'text-justify' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-transparent hover:bg-slate-200'}`}><AlignJustify size={18} /></button>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-600 mt-1">Paragraph</span>
                            </div>
                        </>
                    )}

                    {labTab === 'layout' && (
                        <>
                            {/* Margins */}
                            <div className="flex flex-col items-center gap-1 px-2 md:px-4 border-r border-slate-300">
                                <div className="flex gap-1">
                                    {[{ type: 'normal', label: 'N' }, { type: 'narrow', label: 'S' }, { type: 'wide', label: 'W' }, { type: 'custom', label: '⚙' }].map(m => (
                                        <button key={m.type} onClick={() => handleMargin(m.type, m.type === 'normal' ? 'Normal' : m.type === 'narrow' ? 'Narrow' : m.type === 'wide' ? 'Wide' : 'Custom')} className={`p-1.5 flex flex-col items-center gap-0.5 rounded border min-w-[40px] ${marginType === m.type ? 'bg-indigo-100 border-indigo-300' : 'border-transparent hover:bg-slate-200'}`}>
                                            <div className="w-5 h-6 border border-slate-400 bg-white flex items-center justify-center text-[8px]">
                                                {m.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <span className="text-[9px] font-bold text-slate-600">Margins</span>
                            </div>
                            {/* Orientation */}
                            <div className="flex flex-col items-center gap-1 px-2 md:px-4 border-r border-slate-300">
                                <div className="flex gap-1">
                                    <button onClick={() => handleOrientation('portrait')} className={`p-1.5 flex flex-col items-center gap-0.5 rounded border min-w-[40px] ${orientation === 'portrait' ? 'bg-indigo-100 border-indigo-300' : 'border-transparent hover:bg-slate-200'}`}>
                                        <div className="w-4 h-6 border border-slate-600 bg-white"></div>
                                        <span className="text-[7px]">P</span>
                                    </button>
                                    <button onClick={() => handleOrientation('landscape')} className={`p-1.5 flex flex-col items-center gap-0.5 rounded border min-w-[40px] ${orientation === 'landscape' ? 'bg-indigo-100 border-indigo-300' : 'border-transparent hover:bg-slate-200'}`}>
                                        <div className="w-6 h-4 border border-slate-600 bg-white"></div>
                                        <span className="text-[7px]">L</span>
                                    </button>
                                </div>
                                <span className="text-[9px] font-bold text-slate-600">Orient</span>
                            </div>
                            {/* Size */}
                            <div className="flex flex-col items-center gap-1 px-2 md:px-4">
                                <div className="flex gap-1">
                                    {[{ size: 'a4', label: 'A4' }, { size: 'letter', label: 'LTR' }, { size: 'legal', label: 'LGL' }].map(s => (
                                        <button key={s.size} onClick={() => handleSize(s.size, s.label)} className={`px-2 py-1.5 rounded border text-[9px] font-bold min-h-[36px] ${pageSize === s.size ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-slate-200 hover:bg-slate-200'}`}>{s.label}</button>
                                    ))}
                                </div>
                                <span className="text-[9px] font-bold text-slate-600">Size</span>
                            </div>
                        </>
                    )}

                    {labTab === 'tabulator' && (
                        <div className="flex items-center gap-3 px-2 md:px-4">
                            <div className="flex flex-col items-center gap-1">
                                <div onClick={cycleTabType} className="w-10 h-10 bg-white border border-slate-300 rounded flex items-center justify-center cursor-pointer hover:bg-slate-100 active:bg-slate-200">
                                    <TabIconSVG type={activeTabType} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-600">{activeTabType.toUpperCase()}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 hidden md:block">
                                <p><b>Klik ruler</b> → tambah tab</p>
                                <p><b>Tab key</b> → loncat</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DOCUMENT AREA */}
            <div className="bg-[#e5e7eb] flex-1 flex justify-center overflow-auto p-4 md:p-8">
                <div className="origin-top transition-transform duration-200" style={{ transform: `scale(${zoom / 100})` }}>

                    {/* Horizontal Ruler for Tabulator */}
                    {labTab === 'tabulator' && (
                        <div className="mb-2 bg-[#f0f0f0] border border-slate-300 rounded" style={{ width: `${DOC_WIDTH_PX}px` }}>
                            <div className="h-[24px] relative cursor-crosshair" style={{ marginLeft: `${MARGIN_LEFT_PX}px`, marginRight: `${MARGIN_LEFT_PX}px` }} onClick={handleRulerClick}>
                                {Array.from({ length: 32 }).map((_, i) => {
                                    const posCm = i * 0.5;
                                    const isCm = i % 2 === 0;
                                    return (
                                        <div key={i} className="absolute bottom-0" style={{ left: `${posCm * CM_TO_PX}px` }}>
                                            <div className={`w-[1px] ${isCm ? 'h-[6px] bg-slate-500' : 'h-[3px] bg-slate-400'}`}></div>
                                            {isCm && posCm > 0 && <span className="absolute text-[8px] text-slate-500" style={{ left: '-3px', bottom: '8px' }}>{posCm}</span>}
                                        </div>
                                    );
                                })}
                                {tabStops.map(tab => (
                                    <div key={tab.id} className="absolute bottom-0 w-4 h-4 -ml-2 z-20 flex items-end justify-center" style={{ left: `${tab.pos * CM_TO_PX}px` }}>
                                        <TabIconSVG type={tab.type} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Document Paper */}
                    <div
                        className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] font-serif text-sm leading-relaxed text-slate-900 border border-slate-300 relative"
                        style={labTab === 'layout' ? getPageStyle() : { width: '21cm', minHeight: '29.7cm', padding: '2.54cm' }}
                    >
                        {/* Paragraph Content */}
                        {labTab === 'paragraph' && (
                            <div className={`space-y-4 ${alignment} ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline underline-offset-4' : ''}`}>
                                <h1 className="text-xl font-bold mb-6 text-center uppercase">Laporan Kegiatan Sekolah</h1>
                                <p>Pada hari Senin tanggal 15 Januari 2024, SD Negeri 1 Suka Belajar telah melaksanakan kegiatan "Pekan Literasi Digital". Kegiatan ini bertujuan untuk mengenalkan dasar-dasar teknologi informasi kepada siswa sejak dini.</p>
                                <p>Seluruh siswa kelas 6 mengikuti pelatihan simulasi tata letak dokumen. Mereka belajar bagaimana mengatur perataan teks agar dokumen terlihat rapi dan profesional.</p>
                            </div>
                        )}

                        {/* Layout Content */}
                        {labTab === 'layout' && (
                            <>
                                <h1 className="text-xl font-bold mb-4 text-center uppercase">Proposal Kegiatan Sekolah</h1>
                                <p className="mb-4"><strong>LATAR BELAKANG</strong><br />Dalam rangka meningkatkan kreativitas dan kemandirian siswa, SD Negeri 1 Suka Belajar bermaksud menyelenggarakan kegiatan "Market Day".</p>
                                <p className="mb-4">Orientasi kertas dan ukuran margin sangat berpengaruh terhadap kenyamanan membaca dokumen resmi seperti proposal ini.</p>
                            </>
                        )}

                        {/* Tabulator Content */}
                        {labTab === 'tabulator' && (
                            <div className="font-serif text-[15px]">
                                {lines.map((line, idx) => {
                                    const segments = line.split('\t');
                                    const sortedTabs = [...tabStops].sort((a, b) => a.pos - b.pos);

                                    return (
                                        <div key={idx} className="relative h-[24px] flex items-center cursor-text" onClick={() => setActiveLineIndex(idx)}>
                                            {segments.map((seg, i) => {
                                                let leftPos = 0;
                                                let transform = 'none';

                                                if (i > 0 && sortedTabs[i - 1]) {
                                                    leftPos = sortedTabs[i - 1].pos * CM_TO_PX;
                                                    if (sortedTabs[i - 1].type === 'center') transform = 'translateX(-50%)';
                                                    if (sortedTabs[i - 1].type === 'right') transform = 'translateX(-100%)';
                                                } else if (i > 0) {
                                                    leftPos = i * 1.5 * CM_TO_PX;
                                                }

                                                return <span key={i} className="absolute whitespace-nowrap" style={{ left: `${leftPos}px`, transform }}>{seg}</span>;
                                            })}
                                            {activeLineIndex === idx && (
                                                <input
                                                    className="absolute inset-0 w-full opacity-0"
                                                    value={line}
                                                    onChange={(e) => handleLineChange(e.target.value, idx)}
                                                    onKeyDown={(e) => handleKeyDown(e, idx)}
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="bg-[#f3f3f3] px-2 py-1 flex items-center justify-between text-[11px] border-t border-slate-300 shrink-0 text-slate-600">
                <div className="flex gap-4 px-2">
                    <span className="flex items-center gap-1"><FileText size={12} className="text-blue-600" /> Page 1 of 1</span>
                    <span>Mode: {labTabs.find(t => t.id === labTab)?.label}</span>
                </div>
                <div className="flex items-center gap-2 px-4">
                    <Scaling size={12} />
                    <span className="font-mono">{zoom}%</span>
                </div>
            </footer>
        </div>
    );
};

export default WordLab;
