import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Search,
    Edit3,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    Copy,
    Scissors,
    Clipboard,
    ChevronRight,
    MoreHorizontal,
    Clock,
    User,
    Trash2,
    Monitor,
    FileText,
    List,
    LayoutGrid,
    ArrowUp,
    ArrowDown,
    ChevronDown,
    ArrowDown,
    ChevronDown,
    Menu,
    Trophy
} from 'lucide-react';
import QuizMode, { explorerQuizQuestions } from '../components/QuizMode';

// --- Realistic Custom SVG Icons (Windows 11 Style) ---

const RealisticThisPC = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        <rect x="6" y="8" width="36" height="26" rx="3" fill="url(#pc_grad_1)" stroke="#2563eb" strokeWidth="0.5" />
        <rect x="9" y="11" width="30" height="20" rx="1" fill="#1e293b" />
        <path d="M18 38H30L32 42H16L18 38Z" fill="#94a3b8" />
        <rect x="20" y="34" width="8" height="4" fill="#64748b" />
        <rect x="10" y="12" width="28" height="18" rx="0.5" fill="url(#pc_grad_2)" fillOpacity="0.2" />
        <defs>
            <linearGradient id="pc_grad_1" x1="6" y1="8" x2="42" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="pc_grad_2" x1="10" y1="12" x2="38" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" stopOpacity="0.3" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
        </defs>
    </svg>
);

const RealisticFolder = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
        <path d="M4 12C4 9.79086 5.79086 8 8 8H18.5858C19.1162 8 19.6249 8.21071 20 8.58579L24.4142 13H40C42.2091 13 44 14.7909 44 17V38C44 40.2091 42.2091 42 40 42H8C5.79086 42 4 40.2091 4 38V12Z" fill="url(#folder_grad_1)" />
        <path d="M4 17H44V38C44 40.2091 42.2091 42 40 42H8C5.79086 42 4 40.2091 4 38V17Z" fill="url(#folder_grad_2)" />
        <rect x="8" y="13" width="10" height="2" rx="1" fill="white" fillOpacity="0.3" />
        <defs>
            <linearGradient id="folder_grad_1" x1="4" y1="8" x2="44" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbbf24" />
                <stop offset="1" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="folder_grad_2" x1="4" y1="17" x2="44" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b" />
                <stop offset="1" stopColor="#b45309" />
            </linearGradient>
        </defs>
    </svg>
);

const RealisticRecycleBin = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        <path d="M10 14H38L35.5 40C35.5 41.1046 34.6046 42 33.5 42H14.5C13.3954 42 12.5 41.1046 12.5 40L10 14Z" fill="url(#bin_grad_1)" />
        <rect x="8" y="10" width="32" height="4" rx="2" fill="#cbd5e1" />
        <rect x="20" y="6" width="8" height="4" rx="1" stroke="#94a3b8" strokeWidth="2" />
        <line x1="18" y1="18" x2="18" y2="36" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="18" x2="24" y2="36" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="18" x2="30" y2="36" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <defs>
            <linearGradient id="bin_grad_1" x1="10" y1="14" x2="38" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f1f5f9" />
                <stop offset="1" stopColor="#cbd5e1" />
            </linearGradient>
        </defs>
    </svg>
);

const RealisticTextFile = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
        <path d="M10 6C10 4.89543 10.8954 4 12 4H30L38 12V42C38 43.1046 37.1046 44 36 44H12C10.8954 44 10 43.1046 10 42V6Z" fill="white" stroke="#e2e8f0" strokeWidth="0.5" />
        <path d="M30 4V12H38L30 4Z" fill="#f1f5f9" />
        <rect x="16" y="18" width="16" height="1.5" rx="0.75" fill="#94a3b8" />
        <rect x="16" y="24" width="16" height="1.5" rx="0.75" fill="#94a3b8" />
        <rect x="16" y="30" width="10" height="1.5" rx="0.75" fill="#94a3b8" />
    </svg>
);

const RealisticAppIcon = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        <rect x="6" y="6" width="36" height="36" rx="8" fill="url(#app_grad_1)" />
        <path d="M14 18L20 24L14 30" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="22" y1="32" x2="32" y2="32" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <defs>
            <linearGradient id="app_grad_1" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#4f46e5" />
            </linearGradient>
        </defs>
    </svg>
);

// --- Helper Functions ---

const parseSize = (sizeStr) => {
    if (sizeStr === '-') return -1;
    const num = parseFloat(sizeStr);
    if (sizeStr.includes('MB')) return num * 1024;
    return num;
};

// --- Main App Component ---

const Explorer = () => {
    // --- State Management ---
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);

    // View & Sort States
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // Mobile States
    const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(false);

    // File System State
    const [files, setFiles] = useState([
        { id: 1, name: 'tugas_lama.txt', type: 'file', location: 'desktop', size: '12 KB' },
        { id: 2, name: 'Foto_Liburan', type: 'folder', location: 'desktop', size: '-' },
        { id: 3, name: 'Aplikasi_Kamus.exe', type: 'app', location: 'desktop', size: '45 MB' },
        { id: 4, name: 'Laporan_Akhir', type: 'folder', location: 'documents', size: '-' },
    ]);

    const [currentPath, setCurrentPath] = useState('Desktop');
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false); // Quiz State

    const [clipboard, setClipboard] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetId: null });
    const explorerRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleGlobalClick = () => {
            setContextMenu(prev => prev.visible ? { ...prev, visible: false } : prev);
            setIsStartMenuOpen(false);
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    const handleSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const deleteFile = (id) => {
        const targetId = id || contextMenu.targetId;
        if (!targetId) return;
        setFiles(prev => prev.filter(f => f.id !== targetId));
        handleSuccess("File berhasil dihapus.");
        setSelectedFileId(null);
    };

    const startRename = (id) => {
        const targetId = id || contextMenu.targetId || selectedFileId;
        if (!targetId) return;
        const file = files.find(f => f.id === targetId);
        setSelectedFileId(targetId);
        setRenameValue(file.name);
        setIsRenaming(true);
    };

    const renameFile = () => {
        if (!renameValue.trim()) {
            setIsRenaming(false);
            return;
        }
        setFiles(prev => prev.map(f => f.id === selectedFileId ? { ...f, name: renameValue } : f));
        setIsRenaming(false);
        setSelectedFileId(null);
        handleSuccess("Nama file diperbarui.");
    };

    const handleCopy = (id) => {
        const targetId = id || contextMenu.targetId || selectedFileId;
        const file = files.find(f => f.id === targetId);
        if (file) {
            setClipboard({ file: { ...file }, action: 'copy' });
            handleSuccess(`Menyalin "${file.name}"`);
        }
    };

    const handleCut = (id) => {
        const targetId = id || contextMenu.targetId || selectedFileId;
        const file = files.find(f => f.id === targetId);
        if (file) {
            setClipboard({ file: { ...file }, action: 'cut' });
            handleSuccess(`Memotong "${file.name}"`);
        }
    };

    const handlePaste = () => {
        if (!clipboard) return;
        if (clipboard.action === 'cut') {
            setFiles(prev => prev.map(f => f.id === clipboard.file.id ? { ...f, location: currentPath.toLowerCase() } : f));
            setClipboard(null);
            handleSuccess("File dipindahkan.");
        } else {
            const newFile = { ...clipboard.file, id: Date.now(), name: `${clipboard.file.name} - Copy`, location: currentPath.toLowerCase() };
            setFiles(prev => [...prev, newFile]);
            handleSuccess("File disalin.");
        }
    };

    const onContextMenu = (e, fileId = null) => {
        e.preventDefault();
        e.stopPropagation();

        // Ensure menu doesn't overflow mobile screen
        let x = e.clientX;
        let y = e.clientY;
        if (x + 240 > window.innerWidth) x = window.innerWidth - 250;
        if (y + 300 > window.innerHeight) y = window.innerHeight - 310;

        setContextMenu({ visible: true, x, y, targetId: fileId });
        if (fileId) setSelectedFileId(fileId);
    };

    // --- Sorting Logic ---
    const sortedFiles = [...files]
        .filter(f => f.location === currentPath.toLowerCase())
        .sort((a, b) => {
            let comparison = 0;
            if (sortConfig.key === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortConfig.key === 'size') {
                comparison = parseSize(a.size) - parseSize(b.size);
            } else if (sortConfig.key === 'type') {
                comparison = a.type.localeCompare(b.type);
            }
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });

    const toggleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const renderIcon = (file, size = 48) => {
        if (file.type === 'folder') return <RealisticFolder size={size} />;
        if (file.type === 'app') return <RealisticAppIcon size={size} />;
        return <RealisticTextFile size={size} />;
    };

    const selectedFile = files.find(f => f.id === (selectedFileId || contextMenu.targetId));

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-[#1a3a5a] overflow-hidden font-sans text-slate-100 select-none relative">

            {/* --- DESKTOP AREA --- */}
            <div className="flex-1 p-4 md:p-6 relative bg-gradient-to-br from-[#1e4e8c] to-[#0a1a33] overflow-hidden" onContextMenu={(e) => onContextMenu(e)}>

                {/* Desktop Icons - Grid based for responsiveness */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6 w-full max-w-full">
                    <div className="flex flex-col items-center p-2 rounded hover:bg-white/10 cursor-pointer group transition-colors">
                        <RealisticThisPC size={window.innerWidth < 768 ? 40 : 48} />
                        <span className="text-[10px] md:text-[11px] text-center mt-1 drop-shadow-lg font-medium truncate w-full px-1">This PC</span>
                    </div>

                    <div onClick={() => setIsFileExplorerOpen(true)} className="flex flex-col items-center p-2 rounded hover:bg-white/10 cursor-pointer group transition-colors">
                        <RealisticFolder size={window.innerWidth < 768 ? 40 : 48} />
                        <span className="text-[10px] md:text-[11px] text-center mt-1 drop-shadow-lg font-medium truncate w-full px-1">File Explorer</span>
                    </div>

                    <div className="flex flex-col items-center p-2 rounded hover:bg-white/10 cursor-pointer group transition-colors">
                        <RealisticRecycleBin size={window.innerWidth < 768 ? 40 : 48} />
                        <span className="text-[10px] md:text-[11px] text-center mt-1 drop-shadow-lg font-medium truncate w-full px-1">Recycle Bin</span>
                    </div>
                </div>

                {/* FILE EXPLORER WINDOW */}
                {isFileExplorerOpen && (
                    <div ref={explorerRef} className="absolute inset-0 m-0 md:inset-auto md:top-10 md:left-1/2 md:-translate-x-1/2 md:w-[90%] md:max-w-[900px] md:h-[600px] bg-white text-slate-800 md:rounded-xl shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300 z-40">
                        {/* Title Bar */}
                        <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowSidebarOnMobile(!showSidebarOnMobile)} className="md:hidden p-1 hover:bg-slate-200 rounded">
                                    <Menu size={18} className="text-slate-600" />
                                </button>
                                <RealisticFolder size={18} />
                                <span className="text-xs font-bold text-slate-600 truncate max-w-[150px] md:max-w-none">File Explorer - {currentPath}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowQuiz(true)}
                                    className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                                >
                                    <Trophy size={14} /> <span className="hidden sm:inline">Kuis</span>
                                </button>
                                <button onClick={() => setIsFileExplorerOpen(false)} className="p-2 hover:bg-red-500 hover:text-white transition-colors md:rounded-tr-xl"><X size={20} /></button>
                            </div>
                        </div>

                        {/* Toolbar - Scrollable on mobile */}
                        <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between shadow-sm overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => handleCut()} disabled={!selectedFileId} className="p-2 rounded hover:bg-slate-200 disabled:opacity-20 transition-colors" title="Cut"><Scissors size={18} className="text-slate-600" /></button>
                                <button onClick={() => handleCopy()} disabled={!selectedFileId} className="p-2 rounded hover:bg-slate-200 disabled:opacity-20 transition-colors" title="Copy"><Copy size={18} className="text-slate-600" /></button>
                                <button onClick={() => handlePaste()} disabled={!clipboard} className="p-2 rounded hover:bg-slate-200 disabled:opacity-20 transition-colors" title="Paste"><Clipboard size={18} className="text-slate-600" /></button>
                                <div className="h-6 w-[1px] bg-slate-300 mx-1"></div>
                                <button onClick={() => startRename()} disabled={!selectedFileId} className="p-2 rounded hover:bg-slate-200 disabled:opacity-20 transition-colors" title="Rename"><Edit3 size={18} className="text-slate-600" /></button>
                                <button onClick={() => deleteFile()} disabled={!selectedFileId} className="p-2 rounded hover:bg-slate-200 disabled:opacity-20 transition-colors" title="Delete"><Trash2 size={18} className="text-red-500" /></button>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-300">
                                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                                        <LayoutGrid size={16} />
                                    </button>
                                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                                        <List size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Area */}
                        <div className="flex flex-1 overflow-hidden relative">
                            {/* Sidebar - Overlay on mobile, static on desktop */}
                            <div className={`absolute md:relative inset-y-0 left-0 w-48 bg-slate-50 border-r border-slate-200 p-2 flex flex-col gap-1 z-50 transition-transform md:translate-x-0 ${showSidebarOnMobile ? 'translate-x-0' : '-translate-x-full'}`}>
                                <div className="flex justify-between items-center md:hidden px-2 mb-2">
                                    <span className="text-[10px] font-bold text-slate-400">NAVIGATION</span>
                                    <button onClick={() => setShowSidebarOnMobile(false)}><X size={14} /></button>
                                </div>
                                <button onClick={() => { setCurrentPath('Desktop'); setShowSidebarOnMobile(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${currentPath === 'Desktop' ? 'bg-blue-600 text-white shadow-md font-bold' : 'hover:bg-slate-200 text-slate-600'}`}><Monitor size={14} /> Desktop</button>
                                <button onClick={() => { setCurrentPath('Documents'); setShowSidebarOnMobile(false); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${currentPath === 'Documents' ? 'bg-blue-600 text-white shadow-md font-bold' : 'hover:bg-slate-200 text-slate-600'}`}><FileText size={14} /> Documents</button>
                            </div>

                            {/* Explorer Content */}
                            <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-white relative" onClick={() => setSelectedFileId(null)} onContextMenu={(e) => onContextMenu(e)}>

                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                                        {sortedFiles.map(file => {
                                            const isCut = clipboard?.action === 'cut' && clipboard.file.id === file.id;
                                            return (
                                                <div
                                                    key={file.id}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedFileId(file.id); }}
                                                    onContextMenu={(e) => onContextMenu(e, file.id)}
                                                    className={`flex flex-col items-center p-3 md:p-4 rounded-xl border transition-all cursor-pointer group relative ${selectedFileId === file.id ? 'bg-blue-100/50 border-blue-300 shadow-sm' : 'border-transparent hover:bg-slate-50'} ${isCut ? 'opacity-30 grayscale-[0.5]' : ''}`}
                                                >
                                                    {renderIcon(file, window.innerWidth < 768 ? 40 : 48)}
                                                    {isRenaming && selectedFileId === file.id ? (
                                                        <input autoFocus className="text-[11px] w-full border border-blue-500 px-2 py-1 text-center mt-2 rounded shadow-inner outline-none bg-white" value={renameValue} onFocus={(e) => e.target.select()} onChange={(e) => setRenameValue(e.target.value)} onBlur={renameFile} onKeyDown={(e) => e.key === 'Enter' && renameFile()} onClick={(e) => e.stopPropagation()} />
                                                    ) : (
                                                        <span className="text-[10px] md:text-[11px] text-center mt-3 font-semibold text-slate-700 leading-tight group-hover:text-blue-600 truncate w-full px-1">{file.name}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col border border-slate-100 rounded-lg overflow-x-auto">
                                        <div className="flex items-center px-4 py-2 bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest min-w-[300px]">
                                            <div className="flex-1">Name</div>
                                            <div className="w-20">Size</div>
                                        </div>
                                        {sortedFiles.map(file => {
                                            const isCut = clipboard?.action === 'cut' && clipboard.file.id === file.id;
                                            return (
                                                <div
                                                    key={file.id}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedFileId(file.id); }}
                                                    onContextMenu={(e) => onContextMenu(e, file.id)}
                                                    className={`flex items-center px-4 py-2.5 border-b border-slate-50 transition-all cursor-pointer text-[11px] min-w-[300px] ${selectedFileId === file.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'} ${isCut ? 'opacity-30' : ''}`}
                                                >
                                                    <div className="flex-1 flex items-center gap-3 truncate">
                                                        {renderIcon(file, 20)}
                                                        {isRenaming && selectedFileId === file.id ? (
                                                            <input autoFocus className="border border-blue-400 px-2 py-0.5 rounded outline-none w-full" value={renameValue} onBlur={renameFile} onChange={(e) => setRenameValue(e.target.value)} onClick={e => e.stopPropagation()} />
                                                        ) : (
                                                            <span className="font-semibold truncate">{file.name}</span>
                                                        )}
                                                    </div>
                                                    <div className="w-20 text-slate-400 text-right">{file.size}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Bar */}
                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[9px] text-slate-500 flex justify-between font-bold uppercase tracking-wider items-center">
                            <span>{sortedFiles.length} ITEMS</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleSort('name')} className={`px-2 py-0.5 rounded ${sortConfig.key === 'name' ? 'bg-blue-100 text-blue-600' : ''}`}>NAME</button>
                                <button onClick={() => toggleSort('size')} className={`px-2 py-0.5 rounded ${sortConfig.key === 'size' ? 'bg-blue-100 text-blue-600' : ''}`}>SIZE</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CUSTOM CONTEXT MENU --- */}
                {contextMenu.visible && (
                    <div className="fixed bg-white shadow-2xl rounded-xl w-56 py-1 z-[999] text-slate-700 text-[13px] animate-in fade-in zoom-in duration-100 overflow-hidden border border-slate-200" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(e) => e.stopPropagation()}>
                        {contextMenu.targetId ? (
                            <>
                                <button onClick={() => { handleCut(contextMenu.targetId); setContextMenu(p => ({ ...p, visible: false })); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-600 hover:text-white transition-colors">
                                    <Scissors size={14} /> <span>Cut</span>
                                </button>
                                <button onClick={() => { handleCopy(contextMenu.targetId); setContextMenu(p => ({ ...p, visible: false })); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-600 hover:text-white transition-colors">
                                    <Copy size={14} /> <span>Copy</span>
                                </button>
                                <div className="h-[1px] bg-slate-100 my-1 mx-2"></div>
                                <button onClick={() => { startRename(contextMenu.targetId); setContextMenu(p => ({ ...p, visible: false })); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-600 hover:text-white transition-colors">
                                    <Edit3 size={14} /> <span>Rename</span>
                                </button>
                                <button onClick={() => { deleteFile(contextMenu.targetId); setContextMenu(p => ({ ...p, visible: false })); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 hover:text-white transition-colors">
                                    <Trash2 size={14} /> <span>Delete</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { handlePaste(); setContextMenu(p => ({ ...p, visible: false })); }} disabled={!clipboard} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${clipboard ? 'hover:bg-blue-600 hover:text-white' : 'opacity-20 cursor-not-allowed'}`}>
                                    <Clipboard size={14} /> <span>Paste</span>
                                </button>
                                <div className="h-[1px] bg-slate-100 my-1 mx-2"></div>
                                <button onClick={() => { setViewMode(viewMode === 'grid' ? 'list' : 'grid'); setContextMenu(p => ({ ...p, visible: false })); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50">
                                    {viewMode === 'grid' ? <List size={14} /> : <LayoutGrid size={14} />} <span>Tampilan {viewMode === 'grid' ? 'List' : 'Grid'}</span>
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Success Feedback */}
                {successMsg && <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-6 py-2.5 rounded-full shadow-2xl z-[1000] flex items-center gap-3 font-bold animate-in slide-in-from-top-10 border border-white/20 text-xs md:text-sm"><CheckCircle2 size={18} className="text-green-400" /> {successMsg}</div>}
            </div>

            {/* --- TASKBAR --- */}
            <div className="h-14 bg-black/70 backdrop-blur-2xl border-t border-white/5 flex items-center px-2 z-50">
                <button onClick={(e) => { e.stopPropagation(); setIsStartMenuOpen(!isStartMenuOpen); }} className="flex items-center justify-center w-12 h-12 hover:bg-white/10 rounded-xl transition-all active:scale-90">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 2.5H11V11H2.5V2.5Z" fill="#00ADEF" /><path d="M13 2.5H21.5V11H13V2.5Z" fill="#00ADEF" /><path d="M2.5 13H11V21.5H2.5V13Z" fill="#00ADEF" /><path d="M13 13H21.5V21.5H13V13Z" fill="#00ADEF" />
                    </svg>
                </button>

                <div className="flex-1 flex justify-center gap-2">
                    <div onClick={() => setIsFileExplorerOpen(true)} className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all ${isFileExplorerOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                        <RealisticFolder size={28} />
                    </div>
                </div>

                <div className="hidden sm:flex flex-col items-end text-[10px] px-3 font-bold text-white/80">
                    <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="opacity-60">{currentTime.toLocaleDateString([], { day: 'numeric', month: 'numeric' })}</span>
                </div>
            </div>

            {/* START MENU */}
            {isStartMenuOpen && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[92%] max-w-[500px] h-[500px] bg-[#1c1c1c]/90 backdrop-blur-3xl border border-white/10 rounded-2xl z-[60] p-6 animate-in slide-in-from-bottom-20 flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <span className="text-sm font-bold text-white/90 uppercase tracking-widest">Aplikasi</span>
                            <button className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1 rounded-md text-white/60">Semua &gt;</button>
                        </div>
                        <div className="grid grid-cols-4 gap-6">
                            <div onClick={() => { setIsFileExplorerOpen(true); setIsStartMenuOpen(false); }} className="flex flex-col items-center gap-2 cursor-pointer group">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-all shadow-lg">
                                    <RealisticFolder size={30} />
                                </div>
                                <span className="text-[9px] text-white/80 font-medium">Explorer</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between px-2">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">S</div>
                            <span className="text-xs font-bold tracking-wide uppercase">Siswa</span>
                        </div>
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">V-OS v2.0</div>
                    </div>
                </div>
            )}

            {/* FLOATING ACTION BUTTON */}
            <button onClick={() => setIsDrawerOpen(true)} className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-[100] border-2 border-white/20 active:scale-90 transition-transform">
                <Lightbulb size={28} />
            </button>

            {/* INSTRUCTION DRAWER */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[110] flex justify-end">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
                    <div className="relative w-[85%] max-w-sm bg-[#0f172a]/95 backdrop-blur-xl h-full shadow-2xl flex flex-col p-6 border-l border-white/10 animate-in slide-in-from-right duration-500 text-white text-left">
                        <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-black flex items-center gap-3 text-blue-400 uppercase tracking-tighter"><Lightbulb className="text-yellow-400" /> MODE HP</h2><button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button></div>
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                            <div className="p-5 bg-blue-600/10 rounded-2xl border border-blue-500/20"><h4 className="font-black text-[10px] uppercase tracking-widest text-blue-300 mb-2">Navigasi HP</h4><p className="text-slate-300 text-xs leading-relaxed">Di HP, jendela File Explorer akan terbuka penuh. Gunakan **ikon burger (garis tiga)** di pojok kiri atas jendela untuk berpindah folder.</p></div>
                            <div className="p-5 bg-yellow-600/10 rounded-2xl border border-yellow-500/20"><h4 className="font-black text-[10px] uppercase tracking-widest text-yellow-300 mb-2">Klik Kanan di HP?</h4><p className="text-slate-300 text-xs leading-relaxed italic">"Cukup **tekan dan tahan** file selama 1 detik, maka menu konteks (Cut, Copy, Rename) akan muncul secara otomatis."</p></div>
                        </div>
                        <button onClick={() => setIsDrawerOpen(false)} className="mt-6 w-full py-4 bg-blue-600 rounded-xl font-black text-xs uppercase tracking-widest">SAYA MENGERTI</button>
                    </div>
                </div>
            )}
            {/* Quiz Mode */}
            {showQuiz && (
                <QuizMode
                    moduleId="explorer"
                    moduleName="Sistem Operasi & File Explorer"
                    questions={explorerQuizQuestions}
                    onClose={() => setShowQuiz(false)}
                />
            )}
        </div>
    );
};

export default Explorer;