import React, { useState, useMemo } from 'react';
import {
    Cpu,
    Lightbulb,
    Info,
    Settings,
    Play,
    HelpCircle,
    X,
    BookOpen,
    Zap,
    CheckCircle2,
    AlertTriangle,
    Layers,
    Activity,
    Trophy // Import Trophy icon
} from 'lucide-react';
import QuizMode, { logicGateQuizQuestions } from '../components/QuizMode';

// --- Konfigurasi Gerbang Logika ---
const GATES_CONFIG = {
    AND: {
        name: "AND (DAN)",
        description: "Output bernilai 1 hanya jika KEDUA input bernilai 1.",
        formula: "Y = A • B",
        inputs: 2,
        logic: (a, b) => a && b,
        color: "#3b82f6"
    },
    OR: {
        name: "OR (ATAU)",
        description: "Output bernilai 1 jika SALAH SATU atau kedua input bernilai 1.",
        formula: "Y = A + B",
        inputs: 2,
        logic: (a, b) => a || b,
        color: "#ec4899"
    },
    NOT: {
        name: "NOT (TIDAK)",
        description: "Membalikkan nilai input. Jika input 1 maka output 0, dan sebaliknya.",
        formula: "Y = Ā",
        inputs: 1,
        logic: (a) => !a,
        color: "#ef4444"
    },
    NAND: {
        name: "NAND (NOT-AND)",
        description: "Kebalikan dari AND. Output bernilai 0 hanya jika semua input bernilai 1.",
        formula: "Y = ¬(A • B)",
        inputs: 2,
        logic: (a, b) => !(a && b),
        color: "#8b5cf6"
    },
    NOR: {
        name: "NOR (NOT-OR)",
        description: "Kebalikan dari OR. Output bernilai 1 hanya jika semua input bernilai 0.",
        formula: "Y = ¬(A + B)",
        inputs: 2,
        logic: (a, b) => !(a || b),
        color: "#f59e0b"
    },
    XOR: {
        name: "XOR (EXCLUSIVE OR)",
        description: "Output bernilai 1 jika nilai kedua input BERBEDA.",
        formula: "Y = A ⊕ B",
        inputs: 2,
        logic: (a, b) => a !== b,
        color: "#10b981"
    },
    XNOR: {
        name: "XNOR (EXCLUSIVE NOR)",
        description: "Kebalikan dari XOR. Output bernilai 1 jika nilai kedua input SAMA.",
        formula: "Y = A ⊙ B",
        inputs: 2,
        logic: (a, b) => a === b,
        color: "#06b6d4"
    },
    COMBO_1: {
        name: "Gabungan: (A AND B) OR C",
        description: "Input A dan B diproses oleh gerbang AND, lalu hasilnya diproses bersama Input C menggunakan gerbang OR.",
        formula: "Y = (A • B) + C",
        inputs: 3,
        logic: (a, b, c) => (a && b) || c,
        color: "#f43f5e"
    },
    COMBO_2: {
        name: "Gabungan: (A OR B) AND NOT C",
        description: "Input A dan B diproses OR, lalu hasilnya digabung dengan kebalikan dari Input C (NOT C) menggunakan gerbang AND.",
        formula: "Y = (A + B) • ¬C",
        inputs: 3,
        logic: (a, b, c) => (a || b) && !c,
        color: "#e11d48"
    }
};

const GerbangLogika = () => {
    const [activeGate, setActiveGate] = useState('AND');
    const [inputA, setInputA] = useState(false);
    const [inputB, setInputB] = useState(false);
    const [inputC, setInputC] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false); // Quiz State

    const gateData = GATES_CONFIG[activeGate];

    const outputValue = useMemo(() => {
        return gateData.logic(inputA, inputB, inputC);
    }, [activeGate, inputA, inputB, inputC]);

    const handleToggleInput = (type) => {
        if (type === 'A') setInputA(!inputA);
        else if (type === 'B') setInputB(!inputB);
        else setInputC(!inputC);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden font-sans">

            {/* HEADER */}
            <header className="h-16 shrink-0 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 lg:px-6 z-30">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg shrink-0 shadow-lg shadow-blue-900/20">
                        <Zap size={18} className="text-white" />
                    </div>
                    <div className="overflow-hidden">
                        <h1 className="font-bold text-sm md:text-lg leading-tight truncate uppercase tracking-tight">V-Lab Informatika</h1>
                        <p className="text-[10px] md:text-xs text-slate-400 truncate italic">Simulator Gerbang Logika</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowQuiz(true)}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Trophy size={14} />
                        <span className="uppercase tracking-wider">Quiz</span>
                    </button>

                    <div className={`px-2 md:px-4 py-1.5 rounded-full border transition-all duration-500 flex items-center gap-2 ${outputValue ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${outputValue ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="text-[10px] md:text-xs font-bold font-mono">STATUS: {outputValue ? 'HIGH (1)' : 'LOW (0)'}</span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* NAVIGASI GERBANG (RESPONSIF) */}
                <nav className="lg:w-64 bg-slate-900 border-b lg:border-r border-slate-800 flex lg:flex-col overflow-x-auto lg:overflow-y-auto shrink-0 z-20 no-scrollbar p-2 lg:p-4 gap-2">
                    <div className="hidden lg:block mb-2 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pilih Gerbang</div>
                    {Object.entries(GATES_CONFIG).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setActiveGate(key);
                                if (config.inputs < 3) setInputC(false);
                            }}
                            className={`flex items-center gap-2 lg:gap-3 px-4 py-2 lg:p-3 rounded-lg lg:rounded-xl transition-all whitespace-nowrap lg:w-full border ${activeGate === key
                                ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/30'
                                : 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 border-transparent hover:border-slate-700'
                                }`}
                        >
                            {config.inputs >= 3 ? <Layers size={16} /> : <Cpu size={16} />}
                            <span className="font-bold text-xs md:text-sm">{config.name.split(':')[0]}</span>
                        </button>
                    ))}
                </nav>

                {/* AREA KERJA */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 relative bg-slate-950">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">

                        {/* KOLOM KIRI: Penjelasan & Kontrol */}
                        <div className="space-y-6">
                            <section className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                                <div className="bg-green-600 px-5 py-2 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-green-100 uppercase tracking-widest flex items-center gap-2">
                                        <BookOpen size={14} /> Penjelasan Materi
                                    </span>
                                    <span className="text-[9px] bg-green-700 px-2 py-0.5 rounded text-green-200 font-bold uppercase tracking-tighter">
                                        {gateData.inputs} Input
                                    </span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold mb-2 text-white">{gateData.name}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                        {gateData.description}
                                    </p>
                                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
                                        <span className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-widest text-center">Rumus Logika (Aljabar Boolean)</span>
                                        <span className="text-3xl md:text-4xl font-mono font-bold text-blue-400 text-center">
                                            {gateData.formula}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
                                <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <Settings size={14} /> Kontrol Input
                                </h3>
                                <div className="grid gap-3">
                                    {[
                                        { id: 'A', val: inputA, color: 'blue' },
                                        { id: 'B', val: inputB, color: 'pink', hidden: gateData.inputs < 2 },
                                        { id: 'C', val: inputC, color: 'yellow', hidden: gateData.inputs < 3 }
                                    ].map((inp) => !inp.hidden && (
                                        <div key={inp.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Input Terminal {inp.id}</span>
                                                <span className={`text-lg font-bold ${inp.val ? (inp.id === 'A' ? 'text-blue-400' : inp.id === 'B' ? 'text-pink-400' : 'text-yellow-400') : 'text-slate-600'}`}>
                                                    {inp.val ? 'HIGH (1)' : 'LOW (0)'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleToggleInput(inp.id)}
                                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${inp.val ? (inp.id === 'A' ? 'bg-blue-600' : inp.id === 'B' ? 'bg-pink-600' : 'bg-yellow-600') : 'bg-slate-800 border border-slate-700'}`}
                                            >
                                                <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${inp.val ? 'translate-x-7' : ''}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* KOLOM KANAN: Visualisasi 3D & Tabel */}
                        <div className="space-y-6">
                            <section className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
                                <div className="bg-slate-800/50 px-5 py-2 flex items-center justify-between border-b border-slate-700">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={14} /> Visualisasi Rangkaian
                                    </span>
                                </div>

                                {/* Simple 2D Circuit Visualization */}
                                <div className="flex-1 p-6 flex items-center justify-center min-h-[200px]">
                                    <div className="flex items-center gap-4">

                                        {/* Input Terminal(s) */}
                                        <div className="flex flex-col gap-3">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-all duration-300 ${inputA ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                                A
                                            </div>
                                            {gateData.inputs >= 2 && (
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-all duration-300 ${inputB ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                                    B
                                                </div>
                                            )}
                                            {gateData.inputs >= 3 && (
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-all duration-300 ${inputC ? 'bg-yellow-600 border-yellow-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                                    C
                                                </div>
                                            )}
                                        </div>

                                        {/* Connection Lines */}
                                        <div className="flex flex-col gap-3 items-center">
                                            <div className={`w-8 h-1 ${inputA ? 'bg-blue-500' : 'bg-slate-700'} transition-colors`}></div>
                                            {gateData.inputs >= 2 && <div className={`w-8 h-1 ${inputB ? 'bg-pink-500' : 'bg-slate-700'} transition-colors`}></div>}
                                            {gateData.inputs >= 3 && <div className={`w-8 h-1 ${inputC ? 'bg-yellow-500' : 'bg-slate-700'} transition-colors`}></div>}
                                        </div>

                                        {/* Gate Symbol */}
                                        <div
                                            className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center font-black text-sm border-2 transition-all duration-300 shadow-lg`}
                                            style={{
                                                backgroundColor: gateData.color + '20',
                                                borderColor: gateData.color,
                                                color: gateData.color
                                            }}
                                        >
                                            <Cpu size={24} />
                                            <span className="text-[10px] mt-1">{activeGate}</span>
                                        </div>

                                        {/* Output Line */}
                                        <div className={`w-8 h-1 ${outputValue ? 'bg-green-500' : 'bg-slate-700'} transition-colors`}></div>

                                        {/* Output LED */}
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${outputValue ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-slate-800 border-2 border-slate-700'}`}>
                                            <Lightbulb size={28} className={outputValue ? 'text-white' : 'text-slate-600'} />
                                        </div>
                                    </div>
                                </div>

                                {/* Output Status */}
                                <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${outputValue ? 'bg-green-500' : 'bg-slate-800'}`}>
                                            <Lightbulb size={20} className={outputValue ? 'text-white' : 'text-slate-600'} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Output (Y)</p>
                                            <h4 className={`text-lg font-bold ${outputValue ? 'text-green-400' : 'text-slate-600'}`}>
                                                {outputValue ? 'HIGH (1)' : 'LOW (0)'}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Tabel Kebenaran</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-center font-mono">
                                        <thead>
                                            <tr className="text-slate-500 border-b border-slate-800">
                                                <th className="pb-2">A</th>
                                                {gateData.inputs >= 2 && <th className="pb-2">B</th>}
                                                {gateData.inputs >= 3 && <th className="pb-2">C</th>}
                                                <th className="pb-2 text-blue-400 font-bold border-l border-slate-800">Y (HASIL)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from({ length: Math.pow(2, gateData.inputs) }).map((_, idx) => {
                                                const a = !!(idx & (1 << (gateData.inputs - 1)));
                                                const b = !!(idx & (1 << (gateData.inputs - 2)));
                                                const c = !!(idx & (1 << (gateData.inputs - 3)));
                                                const res = gateData.logic(a, b, c);
                                                const isCurrent = (a === inputA && (gateData.inputs < 2 || b === inputB) && (gateData.inputs < 3 || c === inputC));

                                                return (
                                                    <tr key={idx} className={`transition-all ${isCurrent ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-600'}`}>
                                                        <td className="py-2">{a ? '1' : '0'}</td>
                                                        {gateData.inputs >= 2 && <td className="py-2">{b ? '1' : '0'}</td>}
                                                        {gateData.inputs >= 3 && <td className="py-2">{c ? '1' : '0'}</td>}
                                                        <td className={`py-2 border-l ${isCurrent ? 'border-blue-500' : 'border-slate-800'} font-bold`}>
                                                            {res ? '1' : '0'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>

                    </div>
                </div>

                {/* STATUS BAR */}
                <footer className="h-8 shrink-0 bg-slate-900 border-t border-slate-800 flex items-center px-4 lg:px-6 justify-between z-10">
                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">
                        <span className="flex items-center gap-1.5 shrink-0"><div className="w-1 h-1 rounded-full bg-blue-500" /> V-Lab System Ready</span>
                        <span className="hidden sm:inline italic text-slate-600 capitalize">Informatika SMP</span>
                    </div>
                    <div className="text-[9px] text-slate-600 font-mono whitespace-nowrap">
                        Mode Praktik Mandiri
                    </div>
                </footer>
            </main>

            {/* FAB BANTUAN */}
            <button
                onClick={() => setIsDrawerOpen(true)}
                className="fixed bottom-12 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex flex-col items-center justify-center transition-transform active:scale-90 z-40 group"
            >
                <HelpCircle size={24} />
                <span className="text-[8px] font-bold mt-1 uppercase">Petunjuk</span>
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
            </button>

            {/* DRAWER PANDUAN */}
            {isDrawerOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
                    <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 animate-in slide-in-from-right">
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Info className="text-blue-400" /> Panduan Praktik
                                </h2>
                                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><X size={24} /></button>
                            </div>

                            <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <section>
                                    <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Misi Belajar</h3>
                                    <div className="p-4 bg-slate-950 rounded-xl border-l-4 border-blue-600">
                                        <p className="text-sm leading-relaxed text-slate-300">
                                            "Pilih gerbang <strong>XNOR</strong>. Bisakah kamu membuat lampu LED menyala? Ingat, XNOR menghasilkan 1 jika kedua input bernilai SAMA."
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Langkah Teknis</h3>
                                    <div className="space-y-4">
                                        {[
                                            { step: 1, text: "Pilih gerbang logika dari menu navigasi." },
                                            { step: 2, text: "Gunakan saklar Input A, B, atau C untuk mengubah nilai logika." },
                                            { step: 3, text: "Baris biru di Tabel Kebenaran menunjukkan kondisi input saat ini." },
                                            { step: 4, text: "Amati perubahan LED pada model 3D di sebelah kanan." }
                                        ].map((item) => (
                                            <div key={item.step} className="flex gap-4 items-start">
                                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 border border-slate-700">
                                                    {item.step}
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="p-4 bg-amber-900/10 rounded-xl border border-amber-900/20 flex gap-3 items-start">
                                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                    <div className="text-xs text-slate-400 leading-relaxed">
                                        <strong>Catatan:</strong> XNOR sering disebut sebagai gerbang 'Kesamaan' karena hanya aktif jika inputnya sama.
                                    </div>
                                </section>
                            </div>

                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg mt-6 active:scale-95 transition-all"
                            >
                                Saya Siap Praktik!
                            </button>
                        </div>
                    </div>
                </>
            )}
            {/* QUIZ MODE */}
            {showQuiz && (
                <QuizMode
                    moduleId="logic_gate"
                    moduleName="Gerbang Logika"
                    questions={logicGateQuizQuestions}
                    onClose={() => setShowQuiz(false)}
                />
            )}
        </div>
    );
};

export default GerbangLogika;