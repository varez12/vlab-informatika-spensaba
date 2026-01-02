import React, { useState } from 'react';
import {
    Layout,
    FileText,
    CheckCircle,
    MoveHorizontal,
    MoveVertical,
    Scaling,
    Maximize,
    Minimize,
    Settings,
    X
} from 'lucide-react';

const WordPageLayout = () => {
    // State for Page Setup
    const [orientation, setOrientation] = useState('portrait'); // portrait | landscape
    const [pageSize, setPageSize] = useState('a4'); // a4 | letter | legal
    const [marginType, setMarginType] = useState('normal'); // normal | narrow | wide | custom

    // Custom Margins State (in cm)
    const [customMargins, setCustomMargins] = useState({ top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 });
    const [showPageSetup, setShowPageSetup] = useState(false);

    // Zoom State
    const [zoom, setZoom] = useState(100);

    const [activeTab, setActiveTab] = useState('Layout'); // Default to Layout tab
    const [toast, setToast] = useState(null);

    const showMessage = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    // Configuration Logic
    const handleOrientation = (type) => {
        setOrientation(type);
        showMessage(`✅ Orientasi "${type === 'portrait' ? 'Potrait' : 'Landscape'}" Diterapkan!`);
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
        const newMargins = {
            top: parseFloat(formData.get('top')),
            bottom: parseFloat(formData.get('bottom')),
            left: parseFloat(formData.get('left')),
            right: parseFloat(formData.get('right')),
        };
        setCustomMargins(newMargins);
        setMarginType('custom');
        setShowPageSetup(false);
        showMessage("✅ Custom Margin Diterapkan!");
    };

    // Style Calculation for Preview
    const getPageStyle = () => {
        let width = '21cm';
        let height = '29.7cm';

        if (pageSize === 'letter') {
            width = '21.59cm';
            height = '27.94cm';
        } else if (pageSize === 'legal') {
            width = '21.59cm';
            height = '35.56cm';
        }

        // Swap for Landscape
        if (orientation === 'landscape') {
            [width, height] = [height, width];
        }

        // Margins Logic
        let padding = '2.54cm';
        if (marginType === 'narrow') padding = '1.27cm';
        else if (marginType === 'wide') padding = '5.08cm 5.08cm';
        else if (marginType === 'custom') {
            padding = `${customMargins.top}cm ${customMargins.right}cm ${customMargins.bottom}cm ${customMargins.left}cm`;
        }

        return {
            width,
            height,
            padding,
            transition: 'all 0.5s ease-in-out'
        };
    };

    // Custom Tooltip Component
    const SimTooltip = ({ content, children }) => {
        const [show, setShow] = useState(false);
        return (
            <div className="relative flex flex-col items-center"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                {/* Tooltip Popup */}
                {show && (
                    <div className="absolute bottom-full mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl z-50 animate-in fade-in zoom-in-95 leading-tight text-center pointer-events-none after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-800">
                        {content}
                    </div>
                )}
                {children}
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-4rem)] bg-slate-200 font-sans text-slate-800 flex flex-col overflow-hidden relative">

            {/* TOAST */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{toast}</span>
                </div>
            )}

            {/* PAGE SETUP DIALOG */}
            {showPageSetup && (
                <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-50">
                            <h3 className="font-bold text-sm text-slate-700">Page Setup - Margins</h3>
                            <button onClick={() => setShowPageSetup(false)} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
                        </div>
                        <form onSubmit={applyCustomMargins} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Top (cm)</label>
                                    <input type="number" step="0.1" name="top" defaultValue={customMargins.top} className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Bottom (cm)</label>
                                    <input type="number" step="0.1" name="bottom" defaultValue={customMargins.bottom} className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Left (cm)</label>
                                    <input type="number" step="0.1" name="left" defaultValue={customMargins.left} className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Right (cm)</label>
                                    <input type="number" step="0.1" name="right" defaultValue={customMargins.right} className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                </div>
                            </div>
                            <div className="pt-4 border-t flex justify-end gap-2">
                                <button type="button" onClick={() => setShowPageSetup(false)} className="px-4 py-2 rounded text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md">OK</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RIBBON */}
            <div className="bg-[#f3f3f3] border-b border-slate-300 select-none shrink-0 font-sans">
                {/* Tabs */}
                <div className="flex bg-[#e1e1e1] px-4 text-[11px] text-slate-700">
                    {['File', 'Home', 'Insert', 'Design', 'Layout'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 cursor-pointer transition-all ${activeTab === tab ? 'bg-[#f3f3f3] font-bold text-indigo-700 border-t-2 border-indigo-600' : 'hover:bg-slate-300'}`}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {/* Ribbon Content */}
                <div className="p-2 flex items-center gap-2 bg-[#f3f3f3] min-h-[100px] border-b border-slate-200 overflow-x-auto">
                    {activeTab === 'Layout' ? (
                        <>
                            {/* Page Setup Group */}
                            <div className="flex items-start h-full px-4 border-r border-slate-300 gap-6">

                                {/* Margins */}
                                <div className="flex flex-col items-center gap-1 group">
                                    <div className="flex gap-1">
                                        <SimTooltip content="Normal (2.54 cm): Standar untuk dokumen surat dan laporan umum.">
                                            <button
                                                onClick={() => handleMargin('normal', 'Normal')}
                                                className={`p-2 flex flex-col items-center gap-1 rounded hover:bg-slate-200 border ${marginType === 'normal' ? 'bg-indigo-100 border-indigo-300' : 'border-transparent'}`}
                                            >
                                                <div className="w-6 h-8 border border-slate-400 bg-white p-[2px] flex items-center justify-center"><div className="w-full h-full border border-dashed border-slate-300"></div></div>
                                                <span className="text-[9px]">Normal</span>
                                            </button>
                                        </SimTooltip>

                                        <SimTooltip content="Narrow (1.27 cm): Memaksimalkan area tulis, cocok untuk draft hemat kertas.">
                                            <button
                                                onClick={() => handleMargin('narrow', 'Narrow')}
                                                className={`p-2 flex flex-col items-center gap-1 rounded hover:bg-slate-200 border ${marginType === 'narrow' ? 'bg-indigo-100 border-indigo-300' : 'border-transparent'}`}
                                            >
                                                <div className="w-6 h-8 border border-slate-400 bg-white p-[1px] flex items-center justify-center"><div className="w-full h-full border border-dashed border-slate-300"></div></div>
                                                <span className="text-[9px]">Narrow</span>
                                            </button>
                                        </SimTooltip>

                                        <SimTooltip content="Wide: Margin lebar untuk tampilan dokumen yang lebih artistik atau formal.">
                                            <button
                                                onClick={() => handleMargin('wide', 'Wide')}
                                                className={`p-2 flex flex-col items-center gap-1 rounded hover:bg-slate-200 border ${marginType === 'wide' ? 'bg-indigo-100 border-indigo-300' : 'border-transparent'}`}
                                            >
                                                <div className="w-6 h-8 border border-slate-400 bg-white px-[4px] py-[2px] flex items-center justify-center"><div className="w-full h-full border border-dashed border-slate-300"></div></div>
                                                <span className="text-[9px]">Wide</span>
                                            </button>
                                        </SimTooltip>

                                        <SimTooltip content="Custom: Atur margin secara manual (misal 4-4-3-3 untuk Skripsi).">
                                            <button
                                                onClick={() => handleMargin('custom', 'Custom')}
                                                className={`p-2 flex flex-col items-center gap-1 rounded hover:bg-slate-200 border ${marginType === 'custom' ? 'bg-indigo-100 border-indigo-300' : 'border-transparent'}`}
                                            >
                                                <div className="w-6 h-8 border border-slate-400 bg-white flex items-center justify-center"><Settings size={14} className="text-slate-600" /></div>
                                                <span className="text-[9px]">Custom</span>
                                            </button>
                                        </SimTooltip>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 -mt-1">Margins</span>
                                </div>

                                {/* Orientation */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex gap-1">
                                        <SimTooltip content="Portrait (Tegak): Posisi standar untuk surat menyurat.">
                                            <button
                                                onClick={() => handleOrientation('portrait')}
                                                className={`p-2 flex flex-col items-center gap-1 rounded hover:bg-slate-200 border ${orientation === 'portrait' ? 'bg-indigo-100 border-indigo-300' : 'border-transparent'}`}
                                            >
                                                <div className="w-6 h-8 border border-slate-600 bg-white shadow-sm"></div>
                                                <span className="text-[9px]">Portrait</span>
                                            </button>
                                        </SimTooltip>

                                        <SimTooltip content="Landscape (Mendatar): Cocok untuk tabel lebar, sertifikat, atau brosur.">
                                            <button
                                                onClick={() => handleOrientation('landscape')}
                                                className={`p-2 flex flex-col items-center gap-1 rounded hover:bg-slate-200 border ${orientation === 'landscape' ? 'bg-indigo-100 border-indigo-300' : 'border-transparent'}`}
                                            >
                                                <div className="w-8 h-6 border border-slate-600 bg-white shadow-sm mt-1"></div>
                                                <span className="text-[9px]">Landscape</span>
                                            </button>
                                        </SimTooltip>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 -mt-1">Orientation</span>
                                </div>

                                {/* Size */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="grid grid-cols-3 gap-1">
                                        <SimTooltip content="A4 (21 x 29.7 cm): Standar internasional untuk dokumen resmi.">
                                            <button
                                                onClick={() => handleSize('a4', 'A4')}
                                                className={`px-2 py-1 rounded hover:bg-slate-200 border text-[10px] font-bold ${pageSize === 'a4' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'}`}
                                            >
                                                A4
                                            </button>
                                        </SimTooltip>

                                        <SimTooltip content="Letter (21.6 x 27.9 cm): Standar kertas di Amerika, sedikit lebih pendek dari A4.">
                                            <button
                                                onClick={() => handleSize('letter', 'Letter')}
                                                className={`px-2 py-1 rounded hover:bg-slate-200 border text-[10px] font-bold ${pageSize === 'letter' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'}`}
                                            >
                                                Letter
                                            </button>
                                        </SimTooltip>

                                        <SimTooltip content="Legal (21.6 x 35.6 cm): Kertas panjang untuk dokumen hukum. Hati-hati beda dengan F4!">
                                            <button
                                                onClick={() => handleSize('legal', 'Legal')}
                                                className={`px-2 py-1 rounded hover:bg-slate-200 border text-[10px] font-bold ${pageSize === 'legal' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'}`}
                                            >
                                                Legal
                                            </button>
                                        </SimTooltip>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-[9px] text-slate-400">
                                        <Scaling size={12} />
                                        <span>Current: {pageSize.toUpperCase()}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 mt-0.5">Size</span>
                                </div>

                            </div>

                            <div className="flex-1"></div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 italic text-xs">
                            Fitur tab "{activeTab}" tidak aktif di simulasi ini. Klik "Layout".
                        </div>
                    )}
                </div>
            </div>

            {/* DOCUMENT AREA */}
            <div className="bg-[#525659] p-4 md:p-8 flex justify-center flex-1 overflow-auto relative custom-scrollbar">

                {/* Scale wrapper to fit view if paper is huge */}
                <div className="origin-top transition-transform duration-200 ease-out py-8" style={{ transform: `scale(${zoom / 100})` }}>
                    <div
                        className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] font-serif text-xs md:text-sm leading-relaxed text-justify text-slate-900 border border-slate-300 relative"
                        style={getPageStyle()}
                    >
                        {/* Visual Guide for Margins (Optional, subtly visible on hover or setting) */}
                        <div className="absolute inset-0 border border-transparent pointer-events-none">
                            {/* Can add dotted lines to visualize margins vs content area if needed */}
                        </div>

                        <h1 className="text-xl font-bold mb-4 text-center uppercase">Proposal Kegiatan Sekolah</h1>
                        <p className="mb-4">
                            <strong>LATAR BELAKANG</strong><br />
                            Dalam rangka meningkatkan kreativitas dan kemandirian siswa, SD Negeri 1 Suka Belajar bermaksud menyelenggarakan kegiatan "Market Day". Kegiatan ini diharapkan dapat menjadi sarana bagi siswa untuk belajar berwirausaha secara sederhana.
                        </p>
                        <p className="mb-4">
                            Orientasi kertas dan ukuran margin sangat berpengaruh terhadap kenyamanan membaca dokumen resmi seperti proposal ini. Orientasi <em>Landscape</em> sering digunakan untuk menampilkan tabel yang lebar, sedangkan <em>Portrait</em> adalah standar untuk surat menyurat.
                        </p>
                        <p className="mb-4">
                            Pemilihan ukuran kertas (A4 vs Letter vs Legal) juga krusial. Legal (F4) biasanya lebih panjang dan sering menjebak pengguna yang salah setting driver printer. Di simulasi ini, Anda bisa melihat perbedaan fisik proporsi kertasnya secara langsung.
                        </p>
                        <p className="mb-4">
                            <strong>TUJUAN KEGIATAN</strong><br />
                            1. Melatih jiwa entrepreneurship.<br />
                            2. Mengenalkan nilai mata uang dan transaksi.<br />
                            3. Mempererat kerukunan antar warga sekolah.
                        </p>
                        <p>
                            Demikian proposal ini disusun sebagai kerangka acuan kegiatan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.
                        </p>

                        {/* Dummy Text filler to show layout reflow */}
                        <div className="opacity-30 mt-8 text-[10px] select-none">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        </div>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            {/* FOOTER STATUS BAR */}
            <footer className="bg-[#f3f3f3] text-regal-blue px-2 py-1 flex items-center justify-between text-[11px] font-sans border-t border-[#d6d6d6] shrink-0 select-none text-slate-600">
                <div className="flex gap-4 px-2">
                    <span className="flex items-center gap-1 hover:bg-[#e0e0e0] px-1 rounded cursor-default"><FileText size={12} className="text-blue-600" /> Page 1 of 1</span>
                    <span className="flex items-center gap-1 hover:bg-[#e0e0e0] px-1 rounded cursor-default decoration-dotted underline decorate-slate-400">126 words</span>
                    <span className="hidden md:flex items-center gap-1 hover:bg-[#e0e0e0] px-1 rounded cursor-default lowercase">{pageSize}</span>
                </div>

                <div className="flex items-center gap-4 px-4">
                    {/* View Modes (Visual only for now) */}
                    <div className="hidden md:flex gap-1 mr-4 border-r border-slate-300 pr-4">
                        <button className="p-1 hover:bg-[#c6c6c6] rounded bg-[#d6d6d6] active:bg-slate-400 transition-colors" title="Print Layout"><Layout size={14} /></button>
                        <button className="p-1 hover:bg-[#c6c6c6] rounded transition-colors" title="Web Layout"><Minimize size={14} /></button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoom(z => Math.max(z - 10, 50))}
                            className="text-slate-500 hover:bg-[#d0d0d0] rounded px-2 font-bold transition-all active:scale-95"
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
                            className="text-slate-500 hover:bg-[#d0d0d0] rounded px-2 font-bold transition-all active:scale-95"
                        >+</button>

                        <span className="w-10 text-right font-mono text-xs">{zoom}%</span>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default WordPageLayout;
