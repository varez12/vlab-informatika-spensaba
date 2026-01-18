import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Cpu, Monitor, Zap, ArrowRight, Play, RotateCcw, Activity, BookOpen, Trophy } from 'lucide-react';
import QuizMode, { cpuQuizQuestions } from '../components/QuizMode';

const PemrosesanData = () => {
    // State management
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeKey, setActiveKey] = useState(null);
    const [processingStage, setProcessingStage] = useState('idle'); // idle, transport-input, processing, transport-output, done
    const [processDetail, setProcessDetail] = useState('char'); // char, ascii, binary
    const [currentData, setCurrentData] = useState({ char: '', ascii: '', binary: '' });
    const [showQuiz, setShowQuiz] = useState(false); // Quiz State

    // References for scrolling
    const monitorRef = useRef(null);

    // Keyboard layout (simplified)
    const keyboardRows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'SPACE', 'BACKSPACE']
    ];

    // Helper: Convert char to binary
    const toBinary = (char) => {
        if (char === 'SPACE') return '00100000';
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    };

    // Handle Input
    const handleInput = (key) => {
        if (isProcessing) return; // Block input while processing previous char

        setActiveKey(key);
        setIsProcessing(true);

        // 1. INPUT STAGE
        setProcessingStage('transport-input');

        // Prepare data
        let charDisplay = key;
        let charCode = key;
        if (key === 'SPACE') {
            charDisplay = '␣';
            charCode = ' ';
        } else if (key === 'BACKSPACE') {
            charDisplay = '⌫';
            charCode = '';
        }

        setCurrentData({
            char: charDisplay,
            ascii: key === 'BACKSPACE' ? '' : (charCode ? charCode.toString().charCodeAt(0) : 0),
            binary: key === 'BACKSPACE' ? 'DELETE' : toBinary(charCode || key)
        });

        // 2. PROCESS STAGE (after delay)
        setTimeout(() => {
            setProcessingStage('processing');
            setProcessDetail('char');
            setActiveKey(null); // Unhighlight key

            // Sequence: Char -> ASCII -> Binary
            setTimeout(() => setProcessDetail('ascii'), 600);
            setTimeout(() => setProcessDetail('binary'), 1200);

            // 3. OUTPUT TRANSPORT STAGE
            setTimeout(() => {
                setProcessingStage('transport-output');

                // 4. FINISH
                setTimeout(() => {
                    if (key === 'BACKSPACE') {
                        setOutputText(prev => prev.slice(0, -1));
                    } else if (key === 'SPACE') {
                        setOutputText(prev => prev + ' ');
                    } else {
                        setOutputText(prev => prev + key);
                    }

                    setProcessingStage('idle');
                    setIsProcessing(false);
                    setCurrentData({ char: '', binary: '' });
                }, 800); // Travel time to monitor

            }, 2000); // Processing time (increased for 3 steps)
        }, 800); // Travel time from keyboard
    };

    // Auto-scroll monitor
    useEffect(() => {
        if (monitorRef.current) {
            monitorRef.current.scrollTop = monitorRef.current.scrollHeight;
        }
    }, [outputText]);

    // Handle Physical Keyboard
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isProcessing) return;

            const key = e.key.toUpperCase();
            if (/^[A-Z]$/.test(key)) {
                handleInput(key);
            } else if (e.key === ' ') {
                handleInput('SPACE');
            } else if (e.key === 'Backspace') {
                handleInput('BACKSPACE');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isProcessing]);

    return (
        <div className="h-[calc(100vh-4rem)] bg-slate-50 p-6 md:p-8 font-jakarta pb-40 overflow-y-auto">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Alur Pemrosesan Data</h1>
                        <p className="text-slate-500 font-medium mt-1">Simulasi Input - Proses - Output (IPO)</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border-2 border-slate-100 shadow-sm flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        <span className="text-xs font-bold text-slate-600 uppercase">
                            {isProcessing ? 'SISTEM SIBUK' : 'SIAP MENERIMA DATA'}
                        </span>
                    </div>
                    <button
                        onClick={() => setShowQuiz(true)}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl border-2 border-yellow-500 shadow-sm flex items-center gap-2 font-bold transition-all text-sm uppercase tracking-wider"
                    >
                        <Trophy size={16} /> Kuis
                    </button>
                </div>
            </div>

            {/* Main Stage */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-stretch">

                {/* 1. INPUT UNIT (KEYBOARD) */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-3xl border-b-8 border-indigo-600 shadow-xl overflow-hidden flex-1 flex flex-col">
                        <div className="bg-indigo-600 p-4 border-b border-indigo-500 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Keyboard size={24} />
                                <h2 className="font-bold text-lg">INPUT</h2>
                            </div>
                            <span className="text-xs font-mono opacity-70 bg-indigo-800 px-2 py-1 rounded">DEVICE: KEYBOARD</span>
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-center bg-slate-100">
                            <div className="bg-slate-800 p-4 rounded-2xl shadow-inner mx-auto max-w-full">
                                {keyboardRows.map((row, rowIndex) => (
                                    <div key={rowIndex} className="flex justify-center gap-1.5 mb-1.5">
                                        {row.map((key) => {
                                            const isSpecial = key.length > 1;
                                            const isActive = activeKey === key;
                                            return (
                                                <button
                                                    key={key}
                                                    disabled={isProcessing}
                                                    onClick={() => handleInput(key)}
                                                    className={`
                                                        rounded-lg font-bold text-xs md:text-sm shadow-[0_4px_0_rgb(0,0,0,0.2)] transition-all active:translate-y-[2px] active:shadow-[0_2px_0_rgb(0,0,0,0.2)]
                                                        ${isSpecial ? 'px-3 md:px-6' : 'w-8 h-10 md:w-10 md:h-12'}
                                                        ${isActive
                                                            ? 'bg-yellow-400 text-slate-900 border-2 border-yellow-500 translate-y-[2px] shadow-none ring-2 ring-yellow-200'
                                                            : 'bg-slate-200 text-slate-700 hover:bg-white'}
                                                        ${isProcessing ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
                                                    `}
                                                >
                                                    {key === 'SPACE' ? '___' : key === 'BACKSPACE' ? '⌫' : key}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-xs text-slate-500 mt-4 font-medium">
                                Ketik di keyboard fisikmu atau klik tombol di layar
                            </p>
                        </div>
                    </div>
                </div>

                {/* ANIMATION CONNECTOR 1 (Input -> Process) */}
                <div className="hidden lg:flex absolute left-[30%] top-1/2 -translate-y-1/2 w-[10%] justify-center z-10">
                    <div className="relative w-full h-12 bg-slate-200 rounded-lg flex items-center px-2 shadow-inner overflow-hidden">
                        {processingStage === 'transport-input' && (
                            <div className="absolute left-0 w-8 h-8 bg-yellow-400 rounded-full shadow-md flex items-center justify-center font-bold text-xs animate-[item-move-right_0.8s_linear_forwards]">
                                {currentData.char}
                            </div>
                        )}
                        <div className="w-full flex justify-between px-1 opacity-20">
                            <ArrowRight size={16} />
                            <ArrowRight size={16} />
                            <ArrowRight size={16} />
                        </div>
                    </div>
                </div>

                {/* 2. PROCESS UNIT (CPU) */}
                <div className="flex flex-col gap-4 relative z-0">
                    <div className="bg-white rounded-3xl border-b-8 border-orange-500 shadow-xl overflow-hidden flex-1 flex flex-col">
                        <div className="bg-orange-500 p-4 border-b border-orange-400 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Cpu size={24} />
                                <h2 className="font-bold text-lg">PROCESS</h2>
                            </div>
                            <span className="text-xs font-mono opacity-70 bg-orange-700 px-2 py-1 rounded">DEVICE: CPU</span>
                        </div>

                        <div className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
                            {/* Processor Visual */}
                            <div className={`relative w-48 h-48 bg-slate-800 rounded-2xl border-4 ${processingStage === 'processing' ? 'border-orange-400 shadow-[0_0_30px_rgba(251,146,60,0.5)]' : 'border-slate-300'} flex items-center justify-center transition-all duration-300`}>
                                <div className="absolute inset-2 border border-slate-600 rounded-xl opacity-50"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700 to-slate-900 rounded-xl"></div>

                                <div className="z-10 text-center">
                                    <h3 className="text-slate-400 text-xs font-bold tracking-widest mb-2">INTEL CORE</h3>
                                    {processingStage === 'processing' ? (
                                        <div className="animate-in zoom-in duration-300 flex flex-col items-center">
                                            {/* Step 1: Character */}
                                            {processDetail === 'char' && (
                                                <>
                                                    <div className="text-5xl font-black text-white mb-1 animate-in slide-in-from-top">{currentData.char}</div>
                                                    <span className="text-xs text-slate-400">Input</span>
                                                </>
                                            )}

                                            {/* Step 2: ASCII */}
                                            {processDetail === 'ascii' && (
                                                <>
                                                    <div className="text-5xl font-black text-yellow-400 mb-1 animate-in zoom-in spin-in-3">{currentData.ascii}</div>
                                                    <span className="text-xs text-yellow-500 font-bold">Kode ASCII</span>
                                                </>
                                            )}

                                            {/* Step 3: Binary */}
                                            {processDetail === 'binary' && (
                                                <>
                                                    <div className="font-mono text-xl text-green-400 font-black tracking-widest bg-slate-900 px-3 py-2 rounded border border-green-500/50 animate-in flip-in-x">
                                                        {currentData.binary}
                                                    </div>
                                                    <span className="text-xs text-green-500 font-bold mt-1">Biner</span>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-slate-600">
                                            <Activity size={40} className="mx-auto mb-2 opacity-50" />
                                            <span className="text-xs">IDLE</span>
                                        </div>
                                    )}
                                </div>

                                {/* Corner Decorations */}
                                <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            </div>

                            {/* Narration */}
                            <div className="mt-6 h-12 text-center w-full">
                                {processingStage === 'processing' && (
                                    <p className="text-sm font-medium bg-slate-100 px-3 py-1.5 rounded-full inline-flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 border border-slate-200 shadow-sm">
                                        {processDetail === 'char' && <span className="text-slate-600">Menerima Input <strong>{currentData.char}</strong>...</span>}
                                        {processDetail === 'ascii' && <span className="text-yellow-700">Ubah ke ASCII: <strong>{currentData.ascii}</strong></span>}
                                        {processDetail === 'binary' && <span className="text-green-700">Konversi ke Biner: <strong>{currentData.binary}</strong></span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ANIMATION CONNECTOR 2 (Process -> Output) */}
                <div className="hidden lg:flex absolute right-[30%] top-1/2 -translate-y-1/2 w-[10%] justify-center z-10">
                    <div className="relative w-full h-12 bg-slate-200 rounded-lg flex items-center px-2 shadow-inner overflow-hidden">
                        {processingStage === 'transport-output' && (
                            <div className="absolute left-0 w-8 h-8 bg-teal-400 rounded-full shadow-md flex items-center justify-center font-bold text-xs animate-[item-move-right_0.8s_linear_forwards]">
                                {currentData.char}
                            </div>
                        )}
                        <div className="w-full flex justify-between px-1 opacity-20">
                            <ArrowRight size={16} />
                            <ArrowRight size={16} />
                            <ArrowRight size={16} />
                        </div>
                    </div>
                </div>

                {/* 3. OUTPUT UNIT (MONITOR) */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-3xl border-b-8 border-teal-500 shadow-xl overflow-hidden flex-1 flex flex-col">
                        <div className="bg-teal-500 p-4 border-b border-teal-400 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Monitor size={24} />
                                <h2 className="font-bold text-lg">OUTPUT</h2>
                            </div>
                            <span className="text-xs font-mono opacity-70 bg-teal-700 px-2 py-1 rounded">DEVICE: LCD</span>
                        </div>

                        <div className="p-6 flex-1 bg-slate-50 flex flex-col">
                            {/* Screen Container */}
                            <div className="bg-slate-900 rounded-t-xl p-4 border-4 border-slate-300 flex-1 min-h-[200px] relative shadow-lg">
                                {/* Screen Glare */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-[0.03] rounded-full blur-2xl -translate-y-16 translate-x-16 pointer-events-none"></div>

                                {/* Content */}
                                <div
                                    ref={monitorRef}
                                    className="font-mono text-xl md:text-2xl text-green-400 h-full overflow-y-auto break-words whitespace-pre-wrap leading-relaxed"
                                >
                                    {outputText}
                                    <span className="w-3 h-5 bg-green-400 inline-block align-middle ml-1 animate-pulse"></span>
                                </div>
                            </div>

                            {/* Monitor Stand */}
                            <div className="h-8 bg-slate-300 mx-auto w-1/3 rounded-b-lg shadow-sm"></div>
                            <div className="h-2 bg-slate-300 mx-auto w-1/2 rounded-full mt-1 shadow-sm opacity-50"></div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => setOutputText('')}
                                    className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <RotateCcw size={14} /> RESET MONITOR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Explanation Footer */}
            <div className="max-w-7xl mx-auto mt-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Monitor size={20} /></span>
                    Penjelasan Proses (IPOS)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="relative pl-6 border-l-4 border-indigo-200">
                        <div className="absolute -left-2.5 top-0 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">1</div>
                        <h4 className="font-bold text-slate-800 mb-2">INPUT (Masukan)</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Saat kamu menekan tombol di <strong>Keyboard</strong>, keyboard mengirimkan sinyal elektronik ke komputer. Tombol 'A' yang kamu tekan belum berupa huruf di layar, melainkan sinyal listrik.
                        </p>
                    </div>

                    <div className="relative pl-6 border-l-4 border-orange-200">
                        <div className="absolute -left-2.5 top-0 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">2</div>
                        <h4 className="font-bold text-slate-800 mb-2">PROCESS (Pemrosesan)</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            <strong>Processor (CPU)</strong> menerima sinyal dan mengubahnya menjadi angka menggunakan standar <strong>ASCII</strong> (misal 'A' = 65). Lalu angka tersebut diubah menjadi <strong>Biner</strong> (bahasa mesin 0 dan 1) agar bisa diproses.
                            <br />
                            <span className="inline-block mt-1 text-xs font-mono bg-orange-50 text-orange-700 px-2 py-1 rounded">Contoh: 'A' → 65 → 01000001</span>
                        </p>
                    </div>

                    <div className="relative pl-6 border-l-4 border-teal-200">
                        <div className="absolute -left-2.5 top-0 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</div>
                        <h4 className="font-bold text-slate-800 mb-2">OUTPUT (Keluaran)</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Hasil pemrosesan dikirim ke <strong>Monitor</strong>.
                            Monitor mengubah data biner tadi menjadi titik-titik cahaya (pixel) yang membentuk gambar huruf 'A' yang bisa kamu baca.
                        </p>
                    </div>
                </div>



            </div>

            <style>{`
                @keyframes item-move-right {
                    0% { left: 0; opacity: 0; transform: scale(0.5); }
                    10% { opacity: 1; transform: scale(1); }
                    90% { opacity: 1; transform: scale(1); }
                    100% { left: 100%; opacity: 0; transform: scale(0.5); }
                }
            `}</style>
            {/* Quiz Mode */}
            {showQuiz && (
                <QuizMode
                    moduleId="cpu"
                    moduleName="Pemrosesan Data (CPU)"
                    questions={cpuQuizQuestions}
                    onClose={() => setShowQuiz(false)}
                />
            )}
        </div>
    );
};

export default PemrosesanData;
