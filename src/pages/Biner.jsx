import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import NumberSystemNav from '../components/NumberSystemNav';
import {
    Calculator,
    Binary,
    CheckCircle2,
    AlertCircle,
    X,
    ChevronRight,
    Lightbulb,
    Trophy,
    RefreshCw,
    HelpCircle,
    PlayCircle,
    BookOpen,
    ArrowRight,
    Target,
    PauseCircle,
    Plus,
    BookOpenText // Replaced nonexistent PlayCircle icon if needed or keep existing
} from 'lucide-react';
import QuizMode, { numberConversionQuizQuestions } from '../components/QuizMode';

const Biner = () => {
    const [searchParams] = useSearchParams();

    // Navigation State
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'explanation'); // 'explanation' or 'practice'
    const [practiceSubMode, setPracticeSubMode] = useState(searchParams.get('mode') || 'decToBin'); // 'decToBin' or 'binToDec'

    // Explanation State
    const [explMode, setExplMode] = useState(searchParams.get('mode') || 'decToBin'); // 'decToBin' or 'binToDec'
    const [explInput, setExplInput] = useState(explMode === 'decToBin' ? '25' : '11001');
    const [explStep, setExplStep] = useState(-1);
    const [explHistory, setExplHistory] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);

    // Practice State
    const [targetNum, setTargetNum] = useState(0);
    const [targetBin, setTargetBin] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [stepsData, setStepsData] = useState([]);
    const [userInputs, setUserInputs] = useState({ quotient: '', remainder: '', bitValue: '' });
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState({ status: 'idle', message: '' });
    const [showDrawer, setShowDrawer] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false); // Quiz State

    // Sync URL Params
    useEffect(() => {
        const tab = searchParams.get('tab');
        const mode = searchParams.get('mode');
        if (tab) setActiveTab(tab);
        if (mode) {
            setExplMode(mode);
            setPracticeSubMode(mode);
        }
    }, [searchParams]);

    // --- Logic Functions ---
    const getDecToBinSteps = (num) => {
        let steps = [];
        let current = parseInt(num);
        if (isNaN(current)) return [];
        if (current === 0) return [{ val: 0, q: 0, r: 0 }];
        while (current > 0) {
            let r = current % 2;
            let q = Math.floor(current / 2);
            steps.push({ val: current, q, r });
            current = q;
        }
        return steps;
    };

    const getBinToDecSteps = (binStr) => {
        if (!/^[01]+$/.test(binStr)) return [];
        return binStr.split('').reverse().map((bit, i) => ({
            bit: parseInt(bit),
            power: i,
            val: parseInt(bit) * Math.pow(2, i),
            powerVal: Math.pow(2, i)
        })).reverse();
    };

    // --- Animation Side Effects ---
    useEffect(() => {
        let timer;
        if (isAnimating && explStep < explHistory.length - 1) {
            timer = setTimeout(() => {
                setExplStep(prev => prev + 1);
            }, 1200);
        } else if (explStep >= explHistory.length - 1) {
            setIsAnimating(false);
        }
        return () => clearTimeout(timer);
    }, [isAnimating, explStep, explHistory]);

    // --- Event Handlers ---
    const startExplanation = () => {
        let steps = [];
        if (explMode === 'decToBin') {
            steps = getDecToBinSteps(explInput);
        } else {
            if (!/^[01]+$/.test(explInput)) {
                alert("Input biner hanya boleh berisi angka 0 dan 1");
                return;
            }
            steps = getBinToDecSteps(explInput);
        }

        if (steps.length === 0) return;
        setExplHistory(steps);
        setExplStep(0);
        setIsAnimating(true);
    };

    const startNewChallenge = (mode) => {
        const num = Math.floor(Math.random() * 31) + 5;
        const bin = num.toString(2);
        setTargetNum(num);
        setTargetBin(bin);
        setPracticeSubMode(mode);
        setCurrentStep(0);
        setIsFinished(false);
        setFeedback({ status: 'idle', message: '' });
        setUserInputs({ quotient: '', remainder: '', bitValue: '' });

        if (mode === 'decToBin') {
            setStepsData([{ val: num, q: '', r: '' }]);
        } else {
            setStepsData(bin.split('').map((bit, i) => ({
                bit: parseInt(bit),
                power: bin.length - 1 - i,
                val: ''
            })));
        }
    };

    const checkPracticeStep = () => {
        if (practiceSubMode === 'decToBin') {
            const task = stepsData[currentStep];
            const correctQ = Math.floor(task.val / 2);
            const correctR = task.val % 2;

            if (parseInt(userInputs.quotient) === correctQ && parseInt(userInputs.remainder) === correctR) {
                setFeedback({ status: 'correct', message: 'Langkah benar!' });
                if (correctQ === 0) setIsFinished(true);
                else {
                    const next = [...stepsData];
                    next[currentStep] = { ...task, q: correctQ, r: correctR };
                    next.push({ val: correctQ, q: '', r: '' });
                    setStepsData(next);
                    setCurrentStep(currentStep + 1);
                    setUserInputs({ quotient: '', remainder: '', bitValue: '' });
                }
            } else {
                setFeedback({ status: 'error', message: 'Cek kembali pembagianmu.' });
            }
        } else {
            const task = stepsData[currentStep];
            const correctVal = task.bit * Math.pow(2, task.power);
            if (parseInt(userInputs.bitValue) === correctVal) {
                setFeedback({ status: 'correct', message: 'Langkah benar!' });
                const next = [...stepsData];
                next[currentStep].val = correctVal;
                setStepsData(next);
                if (currentStep === stepsData.length - 1) setIsFinished(true);
                else {
                    setCurrentStep(currentStep + 1);
                    setUserInputs({ quotient: '', remainder: '', bitValue: '' });
                }
            } else {
                setFeedback({ status: 'error', message: 'Hitungan nilai tempat salah.' });
            }
        }
    };

    useEffect(() => {
        startNewChallenge('decToBin');
    }, []);

    return (
        <div className="h-full w-full bg-slate-50 font-sans text-slate-900 flex flex-col overflow-hidden select-none">
            {/* Unified Navigation */}
            <NumberSystemNav activePage="biner" />

            {/* Header */}
            {/* Header Removed as per request */}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                <div className="max-w-7xl mx-auto w-full p-6">

                    {activeTab === 'explanation' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Zona Konversi</h2>
                                    <p className="text-slate-500 font-medium mt-1">Pilih jenis konversi yang ingin dipelajari</p>
                                </div>
                                <div className="bg-white p-1.5 rounded-full border-2 border-slate-100 shadow-sm inline-flex">
                                    <button
                                        onClick={() => { setExplMode('decToBin'); setExplInput('25'); setExplHistory([]); setIsAnimating(false); }}
                                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${explMode === 'decToBin' ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'}`}
                                    >
                                        Desimal ke Biner
                                    </button>
                                    <button
                                        onClick={() => { setExplMode('binToDec'); setExplInput('11001'); setExplHistory([]); setIsAnimating(false); }}
                                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${explMode === 'binToDec' ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'}`}
                                    >
                                        Biner ke Desimal
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowQuiz(true)}
                                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                                >
                                    <Trophy size={14} /> Kuis
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
                                <div className={`p-4 text-white font-bold flex items-center gap-2 ${explMode === 'decToBin' ? 'bg-indigo-600' : 'bg-green-600'}`}>
                                    <PlayCircle size={20} />
                                    Simulasi : {explMode === 'decToBin' ? 'Konversi Desimal ke Biner' : 'Konversi Biner ke Desimal'}
                                </div>
                                <div className="p-8 flex flex-col md:flex-row gap-6 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                            {explMode === 'decToBin' ? 'Masukkan Angka Desimal' : 'Masukkan Angka Biner'}
                                        </label>
                                        <input
                                            type="text"
                                            value={explInput}
                                            onChange={(e) => {
                                                setExplInput(e.target.value);
                                                setIsAnimating(false);
                                                setExplHistory([]);
                                            }}
                                            className="w-full text-2xl font-mono p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500 transition-all"
                                            placeholder={explMode === 'decToBin' ? "Contoh: 25" : "Contoh: 11001"}
                                        />
                                    </div>
                                    {!isAnimating ? (
                                        <button
                                            onClick={startExplanation}
                                            className="px-8 py-5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 group shadow-lg whitespace-nowrap"
                                        >
                                            MULAI HITUNG <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsAnimating(false)}
                                            className="px-8 py-5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap"
                                        >
                                            HENTIKAN <PauseCircle size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {explHistory.length > 0 && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                                    {/* Left Column: Steps */}
                                    <div className="space-y-4 lg:col-span-2">
                                        <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">Urutan Perhitungan</h3>
                                        {explMode === 'decToBin' ? (
                                            /* --- MODE DESIMAL KE BINER (LIST VERTICAL) --- */
                                            explHistory.slice(0, explStep + 1).map((h, i) => (
                                                <div key={i} className={`bg-white p-5 rounded-2xl border-2 shadow-sm animate-in slide-in-from-left duration-500 ${i === explStep ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-100 opacity-80'}`}>
                                                    <div className="flex justify-between items-center font-mono">
                                                        <span className="text-slate-400 text-xs">Langkah {i + 1}</span>
                                                        {i === explStep && isAnimating && <span className="text-[10px] font-bold text-indigo-500 animate-pulse uppercase tracking-tighter">Memproses...</span>}
                                                    </div>
                                                    <div className="text-2xl mt-2 font-mono flex items-center gap-2">
                                                        {h.val} ÷ 2 = <span className="font-bold">{h.q}</span>
                                                        <span className="text-xs text-slate-400">sisa</span>
                                                        <span className="text-indigo-600 font-black">{h.r}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            /* --- MODE BINER KE DESIMAL (TABEL HORIZONTAL) --- */
                                            <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-x-auto shadow-sm animate-in fade-in">
                                                <table className="w-full text-center border-collapse min-w-[300px]">
                                                    <thead>
                                                        <tr className="border-b-2 border-slate-100 bg-slate-50/50">
                                                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left w-32 whitespace-nowrap">Bit (Biner)</th>
                                                            {explHistory.map((h, i) => (
                                                                <th key={i} className={`p-4 font-mono text-xl transition-all duration-500 ${i > explStep ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                                                                    {h.bit}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="border-b border-slate-100">
                                                            <td className="p-4 text-xs font-bold text-indigo-600 uppercase tracking-wider text-left whitespace-nowrap">Bobot (2<sup>n</sup>)</td>
                                                            {explHistory.map((h, i) => (
                                                                <td key={i} className={`p-4 font-mono text-indigo-600 font-bold transition-all duration-500 delay-100 ${i > explStep ? 'opacity-0' : 'opacity-100'}`}>
                                                                    2<sup>{h.power}</sup>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                        <tr>
                                                            <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left whitespace-nowrap">Perhitungan</td>
                                                            {explHistory.map((h, i) => (
                                                                <td key={i} className={`p-4 transition-all duration-500 delay-200 ${i > explStep ? 'opacity-0' : 'opacity-100'}`}>
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{h.bit} × 2<sup>{h.power}</sup></span>
                                                                        <span className="text-2xl font-black text-green-600">{h.val}</span>
                                                                    </div>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {explStep === explHistory.length - 1 && !isAnimating && (
                                            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in fade-in">
                                                <CheckCircle2 size={18} /> Simulasi selesai! Lihat hasil akhir di samping.
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Analysis */}
                                    <div className="sticky top-0 h-fit space-y-6">
                                        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                                            <h3 className="text-indigo-400 font-bold text-xs uppercase mb-4 tracking-widest">Hasil Akhir</h3>

                                            {explMode === 'decToBin' ? (
                                                <>
                                                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                                        Deretan biner didapatkan dengan membaca sisa bagi dari langkah <b>terakhir</b> ke <b>awal</b>.
                                                    </p>
                                                    <div className="bg-white/10 p-6 rounded-2xl border border-white/5">
                                                        <span className="text-[10px] font-bold opacity-50 block mb-2 uppercase tracking-widest">Urutan Biner</span>
                                                        <div className="text-4xl font-mono font-black tracking-widest flex flex-row-reverse justify-end gap-2 overflow-x-auto no-scrollbar pb-2">
                                                            {explHistory.slice(0, explStep + 1).map((h, i) => (
                                                                <div key={i} className="flex flex-col items-center shrink-0">
                                                                    <span className={i === explStep ? 'text-indigo-400 scale-125 transition-transform duration-500' : 'text-white'}>{h.r}</span>
                                                                    <div className={`h-1 w-full mt-1 rounded-full ${i === explStep ? 'bg-indigo-400' : 'bg-transparent'}`}></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                                        Nilai desimal didapatkan dengan menjumlahkan seluruh hasil perkalian bit dengan bobot pangkatnya (2<sup>n</sup>).
                                                    </p>
                                                    <div className="bg-white/10 p-6 rounded-2xl border border-white/5">
                                                        <span className="text-[10px] font-bold opacity-50 block mb-2 uppercase tracking-widest">Penjumlahan</span>
                                                        <div className="text-lg font-mono font-black flex flex-wrap items-center gap-2">
                                                            {explHistory.slice(0, explStep + 1).map((h, i) => (
                                                                <React.Fragment key={i}>
                                                                    <span className={h.bit === 1 ? 'text-green-400' : 'text-slate-600'}>{h.val}</span>
                                                                    {i < explStep && <span className="text-slate-700 text-sm"><Plus size={14} /></span>}
                                                                </React.Fragment>
                                                            ))}
                                                            {explStep === explHistory.length - 1 && !isAnimating && (
                                                                <>
                                                                    <span className="text-white text-lg">=</span>
                                                                    <span className="text-3xl text-white underline decoration-green-500">{explHistory.reduce((acc, curr) => acc + curr.val, 0)}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm flex items-start gap-4">
                                            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg shrink-0">
                                                <Lightbulb size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 uppercase mb-1">Info Lab Informatika</h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    {explMode === 'decToBin'
                                                        ? "Setiap bilangan ganjil yang dibagi 2 akan selalu menghasilkan sisa bagi 1."
                                                        : <>Gunakan urutan pangkat 2<sup>n</sup> dari kanan ke kiri, dimulai dari n=0.</>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* --- PRACTICE MODE --- */
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
                            <div className="flex justify-center mb-8">
                                <div className="bg-slate-200 p-1 rounded-full inline-flex">
                                    <button
                                        onClick={() => startNewChallenge('decToBin')}
                                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${practiceSubMode === 'decToBin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600'}`}
                                    >
                                        Latihan: Bagi Kurung
                                    </button>
                                    <button
                                        onClick={() => startNewChallenge('binToDec')}
                                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${practiceSubMode === 'binToDec' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600'}`}
                                    >
                                        Latihan: Nilai Tempat
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white p-6 rounded-3xl mb-8 shadow-2xl flex justify-between items-center relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest mb-1">Misi Tantangan</h2>
                                    <p className="text-2xl font-light leading-tight">
                                        Konversikan <span className="font-black text-white">{practiceSubMode === 'decToBin' ? targetNum : targetBin}</span> ke <span className="text-indigo-400 font-bold uppercase">{practiceSubMode === 'decToBin' ? 'Biner' : 'Desimal'}</span>
                                    </p>
                                </div>
                                <div className="text-right z-10 shrink-0">
                                    <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">Progres</div>
                                    <div className="text-3xl font-black">{Math.round(((currentStep + (isFinished ? 1 : 0)) / (stepsData.length || 1)) * 100)}%</div>
                                </div>
                                <Binary size={120} className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {stepsData.map((step, idx) => (
                                        <div key={idx} className={`bg-white p-5 rounded-2xl border-2 transition-all ${idx === currentStep ? 'border-indigo-500 shadow-xl ring-4 ring-indigo-50' : 'border-slate-100 opacity-50 grayscale'}`}>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === currentStep ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</div>
                                                <div className="font-mono text-lg">
                                                    {practiceSubMode === 'decToBin' ? (
                                                        <><span className="font-bold text-indigo-600">{step.val}</span> ÷ 2 = ?</>
                                                    ) : (
                                                        <>Bit <span className="font-bold">{step.bit}</span> posisi 2<sup>{step.power}</sup></>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                {practiceSubMode === 'decToBin' ? (
                                                    <>
                                                        <input
                                                            type="number" placeholder="Hasil"
                                                            value={idx === currentStep ? userInputs.quotient : (step.q !== '' ? step.q : '')}
                                                            disabled={idx !== currentStep || isFinished}
                                                            onChange={(e) => setUserInputs({ ...userInputs, quotient: e.target.value })}
                                                            className="flex-1 p-3 rounded-xl border-2 text-center font-mono outline-none focus:border-indigo-400 bg-slate-50 transition-colors"
                                                        />
                                                        <input
                                                            type="number" placeholder="Sisa"
                                                            value={idx === currentStep ? userInputs.remainder : (step.r !== '' ? step.r : '')}
                                                            disabled={idx !== currentStep || isFinished}
                                                            onChange={(e) => setUserInputs({ ...userInputs, remainder: e.target.value })}
                                                            className="flex-1 p-3 rounded-xl border-2 text-center font-mono outline-none focus:border-indigo-400 bg-slate-50 transition-colors"
                                                        />
                                                    </>
                                                ) : (
                                                    <input
                                                        type="number" placeholder="Hasil..."
                                                        value={idx === currentStep ? userInputs.bitValue : (step.val !== '' ? step.val : '')}
                                                        disabled={idx !== currentStep || isFinished}
                                                        onChange={(e) => setUserInputs({ ...userInputs, bitValue: e.target.value })}
                                                        className="w-full p-4 rounded-xl border-2 text-center font-mono outline-none focus:border-indigo-400 bg-slate-50 transition-colors"
                                                    />
                                                )}
                                            </div>

                                            {idx === currentStep && !isFinished && (
                                                <button onClick={checkPracticeStep} className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all uppercase tracking-widest text-[10px]">Verifikasi Langkah</button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {feedback.status !== 'idle' && (
                                        <div className={`p-4 rounded-xl flex items-center gap-3 border animate-in slide-in-from-top-2 ${feedback.status === 'correct' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200 animate-shake'}`}>
                                            {feedback.status === 'correct' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                            <span className="text-sm font-bold tracking-tight">{feedback.message}</span>
                                        </div>
                                    )}

                                    {isFinished && (
                                        <div className="bg-indigo-600 p-8 rounded-3xl text-white text-center shadow-2xl animate-in zoom-in-95">
                                            <Trophy className="mx-auto text-yellow-400 mb-4" size={50} />
                                            <h3 className="text-2xl font-black mb-1">Misi Berhasil!</h3>
                                            <p className="text-xs opacity-70 mb-6 text-white/80">Kamu menguasai konversi melalui logika bertahap.</p>
                                            <div className="bg-white/10 p-4 rounded-xl mb-6 border border-white/10">
                                                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Hasil Akhir</span>
                                                <div className="text-3xl font-mono font-black">{practiceSubMode === 'decToBin' ? targetBin : targetNum}</div>
                                            </div>
                                            <button onClick={() => startNewChallenge(practiceSubMode)} className="w-full py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg flex items-center justify-center gap-2">
                                                <RefreshCw size={18} /> MAIN LAGI
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* FAB Help */}
            <button
                onClick={() => setShowDrawer(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-yellow-400 text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Lightbulb size={28} />
            </button>

            {/* Drawer */}
            {showDrawer && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDrawer(false)}></div>
                    <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center shadow-lg">
                            <h2 className="text-lg font-bold">Panduan Lab</h2>
                            <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-slate-800 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-indigo-600 text-sm mb-2 uppercase tracking-wide">Mode Penjelasan</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed italic">Gunakan animasi untuk melihat langkah perhitungan. Untuk biner, pangkat ditulis dengan format superskrip (contoh: 2<sup>n</sup>).</p>
                                </div>
                                <hr className="border-slate-100" />
                                <div>
                                    <h3 className="font-bold text-indigo-600 text-sm mb-2 uppercase tracking-wide">Mode Latihan</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed italic">Hitunglah setiap langkah secara mandiri. Verifikasi jawabanmu di tiap baris untuk lanjut ke langkah berikutnya.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Quiz Mode */}
            {showQuiz && (
                <QuizMode
                    moduleId="number_conversion"
                    moduleName="Konversi Bilangan"
                    questions={numberConversionQuizQuestions}
                    onClose={() => setShowQuiz(false)}
                />
            )}

            {/* Global CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
        </div>
    );
};

export default Biner;