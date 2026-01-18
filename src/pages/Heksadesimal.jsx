import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import NumberSystemNav from '../components/NumberSystemNav';
import {
    Calculator,
    Binary,
    CheckCircle2,
    AlertCircle,
    X,
    Lightbulb,
    Trophy,
    RefreshCw,
    PlayCircle,
    BookOpen,
    Target,
    PauseCircle,
    Plus,
    Cpu,
    Cpu,
    ArrowRight
} from 'lucide-react';
import QuizMode, { numberConversionQuizQuestions } from '../components/QuizMode';

const Heksadesimal = () => {
    const [searchParams] = useSearchParams();

    // Navigation State
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'explanation');
    const [practiceSubMode, setPracticeSubMode] = useState(searchParams.get('mode') || 'decToHex');

    // Explanation State
    const [explMode, setExplMode] = useState(searchParams.get('mode') || 'decToHex');
    const [explInput, setExplInput] = useState(explMode === 'decToHex' ? '254' : 'FE');
    const [explStep, setExplStep] = useState(-1);
    const [explHistory, setExplHistory] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);

    // Practice State
    const [targetNum, setTargetNum] = useState(0);
    const [targetHex, setTargetHex] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [stepsData, setStepsData] = useState([]);
    const [userInputs, setUserInputs] = useState({ quotient: '', remainder: '', digitValue: '' });
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
    const hexMap = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011',
        '4': '0100', '5': '0101', '6': '0110', '7': '0111',
        '8': '1000', '9': '1001', 'A': '1010', 'B': '1011',
        'C': '1100', 'D': '1101', 'E': '1110', 'F': '1111'
    };
    const binMap = Object.fromEntries(Object.entries(hexMap).map(([k, v]) => [v, k]));

    const getHexToBinSteps = (hexStr) => {
        if (!/^[0-9A-Fa-f]+$/.test(hexStr)) return [];
        return hexStr.split('').map(char => ({
            src: char.toUpperCase(),
            dest: hexMap[char.toUpperCase()],
            dec: parseInt(char, 16)
        }));
    };

    const getBinToHexSteps = (binStr) => {
        if (!/^[01]+$/.test(binStr)) return [];
        // Pad to multiple of 4
        let padded = binStr;
        while (padded.length % 4 !== 0) padded = '0' + padded;

        const chunks = [];
        for (let i = 0; i < padded.length; i += 4) {
            chunks.push(padded.substr(i, 4));
        }

        return chunks.map(chunk => ({
            src: chunk,
            dest: binMap[chunk],
            dec: parseInt(chunk, 2)
        }));
    };

    const getDecToHexSteps = (num) => {
        let steps = [];
        let current = parseInt(num);
        if (isNaN(current)) return [];
        if (current === 0) return [{ val: 0, q: 0, r: '0', rVal: 0 }];
        while (current > 0) {
            let rVal = current % 16;
            let r = rVal.toString(16).toUpperCase(); // 10 -> 'A'
            let q = Math.floor(current / 16);
            steps.push({ val: current, q, r, rVal });
            current = q;
        }
        return steps;
    };

    const getHexToDecSteps = (hexStr) => {
        if (!/^[0-9A-Fa-f]+$/.test(hexStr)) return [];
        return hexStr.split('').reverse().map((digit, i) => ({
            digit: digit.toUpperCase(),
            digitVal: parseInt(digit, 16),
            power: i,
            val: parseInt(digit, 16) * Math.pow(16, i),
            powerVal: Math.pow(16, i)
        })).reverse();
    };

    // --- Animation Side Effects ---
    useEffect(() => {
        let timer;
        if (isAnimating && explStep < explHistory.length - 1) {
            timer = setTimeout(() => {
                setExplStep(prev => prev + 1);
            }, 1500); // Slightly slower for hex to read mapping
        } else if (explStep >= explHistory.length - 1) {
            setIsAnimating(false);
        }
        return () => clearTimeout(timer);
    }, [isAnimating, explStep, explHistory]);

    // --- Event Handlers ---
    const startExplanation = () => {
        let steps = [];
        if (explMode === 'decToHex') {
            steps = getDecToHexSteps(explInput);
        } else if (explMode === 'hexToDec') {
            if (!/^[0-9A-Fa-f]+$/.test(explInput)) {
                alert("Input heksadesimal hanya boleh berisi angka 0-9 dan huruf A-F");
                return;
            }
            steps = getHexToDecSteps(explInput);
        } else if (explMode === 'hexToBin') {
            if (!/^[0-9A-Fa-f]+$/.test(explInput)) {
                alert("Input hanya boleh Hex (0-9, A-F)");
                return;
            }
            steps = getHexToBinSteps(explInput);
        } else if (explMode === 'binToHex') {
            if (!/^[01]+$/.test(explInput)) {
                alert("Input hanya boleh Biner (0/1)");
                return;
            }
            steps = getBinToHexSteps(explInput);
        }

        if (steps.length === 0) return;
        setExplHistory(steps);
        setExplStep(0);
        setIsAnimating(true);
    };

    const startNewChallenge = (mode) => {
        const num = Math.floor(Math.random() * 400) + 16;
        const hex = num.toString(16).toUpperCase();
        setTargetNum(num);
        setTargetHex(hex);
        setPracticeSubMode(mode);
        setCurrentStep(0);
        setIsFinished(false);
        setFeedback({ status: 'idle', message: '' });
        setUserInputs({ quotient: '', remainder: '', digitValue: '' });

        if (mode === 'decToHex') {
            setStepsData([{ val: num, q: '', r: '', rVal: null }]);
        } else if (mode === 'hexToDec') {
            setStepsData(hex.split('').map((digit, i) => ({
                digit: digit,
                digitVal: parseInt(digit, 16),
                power: hex.length - 1 - i,
                val: ''
            })));
        } else if (mode === 'hexToBin') {
            setStepsData(hex.split('').map(char => ({
                src: char,
                dest: hexMap[char],
                userVal: ''
            })));
        } else {
            // binToHex
            // Make sure bin length is multiple of 4 for cleaner practice
            let padded = num.toString(2);
            while (padded.length % 4 !== 0) padded = '0' + padded;
            setTargetHex(parseInt(padded, 2).toString(16).toUpperCase()); // Re-sync hex target to padded val

            const chunks = [];
            for (let i = 0; i < padded.length; i += 4) {
                chunks.push(padded.substr(i, 4));
            }
            setStepsData(chunks.map(chunk => ({
                src: chunk,
                dest: binMap[chunk],
                userVal: ''
            })));
        }
    };

    const checkPracticeStep = () => {
        if (practiceSubMode === 'decToHex') {
            const task = stepsData[currentStep];
            const correctQ = Math.floor(task.val / 16);
            const correctRVal = task.val % 16;
            const correctRStr = correctRVal.toString(16).toUpperCase();

            const userR = userInputs.remainder.trim().toUpperCase();

            if (parseInt(userInputs.quotient) === correctQ && userR === correctRStr) {
                setFeedback({ status: 'correct', message: 'Langkah benar!' });
                if (correctQ === 0) setIsFinished(true);
                else {
                    const next = [...stepsData];
                    next[currentStep] = { ...task, q: correctQ, r: correctRStr, rVal: correctRVal };
                    next.push({ val: correctQ, q: '', r: '', rVal: null });
                    setStepsData(next);
                    setCurrentStep(currentStep + 1);
                    setUserInputs({ quotient: '', remainder: '', digitValue: '' });
                }
            } else {
                if (parseInt(userInputs.quotient) === correctQ && parseInt(userInputs.remainder) === correctRVal && correctRVal >= 10) {
                    setFeedback({ status: 'error', message: `Benar sisa ${correctRVal}, tapi dalam Hex ditulis apa? (${correctRStr})` });
                } else {
                    setFeedback({ status: 'error', message: 'Cek pembagian 16. Sisa harus dalam format Hex (0-9, A-F).' });
                }
            }
        } else if (practiceSubMode === 'hexToDec') {
            const task = stepsData[currentStep];
            const correctVal = task.digitVal * Math.pow(16, task.power);

            if (parseInt(userInputs.digitValue) === correctVal) {
                setFeedback({ status: 'correct', message: 'Langkah benar!' });
                const next = [...stepsData];
                next[currentStep].val = correctVal;
                setStepsData(next);
                if (currentStep === stepsData.length - 1) setIsFinished(true);
                else {
                    setCurrentStep(currentStep + 1);
                    setUserInputs({ quotient: '', remainder: '', digitValue: '' });
                }
            } else {
                setFeedback({ status: 'error', message: `Ingat: ${task.digit} dalam desimal adalah ${task.digitVal}. Dikali 16^${task.power}.` });
            }
        } else {
            // Hex <-> Bin
            const task = stepsData[currentStep];
            const userInput = userInputs.digitValue.toUpperCase().trim();
            const correctKey = task.dest; // '0101' or 'A'

            if (userInput === correctKey) {
                setFeedback({ status: 'correct', message: 'Langkah benar!' });
                const next = [...stepsData];
                next[currentStep].userVal = correctKey;
                setStepsData(next);
                if (currentStep === stepsData.length - 1) setIsFinished(true);
                else {
                    setCurrentStep(currentStep + 1);
                    setUserInputs({ quotient: '', remainder: '', digitValue: '' });
                }
            } else {
                setFeedback({ status: 'error', message: `Salah. ${task.src} seharusnya menjadi ${correctKey}` });
            }
        }
    };

    useEffect(() => {
        startNewChallenge('decToHex');
    }, []);

    return (
        <div className="h-full w-full bg-slate-50 font-sans text-slate-900 flex flex-col overflow-hidden select-none">
            {/* Unified Navigation */}
            <NumberSystemNav activePage="heksadesimal" />

            {/* Header Removed as per request */}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                <div className="max-w-7xl mx-auto w-full p-6">
                    {activeTab === 'explanation' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Tab Mode Explanation */}
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Zona Konversi</h2>
                                    <p className="text-slate-500 font-medium mt-1">Pilih jenis konversi yang ingin dipelajari</p>
                                </div>
                                <div className="bg-white p-1.5 rounded-full border-2 border-slate-100 shadow-sm inline-flex flex-wrap justify-center">
                                    <button
                                        onClick={() => { setExplMode('decToHex'); setExplInput('254'); setExplHistory([]); setIsAnimating(false); }}
                                        className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${explMode === 'decToHex' ? 'bg-purple-600 text-white shadow-md transform scale-105' : 'text-slate-500 hover:text-purple-600 hover:bg-slate-50'}`}
                                    >
                                        Desimal ke Hex
                                    </button>
                                    <button
                                        onClick={() => { setExplMode('hexToDec'); setExplInput('FE'); setExplHistory([]); setIsAnimating(false); }}
                                        className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${explMode === 'hexToDec' ? 'bg-purple-600 text-white shadow-md transform scale-105' : 'text-slate-500 hover:text-purple-600 hover:bg-slate-50'}`}
                                    >
                                        Hex ke Desimal
                                    </button>
                                    <button
                                        onClick={() => { setExplMode('hexToBin'); setExplInput('A5'); setExplHistory([]); setIsAnimating(false); }}
                                        className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${explMode === 'hexToBin' ? 'bg-purple-600 text-white shadow-md transform scale-105' : 'text-slate-500 hover:text-purple-600 hover:bg-slate-50'}`}
                                    >
                                        Hex ke Biner
                                    </button>
                                    <button
                                        onClick={() => { setExplMode('binToHex'); setExplInput('10101111'); setExplHistory([]); setIsAnimating(false); }}
                                        className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${explMode === 'binToHex' ? 'bg-purple-600 text-white shadow-md transform scale-105' : 'text-slate-500 hover:text-purple-600 hover:bg-slate-50'}`}
                                    >
                                        Biner ke Hex
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
                                <div className={`p-4 text-white font-bold flex items-center gap-2 ${explMode === 'decToHex' ? 'bg-purple-600' : 'bg-pink-600'}`}>
                                    <PlayCircle size={20} />
                                    Simulasi : {
                                        explMode === 'decToHex' ? 'Konversi Desimal ke Hex' :
                                            explMode === 'hexToDec' ? 'Konversi Hex ke Desimal' :
                                                explMode === 'hexToBin' ? 'Konversi Hex ke Biner' : 'Konversi Biner ke Hex'
                                    }
                                </div>
                                <div className="p-8 flex flex-col md:flex-row gap-6 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                            {
                                                explMode.includes('ToHex') && explMode !== 'decToHex' ? 'Masukkan Angka Biner' :
                                                    explMode.includes('ToBin') ? 'Masukkan Angka Hex' :
                                                        explMode === 'decToHex' ? 'Masukkan Angka Desimal' : 'Masukkan Angka Hex'
                                            }
                                        </label>
                                        <input
                                            type="text"
                                            value={explInput}
                                            onChange={(e) => {
                                                setExplInput(e.target.value);
                                                setIsAnimating(false);
                                                setExplHistory([]);
                                            }}
                                            className="w-full text-2xl font-mono p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-purple-500 transition-all uppercase"
                                            placeholder={
                                                explMode === 'decToHex' ? "Contoh: 254" :
                                                    explMode === 'hexToBin' ? "Contoh: A5" :
                                                        explMode === 'binToHex' ? "Contoh: 10101111" : "Contoh: FE"
                                            }
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
                                        {explMode === 'decToHex' ? (
                                            /* --- MODE DESIMAL KE HEX (LIST VERTICAL) --- */
                                            explHistory.slice(0, explStep + 1).map((h, i) => (
                                                <div key={i} className={`bg-white p-5 rounded-2xl border-2 shadow-sm animate-in slide-in-from-left duration-500 ${i === explStep ? 'border-purple-400 ring-2 ring-purple-50' : 'border-slate-100 opacity-80'}`}>
                                                    <div className="flex justify-between items-center font-mono">
                                                        <span className="text-slate-400 text-xs">Langkah {i + 1}</span>
                                                        {i === explStep && isAnimating && <span className="text-[10px] font-bold text-purple-500 animate-pulse uppercase tracking-tighter">Memproses...</span>}
                                                    </div>
                                                    <div className="text-2xl mt-2 font-mono flex items-center gap-2 flex-wrap">
                                                        {h.val} ÷ 16 = <span className="font-bold">{h.q}</span>
                                                        <span className="text-xs text-slate-400">sisa</span>
                                                        <span className="text-slate-800 font-bold">{h.rVal}</span>
                                                        <ArrowRight size={16} className="text-slate-300" />
                                                        <span className="text-purple-600 font-black">{h.r}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : explMode.includes('ToBin') || explMode.includes('binTo') ? (
                                            /* --- MODE HEX <-> BIN --- */
                                            <div className="space-y-4">
                                                {explHistory.slice(0, explStep + 1).map((h, i) => (
                                                    <div key={i} className="bg-white p-6 rounded-2xl border-2 border-slate-100 flex flex-col gap-4 animate-in slide-in-from-left">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs text-slate-400 font-bold mb-1">{explMode === 'hexToBin' ? 'HEX' : 'BINER (4-bit)'}</span>
                                                                <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl font-mono font-bold shadow-lg">
                                                                    {h.src}
                                                                </div>
                                                            </div>

                                                            <ArrowRight className="text-slate-300" size={32} />

                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs text-slate-400 font-bold mb-1">{explMode === 'hexToBin' ? 'BINER' : 'HEX'}</span>
                                                                <div className="w-24 h-16 bg-purple-600 text-white rounded-xl flex items-center justify-center text-2xl font-mono font-bold shadow-lg">
                                                                    {h.dest}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {explMode === 'hexToBin' && (
                                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-mono text-slate-600">
                                                                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                                                                    <span className="font-bold">Detail:</span>
                                                                    <span>Hex <b>{h.src}</b> = Desimal <b>{h.dec}</b></span>
                                                                </div>
                                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400">8</span>
                                                                        <span className={h.dest[0] === '1' ? 'font-bold text-slate-900' : 'text-slate-300'}>{h.dest[0]}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400">4</span>
                                                                        <span className={h.dest[1] === '1' ? 'font-bold text-slate-900' : 'text-slate-300'}>{h.dest[1]}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400">2</span>
                                                                        <span className={h.dest[2] === '1' ? 'font-bold text-slate-900' : 'text-slate-300'}>{h.dest[2]}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400">1</span>
                                                                        <span className={h.dest[3] === '1' ? 'font-bold text-slate-900' : 'text-slate-300'}>{h.dest[3]}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3 pt-3 border-t border-slate-200">
                                                                    <div className="flex gap-2 items-start bg-yellow-50 p-2 rounded-lg">
                                                                        <Lightbulb size={16} className="text-yellow-600 mt-0.5" />
                                                                        <div className="text-left">
                                                                            <p className="text-[10px] font-bold text-slate-700">Kenapa 8, 4, 2, 1?</p>
                                                                            <p className="text-[10px] text-slate-600 leading-tight">
                                                                                Ini adalah nilai <b>urutan biner</b> (Basis 2).<br />
                                                                                <span className="font-mono bg-white px-1 rounded">2<sup>3</sup>=8</span>,
                                                                                <span className="font-mono bg-white px-1 rounded mx-1">2<sup>2</sup>=4</span>,
                                                                                <span className="font-mono bg-white px-1 rounded">2<sup>1</sup>=2</span>,
                                                                                <span className="font-mono bg-white px-1 rounded mx-1">2<sup>0</sup>=1</span>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2 text-xs text-center text-slate-500 italic font-medium">
                                                                        Hasil: {h.dest.split('').map((bit, idx) => bit === '1' ? [8, 4, 2, 1][idx] : 0).filter(v => v > 0).join(' + ') || '0'} = {h.dec}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {explMode === 'binToHex' && (
                                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-mono text-slate-600">
                                                                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                                                                    <span className="font-bold">Detail:</span>
                                                                    <span>Biner <b>{h.src}</b> = Hex <b>{h.dest}</b></span>
                                                                </div>
                                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400">8</span>
                                                                        <span className={h.src[0] === '1' ? 'font-bold text-slate-900' : 'text-slate-300'}>{h.src[0]}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400">4</span>
                                                                        <span className={h.src[1] === '1' ? 'font-bold text-slate-900' : 'text-slate-300'}>{h.src[1]}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400">2</span>
                                                                        <span className={h.src[2] === '1' ? 'font-bold text-slate-900' : 'text-slate-300'}>{h.src[2]}</span>
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-400">1</span>
                                                                        <span className={h.src[3] === '1' ? 'font-bold text-slate-900' : 'text-slate-300'}>{h.src[3]}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3 pt-3 border-t border-slate-200">
                                                                    <div className="flex gap-2 items-start bg-yellow-50 p-2 rounded-lg mb-2">
                                                                        <Lightbulb size={16} className="text-yellow-600 mt-0.5" />
                                                                        <div className="text-left">
                                                                            <p className="text-[10px] font-bold text-slate-700">Kenapa 8, 4, 2, 1?</p>
                                                                            <p className="text-[10px] text-slate-600 leading-tight">
                                                                                Ini adalah nilai <b>urutan biner</b> (Basis 2).<br />
                                                                                <span className="font-mono bg-white px-1 rounded">2<sup>3</sup>=8</span>,
                                                                                <span className="font-mono bg-white px-1 rounded mx-1">2<sup>2</sup>=4</span>,
                                                                                <span className="font-mono bg-white px-1 rounded">2<sup>1</sup>=2</span>,
                                                                                <span className="font-mono bg-white px-1 rounded mx-1">2<sup>0</sup>=1</span>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs text-center text-slate-500 italic font-medium">
                                                                        Hasil: {h.src.split('').map((bit, idx) => bit === '1' ? [8, 4, 2, 1][idx] : 0).filter(v => v > 0).join(' + ') || '0'} = {h.dec} {h.dec > 9 ? ` = Hex ${h.dest}` : ''}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            /* --- MODE HEX KE DESIMAL (TABEL HORIZONTAL) --- */
                                            <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-x-auto shadow-sm animate-in fade-in">
                                                <table className="w-full text-center border-collapse min-w-[300px]">
                                                    <thead>
                                                        <tr className="border-b-2 border-slate-100 bg-slate-50/50">
                                                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left w-32 whitespace-nowrap">Digit (Hex)</th>
                                                            {explHistory.map((h, i) => (
                                                                <th key={i} className={`p-4 font-mono text-xl transition-all duration-500 ${i > explStep ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                                                                    {h.digit}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="border-b border-slate-100">
                                                            <td className="p-4 text-xs font-bold text-pink-600 uppercase tracking-wider text-left whitespace-nowrap">Bobot (16<sup>n</sup>)</td>
                                                            {explHistory.map((h, i) => (
                                                                <td key={i} className={`p-4 font-mono text-pink-600 font-bold transition-all duration-500 delay-100 ${i > explStep ? 'opacity-0' : 'opacity-100'}`}>
                                                                    16<sup>{h.power}</sup>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                        <tr>
                                                            <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-left whitespace-nowrap">Perhitungan</td>
                                                            {explHistory.map((h, i) => (
                                                                <td key={i} className={`p-4 transition-all duration-500 delay-200 ${i > explStep ? 'opacity-0' : 'opacity-100'}`}>
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                                                                            {h.digitVal} ({h.digit}) × 16<sup>{h.power}</sup>
                                                                        </span>
                                                                        <span className="text-2xl font-black text-purple-600">{h.val}</span>
                                                                    </div>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {explStep === explHistory.length - 1 && !isAnimating && (
                                            <div className="p-4 bg-pink-50 text-pink-700 border border-pink-200 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in fade-in">
                                                <CheckCircle2 size={18} /> Simulasi selesai! Lihat hasil akhir di samping.
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Analysis */}
                                    <div className="sticky top-0 h-fit space-y-6">
                                        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                                            <h3 className="text-purple-400 font-bold text-xs uppercase mb-4 tracking-widest">Hasil Akhir</h3>

                                            {explMode === 'decToHex' ? (
                                                <>
                                                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                                        Deretan heksadesimal didapatkan dari sisa bagi (dikonversi ke 0-9, A-F) dibaca dari <b>terakhir</b> ke <b>awal</b>.
                                                    </p>
                                                    <div className="bg-white/10 p-6 rounded-2xl border border-white/5">
                                                        <span className="text-[10px] font-bold opacity-50 block mb-2 uppercase tracking-widest">Urutan Hex</span>
                                                        <div className="text-4xl font-mono font-black tracking-widest flex flex-row-reverse justify-end gap-2 overflow-x-auto no-scrollbar pb-2">
                                                            {explHistory.slice(0, explStep + 1).map((h, i) => (
                                                                <div key={i} className="flex flex-col items-center shrink-0">
                                                                    <span className={i === explStep ? 'text-purple-400 scale-125 transition-transform duration-500' : 'text-white'}>{h.r}</span>
                                                                    <div className={`h-1 w-full mt-1 rounded-full ${i === explStep ? 'bg-purple-400' : 'bg-transparent'}`}></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (explMode === 'hexToDec') ? (
                                                <>
                                                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                                        Nilai desimal didapatkan dengan menjumlahkan seluruh hasil perkalian nilai digit dengan bobot pangkatnya (16<sup>n</sup>).
                                                    </p>
                                                    <div className="bg-white/10 p-6 rounded-2xl border border-white/5">
                                                        <span className="text-[10px] font-bold opacity-50 block mb-2 uppercase tracking-widest">Penjumlahan</span>
                                                        <div className="text-3xl font-mono font-black flex flex-wrap items-center gap-2">
                                                            {explHistory.slice(0, explStep + 1).map((h, i) => (
                                                                <React.Fragment key={i}>
                                                                    <span className="text-slate-200">{h.val}</span>
                                                                    {i < explStep && <span className="text-slate-700 text-sm"><Plus size={14} /></span>}
                                                                </React.Fragment>
                                                            ))}
                                                            {explStep === explHistory.length - 1 && !isAnimating && (
                                                                <>
                                                                    <span className="text-white text-xl">=</span>
                                                                    <span className="text-4xl text-white underline decoration-pink-500">{explHistory.reduce((acc, curr) => acc + curr.val, 0)}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Hex <-> Bin Result */
                                                <div className="bg-white/10 p-6 rounded-2xl border border-white/5">
                                                    <span className="text-[10px] font-bold opacity-50 block mb-2 uppercase tracking-widest">HASIL GABUNGAN</span>
                                                    <div className="text-3xl font-mono font-black text-white break-all">
                                                        {explHistory.slice(0, explStep + 1).map(h => h.dest).join('')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm flex items-start gap-4">
                                            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg shrink-0">
                                                <Lightbulb size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 uppercase mb-1">Info Lab Informatika</h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    {explMode === 'decToHex'
                                                        ? "Sistem Heksadesimal menggunakan 16 simbol: 0-9 mewakili nilai 0-9, dan A-F mewakili nilai 10-15."
                                                        : explMode === 'hexToDec' ? "Nilai A=10, B=11, C=12, D=13, E=14, F=15. Jangan lupa dikalikan 16 pangkat posisi."
                                                            : (
                                                                <span>
                                                                    <b>Rumus 4 Jari Biner:</b><br />
                                                                    Setiap 1 digit Hex butuh 4 digit Biner.<br />
                                                                    Nilainya dari kiri ke kanan selalu: <b>8, 4, 2, 1</b>.<br />
                                                                    Jumlahkan angka yang digit binernya <b>1</b>.
                                                                </span>
                                                            )}
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
                                <div className="bg-slate-200 p-1 rounded-full inline-flex flex-wrap justify-center">
                                    <button
                                        onClick={() => startNewChallenge('decToHex')}
                                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${practiceSubMode === 'decToHex' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600'}`}
                                    >
                                        Latihan: Bagi Kurung
                                    </button>
                                    <button
                                        onClick={() => startNewChallenge('hexToDec')}
                                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${practiceSubMode === 'hexToDec' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600'}`}
                                    >
                                        Latihan: Nilai Tempat
                                    </button>
                                    <button
                                        onClick={() => startNewChallenge('hexToBin')}
                                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${practiceSubMode === 'hexToBin' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600'}`}
                                    >
                                        Latihan: Hex-Biner
                                    </button>
                                    <button
                                        onClick={() => startNewChallenge('binToHex')}
                                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${practiceSubMode === 'binToHex' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600'}`}
                                    >
                                        Latihan: Biner-Hex
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white p-6 rounded-3xl mb-8 shadow-2xl flex justify-between items-center relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-1">Misi Tantangan</h2>
                                    <p className="text-2xl font-light leading-tight">
                                        Konversikan <span className="font-black text-white">{practiceSubMode === 'decToHex' ? targetNum : targetHex}</span> ke <span className="text-purple-400 font-bold uppercase">{practiceSubMode === 'decToHex' ? 'Hex' : practiceSubMode === 'hexToDec' ? 'Desimal' : practiceSubMode === 'hexToBin' ? 'Biner' : 'Hex'}</span>
                                    </p>
                                </div>
                                <div className="text-right z-10 shrink-0">
                                    <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">Progres</div>
                                    <div className="text-3xl font-black">{Math.round(((currentStep + (isFinished ? 1 : 0)) / (stepsData.length || 1)) * 100)}%</div>
                                </div>
                                <Cpu size={120} className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {stepsData.map((step, idx) => (
                                        <div key={idx} className={`bg-white p-5 rounded-2xl border-2 transition-all ${idx === currentStep ? 'border-purple-500 shadow-xl ring-4 ring-purple-50' : 'border-slate-100 opacity-50 grayscale'}`}>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === currentStep ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</div>
                                                <div className="font-mono text-lg">
                                                    {practiceSubMode === 'decToHex' ? (
                                                        <><span className="font-bold text-purple-600">{step.val}</span> ÷ 16 = ?</>
                                                    ) : practiceSubMode === 'hexToDec' ? (
                                                        <>Digit <span className="font-bold">{step.digit}</span> posisi 16<sup>{step.power}</sup></>
                                                    ) : (
                                                        <>{practiceSubMode === 'hexToBin' ? `Ubah Hex ke Biner (4-bit)` : `Ubah Biner (4-bit) ke Hex`}</>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                {practiceSubMode === 'decToHex' ? (
                                                    <>
                                                        <input
                                                            type="number" placeholder="Hasil"
                                                            value={idx === currentStep ? userInputs.quotient : (step.q !== '' ? step.q : '')}
                                                            disabled={idx !== currentStep || isFinished}
                                                            onChange={(e) => setUserInputs({ ...userInputs, quotient: e.target.value })}
                                                            className="flex-1 p-3 rounded-xl border-2 text-center font-mono outline-none focus:border-purple-400 bg-slate-50 transition-colors"
                                                        />
                                                        <input
                                                            type="text" placeholder="Sisa (0-9, A-F)"
                                                            value={idx === currentStep ? userInputs.remainder : (step.r !== '' ? step.r : '')}
                                                            disabled={idx !== currentStep || isFinished}
                                                            onChange={(e) => setUserInputs({ ...userInputs, remainder: e.target.value.toUpperCase() })}
                                                            className="flex-1 p-3 rounded-xl border-2 text-center font-mono outline-none focus:border-purple-400 bg-slate-50 transition-colors"
                                                        />
                                                    </>
                                                ) : practiceSubMode === 'hexToDec' ? (
                                                    <input
                                                        type="number" placeholder="Hasil Perkalian..."
                                                        value={idx === currentStep ? userInputs.digitValue : (step.val !== '' ? step.val : '')}
                                                        disabled={idx !== currentStep || isFinished}
                                                        onChange={(e) => setUserInputs({ ...userInputs, digitValue: e.target.value })}
                                                        className="w-full p-4 rounded-xl border-2 text-center font-mono outline-none focus:border-purple-400 bg-slate-50 transition-colors"
                                                    />
                                                ) : (
                                                    /* GENERIC INPUT FOR HEX <-> BIN */
                                                    <div className="flex items-center gap-4 w-full">
                                                        <div className="text-2xl font-mono font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-lg">
                                                            {step.src}
                                                        </div>
                                                        <ArrowRight size={20} className="text-slate-400" />
                                                        <input
                                                            type="text" placeholder={practiceSubMode === 'hexToBin' ? "0000" : "0-F"}
                                                            value={idx === currentStep ? userInputs.digitValue : (step.userVal !== '' ? step.userVal : '')}
                                                            disabled={idx !== currentStep || isFinished}
                                                            onChange={(e) => setUserInputs({ ...userInputs, digitValue: e.target.value })}
                                                            className="flex-1 p-3 rounded-xl border-2 text-center font-mono outline-none focus:border-purple-400 bg-slate-50 transition-colors uppercase"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {idx === currentStep && !isFinished && (
                                                <button onClick={checkPracticeStep} className="mt-4 w-full py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all uppercase tracking-widest text-[10px]">Verifikasi Langkah</button>
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
                                        <div className="bg-purple-600 p-8 rounded-3xl text-white text-center shadow-2xl animate-in zoom-in-95">
                                            <Trophy className="mx-auto text-yellow-400 mb-4" size={50} />
                                            <h3 className="text-2xl font-black mb-1">Misi Berhasil!</h3>
                                            <p className="text-xs opacity-70 mb-6 text-white/80">Kamu menguasai konversi heksadesimal.</p>
                                            <div className="bg-white/10 p-4 rounded-xl mb-6 border border-white/10">
                                                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Hasil Akhir</span>
                                                <div className="text-3xl font-mono font-black">{practiceSubMode === 'decToHex' ? targetHex : targetNum}</div>
                                            </div>
                                            <button onClick={() => startNewChallenge(practiceSubMode)} className="w-full py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg flex items-center justify-center gap-2">
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
                            <h2 className="text-lg font-bold">Panduan Lab Hex</h2>
                            <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-slate-800 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-purple-600 text-sm mb-2 uppercase tracking-wide">Mode Penjelasan</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed italic">Simulasi langkah demi langkah untuk memahami konversi bilangan desimal ke heksadesimal (basis 16) dan sebaliknya.</p>
                                </div>
                                <hr className="border-slate-100" />
                                <div>
                                    <h3 className="font-bold text-purple-600 text-sm mb-2 uppercase tracking-wide">Tabel Hex</h3>
                                    <div className="grid grid-cols-4 gap-2 text-xs text-center font-mono">
                                        <div className="p-1 bg-slate-100 rounded">0=0</div>
                                        <div className="p-1 bg-slate-100 rounded">1=1</div>
                                        <div className="p-1 bg-slate-100 rounded">2=2</div>
                                        <div className="p-1 bg-slate-100 rounded">3=3</div>
                                        <div className="p-1 bg-slate-100 rounded">4=4</div>
                                        <div className="p-1 bg-slate-100 rounded">5=5</div>
                                        <div className="p-1 bg-slate-100 rounded">6=6</div>
                                        <div className="p-1 bg-slate-100 rounded">7=7</div>
                                        <div className="p-1 bg-slate-100 rounded">8=8</div>
                                        <div className="p-1 bg-slate-100 rounded">9=9</div>
                                        <div className="p-1 bg-orange-100 font-bold rounded">A=10</div>
                                        <div className="p-1 bg-orange-100 font-bold rounded">B=11</div>
                                        <div className="p-1 bg-orange-100 font-bold rounded">C=12</div>
                                        <div className="p-1 bg-orange-100 font-bold rounded">D=13</div>
                                        <div className="p-1 bg-orange-100 font-bold rounded">E=14</div>
                                        <div className="p-1 bg-orange-100 font-bold rounded">F=15</div>
                                    </div>
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

export default Heksadesimal;
