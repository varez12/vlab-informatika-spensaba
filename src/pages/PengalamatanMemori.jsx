import React, { useState, useEffect, useRef } from 'react';
import { Cpu, ArrowRight, FileText, Database, Layers, ArrowDown, Grid, Zap, Search, Save, RefreshCw, Calculator, Trophy } from 'lucide-react';
import QuizMode, { memoryQuizQuestions } from '../components/QuizMode';

const PengalamatanMemori = () => {
    // SYSTEM STATE
    const START_SEGMENT = 0x20;
    const ROWS_TO_DISPLAY = 10;
    const COLS_PER_ROW = 16;

    const [memory, setMemory] = useState(Array(ROWS_TO_DISPLAY * COLS_PER_ROW).fill(null));
    const [regSegment, setRegSegment] = useState(START_SEGMENT);
    const [regOffset, setRegOffset] = useState(0);

    // UI STATE
    const [editorText, setEditorText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // CACHE STATE
    const [cache, setCache] = useState(Array(4).fill({ valid: false, tag: null, data: null, dirty: false }));
    const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0, total: 0 });
    const [lastAccess, setLastAccess] = useState({ type: null, msg: "System Ready", status: 'idle' });

    // MANUAL ACCESS STATE
    const [activeTab, setActiveTab] = useState('stream'); // 'stream' or 'manual'
    const [manualSeg, setManualSeg] = useState(START_SEGMENT.toString(16).toUpperCase());
    const [manualOff, setManualOff] = useState('0');
    const [manualData, setManualData] = useState('');
    const [showQuiz, setShowQuiz] = useState(false); // Quiz State

    // Initial Setup
    useEffect(() => {
        setMemory(Array(ROWS_TO_DISPLAY * COLS_PER_ROW).fill(null));
    }, []);

    // Helper: Number to Hex
    const toHex = (num, pads = 4) => num.toString(16).toUpperCase().padStart(pads, '0');
    const toBin = (char) => char.charCodeAt(0).toString(2).padStart(8, '0');

    const handleInput = (e) => {
        const val = e.target.value;
        const char = val.slice(-1);
        const inputType = e.nativeEvent.inputType;

        if (inputType === 'insertText' || inputType === 'insertCompositionText') {
            processKeystroke(char);
        }
        setEditorText(val);
    };

    const processKeystroke = (char) => {
        setIsTyping(true);
        const currentRowIndex = regSegment - START_SEGMENT;
        const linearIndex = (currentRowIndex * COLS_PER_ROW) + regOffset;

        if (linearIndex >= memory.length) {
            alert("Memori Penuh! Reset untuk mulai lagi.");
            setIsTyping(false);
            return;
        }

        // Use the unified access function (Write)
        handleMemoryAccess(regSegment, regOffset, 'WRITE', toBin(char));

        setTimeout(() => {
            if (regOffset < 15) {
                setRegOffset(prev => prev + 1);
            } else {
                setRegOffset(0);
                setRegSegment(prev => prev + 1);
            }
            setIsTyping(false);
        }, 100);
    };

    // UNIFIED MEMORY & CACHE ACCESS LOGIC
    const handleMemoryAccess = (seg, off, mode, data = null) => {
        const rowIdx = seg - START_SEGMENT;
        const colIdx = off;
        const linearIdx = (rowIdx * 16) + colIdx;

        if (linearIdx < 0 || linearIdx >= memory.length) return;

        // 1. Calculate Physical Address & Cache Mappings
        const phyAddr = (seg * 16) + off;
        const cacheIndex = phyAddr % 4; // Direct Mapped to 4 lines
        const tag = Math.floor(phyAddr / 4);

        let newCache = [...cache];
        let hit = false;
        let cLine = newCache[cacheIndex];

        // 2. Check Cache Hit
        if (cLine.valid && cLine.tag === tag) {
            hit = true;
        }

        // 3. Update Stats
        setCacheStats(prev => ({
            hits: prev.hits + (hit ? 1 : 0),
            misses: prev.misses + (hit ? 0 : 1),
            total: prev.total + 1
        }));

        // 4. Perform Operation
        if (mode === 'WRITE') {
            // Memory Write (Write Through)
            const newMem = [...memory];
            newMem[linearIdx] = data;
            setMemory(newMem);

            // Update Cache (Write Allocate)
            newCache[cacheIndex] = { valid: true, tag: tag, data: data, dirty: true };
            setLastAccess({ type: 'WRITE', msg: hit ? `CACHE HIT! Write to L1 [${cacheIndex}]` : `CACHE MISS! Write alloc [${cacheIndex}]`, status: hit ? 'hit' : 'miss' });

        } else {
            // READ
            if (!hit) {
                // Fetch from RAM
                const memVal = memory[linearIdx] || "00000000";
                newCache[cacheIndex] = { valid: true, tag: tag, data: memVal, dirty: false };
                setLastAccess({ type: 'READ', msg: `MISS! Fetch RAM [${toHex(seg)}:${toHex(off)}]`, status: 'miss' });
            } else {
                setLastAccess({ type: 'READ', msg: `HIT! Read L1 Cache [${cacheIndex}]`, status: 'hit' });
            }
        }

        setCache(newCache);
        setRegSegment(seg);
        setRegOffset(off);
    };

    const triggerManualAccess = (mode) => {
        const seg = parseInt(manualSeg, 16);
        const off = parseInt(manualOff, 16);

        if (isNaN(seg) || isNaN(off)) {
            alert("Invalid Segment/Offset Hex");
            return;
        }

        if (mode === 'WRITE') {
            // Convert text/hex to binary for storage
            // Assuming user types "A" or "41" for hex. Let's support simple char or hex.
            let binData = "00000000";
            if (manualData.length === 8 && /^[01]+$/.test(manualData)) binData = manualData;
            else if (manualData.length === 1) binData = toBin(manualData);
            else if (manualData.length === 2) binData = parseInt(manualData, 16).toString(2).padStart(8, '0');
            else binData = toBin(manualData.charAt(0) || " ");

            handleMemoryAccess(seg, off, 'WRITE', binData);
        } else {
            handleMemoryAccess(seg, off, 'READ');
        }
    };

    const handleReset = () => {
        setMemory(Array(ROWS_TO_DISPLAY * COLS_PER_ROW).fill(null));
        setRegSegment(START_SEGMENT);
        setRegOffset(0);
        setEditorText("");
        setCache(Array(4).fill({ valid: false, tag: null, data: null, dirty: false }));
        setCacheStats({ hits: 0, misses: 0, total: 0 });
        setLastAccess({ type: null, msg: "System Reset", status: 'idle' });
    };

    return (
        <div className="h-[calc(100vh-4rem)] bg-slate-900 p-6 md:p-8 font-mono text-slate-200 overflow-y-auto">

            {/* Header */}
            <div className="max-w-[1400px] mx-auto mb-8 flex justify-between items-center border-b border-slate-700 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-green-400 tracking-tight mb-2 flex items-center gap-3">
                        <Grid className="animate-pulse" /> SIMULASI MEMORI REAL
                    </h1>
                    <p className="text-slate-400 font-medium">Mode Pengalamatan: Segment:Offset</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowQuiz(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                        <Trophy size={14} /> KUIS
                    </button>
                    <div className="bg-slate-800 px-4 py-2 rounded border border-slate-600 text-xs">
                        <span className="text-slate-500">FORMAT:</span> <span className="text-blue-400 font-bold">BINARY (8-BIT)</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. USER SPACE (EDITOR) */}
                {/* 1. I/O INTERFACE (Stream/Direct) */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-800 p-1 rounded-xl border border-slate-600 shadow-xl h-full flex flex-col">
                        {/* Tab Header */}
                        <div className="flex border-b border-slate-700">
                            <button
                                onClick={() => setActiveTab('stream')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'stream' ? 'bg-slate-700 text-green-400 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <FileText size={14} /> Input Stream
                            </button>
                            <button
                                onClick={() => setActiveTab('manual')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'manual' ? 'bg-slate-700 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Calculator size={14} /> Direct Access
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 relative p-4 bg-slate-900/40">
                            {activeTab === 'stream' ? (
                                <>
                                    <textarea
                                        value={editorText}
                                        onChange={handleInput}
                                        placeholder="Ketik disini untuk menulis ke memori secara sekuensial..."
                                        className="w-full h-full bg-transparent text-slate-200 font-mono resize-none focus:outline-none placeholder:text-slate-600 text-sm leading-relaxed"
                                    />
                                    <div className="absolute bottom-2 right-4 text-[10px] text-slate-500 font-mono">
                                        CHARS: {editorText.length}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-orange-400 font-bold uppercase block mb-1">Segment (Hex)</label>
                                            <input
                                                type="text"
                                                value={manualSeg}
                                                onChange={(e) => setManualSeg(e.target.value.toUpperCase())}
                                                maxLength={2}
                                                className="w-full bg-slate-950 border border-orange-500/50 rounded p-2 text-center font-mono font-bold text-orange-400 focus:outline-none focus:border-orange-500 uppercase"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-green-400 font-bold uppercase block mb-1">Offset (Hex 0-F)</label>
                                            <input
                                                type="text"
                                                value={manualOff}
                                                onChange={(e) => setManualOff(e.target.value.toUpperCase())}
                                                maxLength={1}
                                                className="w-full bg-slate-950 border border-green-500/50 rounded p-2 text-center font-mono font-bold text-green-400 focus:outline-none focus:border-green-500 uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-blue-400 font-bold uppercase block mb-1">Data (Char/Hex)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={manualData}
                                                onChange={(e) => setManualData(e.target.value)}
                                                placeholder="Contoh: A atau 41"
                                                className="flex-1 bg-slate-950 border border-blue-500/50 rounded p-2 font-mono text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-500 mt-1 italic">Ketik 1 karakter ASCII atau 2 digit Hex.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            onClick={() => triggerManualAccess('READ')}
                                            className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 border border-slate-600"
                                        >
                                            <Search size={16} /> BACA (READ)
                                        </button>
                                        <button
                                            onClick={() => triggerManualAccess('WRITE')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                        >
                                            <Save size={16} /> TULIS (WRITE)
                                        </button>
                                    </div>

                                    {/* Operation Log */}
                                    <div className={`p-3 rounded border text-[10px] font-mono leading-tight ${lastAccess.status === 'hit' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                        lastAccess.status === 'miss' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                            'bg-slate-950 border-slate-700 text-slate-500'
                                        }`}>
                                        <span className="font-bold opacity-70 block mb-0.5">LAST OPERATION:</span>
                                        {lastAccess.msg}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-slate-700 bg-slate-900/30 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500">Mode: 8086 Real Mode Simulation</span>
                            <button
                                onClick={handleReset}
                                className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider flex items-center gap-1"
                            >
                                <RefreshCw size={12} /> RESET MEMORY
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. SYSTEM SPACE (CPU & CACHE) */}
                <div className="flex flex-col justify-start gap-4">
                    {/* CPU Registers Block */}
                    <div className="bg-slate-800 rounded-xl border border-slate-600 shadow-xl relative overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-900/20 to-slate-800 p-4 border-b border-slate-600 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-orange-400">
                                <Cpu size={20} />
                                <h2 className="text-sm font-bold uppercase tracking-wider">CPU REGISTERS</h2>
                            </div>
                            <div className="text-[10px] bg-black/30 px-2 py-1 rounded text-orange-500/70 font-mono">x86 REAL MODE</div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Segment Register */}
                            <div className="relative group">
                                <div className="flex justify-between items-end mb-1">
                                    <label className="text-[10px] text-orange-400/80 font-bold uppercase tracking-widest">DS (Data Segment)</label>
                                    <span className="text-[10px] text-slate-500 font-mono">Row Index</span>
                                </div>
                                <div className="bg-black p-3 rounded border-l-4 border-orange-500 font-mono text-xl text-white flex justify-between items-center shadow-inner">
                                    <span>{toHex(regSegment)}</span>
                                    <span className="text-[10px] text-slate-600">HEX</span>
                                </div>
                            </div>

                            {/* Offset Register */}
                            <div className="relative group">
                                <div className="flex justify-between items-end mb-1">
                                    <label className="text-[10px] text-green-400/80 font-bold uppercase tracking-widest">BX (Base Offset)</label>
                                    <span className="text-[10px] text-slate-500 font-mono">Col Index</span>
                                </div>
                                <div className={`bg-black p-3 rounded border-l-4 border-green-500 font-mono text-2xl text-green-400 flex justify-between items-center shadow-inner transition-all ${isTyping ? 'bg-green-900/20' : ''}`}>
                                    <span>{toHex(regOffset)}</span>
                                    <span className="text-[10px] text-slate-600">HEX</span>
                                </div>
                                <div className="absolute -right-2 top-8">
                                    {isTyping && <span className="text-xs font-bold text-green-400 animate-ping">+1</span>}
                                </div>
                            </div>
                            {/* Calculated Address */}
                            <div className="pt-2 border-t border-slate-700/50">
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1 text-center">Physical Address</span>
                                <div className="font-mono text-sm text-slate-300 flex items-center justify-center gap-2">
                                    <span className="text-orange-400">{toHex(regSegment)}</span>
                                    <span>+</span>
                                    <span className="text-green-400">{toHex(regOffset)}</span>
                                    <span>=</span>
                                    <span className="text-white font-bold border-b-2 border-white px-2">{toHex((regSegment * 16) + regOffset)}</span> {/* Adjusted calculation visual */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* L1 CACHE SIMULATOR (NEW) */}
                    <div className="bg-slate-800 rounded-xl border border-slate-600 shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-900/20 to-slate-800 p-3 border-b border-slate-600 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-yellow-400">
                                <Zap size={18} />
                                <h2 className="text-xs font-bold uppercase tracking-wider">L1 CACHE SIM (Direct)</h2>
                            </div>
                            <div className="flex gap-2 text-[9px] font-bold uppercase">
                                <span className="text-green-400">Hits: {cacheStats.hits}</span>
                                <span className="text-red-400">Miss: {cacheStats.misses}</span>
                            </div>
                        </div>
                        <div className="p-3">
                            <table className="w-full text-[9px] font-mono border-collapse">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-700">
                                        <th className="pb-1 text-left">IDX</th>
                                        <th className="pb-1 text-center">V</th>
                                        <th className="pb-1 text-center">TAG</th>
                                        <th className="pb-1 text-right">DATA</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs">
                                    {cache.map((line, idx) => (
                                        <tr key={idx} className={`border-b border-slate-700/50 transition-colors duration-300 ${line.dirty ? 'bg-orange-500/10' : ''}`}>
                                            <td className="py-2 font-bold text-yellow-500">
                                                {idx.toString(2).padStart(2, '0')} <span className="text-slate-600">({idx})</span>
                                            </td>
                                            <td className="py-2 text-center">
                                                <div className={`w-2 h-2 rounded-full mx-auto ${line.valid ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                                            </td>
                                            <td className="py-2 text-center text-slate-300">
                                                {line.valid ? line.tag : '-'}
                                            </td>
                                            <td className="py-2 text-right font-bold text-blue-300">
                                                {line.data || '--------'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-2 text-[9px] text-slate-500 italic text-center">
                                Direct Mapped: Index = Address % 4
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. PHYSICAL MEMORY (RAM MATRIX) */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-800 rounded-xl border border-slate-600 shadow-xl flex flex-col h-full relative overflow-hidden">
                        <div className="bg-slate-900 p-3 border-b border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Layers size={18} />
                                <h2 className="text-sm font-bold uppercase tracking-wider">RAM MATRIX</h2>
                            </div>
                            <span className="text-[10px] font-mono text-slate-600">2D VIEW</span>
                        </div>

                        <div className="flex-1 overflow-auto bg-black/40 p-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-1 px-2 text-left text-[9px] text-slate-600 font-mono border-b border-slate-700 sticky left-0 bg-slate-900 z-20">ADDR</th>
                                        {Array.from({ length: 16 }).map((_, i) => (
                                            <th key={i} className="p-1 text-center text-[9px] text-green-500/50 font-mono border-b border-slate-700 min-w-[30px]">
                                                {i.toString(16).toUpperCase()}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: ROWS_TO_DISPLAY }).map((_, rowIndex) => {
                                        const segmentVal = START_SEGMENT + rowIndex;
                                        const isCurrentRow = segmentVal === regSegment;

                                        return (
                                            <tr key={rowIndex} className={`hover:bg-white/5 ${isCurrentRow ? 'bg-orange-500/5' : ''}`}>
                                                {/* Segment Header */}
                                                <td className="p-1 px-2 text-left font-mono text-[10px] border-r border-slate-700/50 text-orange-500/80 font-bold sticky left-0 bg-slate-900/95 z-10">
                                                    {toHex(segmentVal)}:
                                                </td>

                                                {/* Binary Cells */}
                                                {Array.from({ length: 16 }).map((_, colIndex) => {
                                                    const linearIdx = (rowIndex * 16) + colIndex;
                                                    const cellData = memory[linearIdx];
                                                    const isActive = isCurrentRow && colIndex === regOffset;

                                                    return (
                                                        <td key={colIndex} className="p-0.5 relative">
                                                            <div className={`
                                                                h-6 w-full min-w-[45px] text-[8px] font-mono flex items-center justify-center rounded transition-all duration-100
                                                                ${isActive
                                                                    ? 'bg-blue-600 text-white shadow-lg scale-110 z-10 font-bold border border-blue-400'
                                                                    : cellData
                                                                        ? 'bg-slate-700 text-blue-200 border border-slate-600'
                                                                        : 'bg-transparent text-slate-800 border border-slate-800/50'}
                                                            `}>
                                                                {cellData || "........"}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-slate-900/80 p-2 text-[10px] text-center text-slate-500 border-t border-slate-700 backdrop-blur">
                            Gunakan Scroll Horizontal untuk melihat kolom F
                        </div>
                    </div>
                </div>

            </div>
            {/* Quiz Mode */}
            {showQuiz && (
                <QuizMode
                    moduleId="memory"
                    moduleName="Pengalamatan Memori"
                    questions={memoryQuizQuestions}
                    onClose={() => setShowQuiz(false)}
                />
            )}
        </div>
    );
};

export default PengalamatanMemori;
