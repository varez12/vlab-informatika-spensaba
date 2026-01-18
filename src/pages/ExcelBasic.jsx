import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Grid, HelpCircle, BookOpen, Play, Pause, Lightbulb, ChevronDown,
    Grid, HelpCircle, BookOpen, Play, Pause, Lightbulb, ChevronDown,
    Calculator, Plus, TrendingUp, TrendingDown, Hash, BarChart2, AlertCircle, Trophy
} from 'lucide-react';
import QuizMode, { excelBasicQuizQuestions } from '../components/QuizMode';

// ============================================================
// MODUL: FORMULA DASAR (SUM, AVERAGE, COUNT, MAX, MIN)
// Versi Real - Input Sintaks Formula Sebenarnya
// ============================================================

const FormulaInput = ({ value, onChange, placeholder, isValid, errorMessage, hintMessage }) => (
    <div className="relative">
        <div className={`flex items-center bg-slate-900 rounded-xl overflow-hidden border-2 transition-all ${!isValid && errorMessage ? 'border-red-500/70 ring-2 ring-red-500/20' : 'border-slate-700 focus-within:border-blue-500'}`}>
            <span className="text-blue-400 font-bold text-lg px-3 font-serif italic">fx</span>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-white font-mono text-sm py-3 pr-4 outline-none placeholder:text-slate-500"
            />
        </div>
        {!isValid && errorMessage && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2 text-red-600 text-xs font-medium">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                </div>
                {hintMessage && (
                    <div className="mt-1.5 pl-5 text-red-500 text-[10px] font-mono bg-red-100/50 p-1.5 rounded">
                        💡 {hintMessage}
                    </div>
                )}
            </div>
        )}
    </div>
);

const BasicFormulaLab = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState(tabParam || 'SUM');

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Animation State
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [animationSteps, setAnimationSteps] = useState([]);
    const [playbackSpeed, setPlaybackSpeed] = useState(700);

    const [highlightedCells, setHighlightedCells] = useState([]);
    const [result, setResult] = useState(null);
    const [tempResult, setTempResult] = useState(null);
    const [formulaError, setFormulaError] = useState('');
    const [formulaHint, setFormulaHint] = useState('');
    const [showQuiz, setShowQuiz] = useState(false); // Quiz State

    // Sample Data - Nilai Ujian Siswa
    const examData = [
        ['No', 'Nama', 'Matematika', 'Bahasa', 'IPA'],
        ['1', 'Andi', '85', '78', '90'],
        ['2', 'Budi', '72', '88', '76'],
        ['3', 'Citra', '90', '92', '88'],
        ['4', 'Dewi', '68', '75', '82'],
        ['5', 'Eko', '88', '80', '95']
    ];

    // Formula input state - user types actual formula
    const [formulaInput, setFormulaInput] = useState('=SUM(C2:C6)');

    // Update formula when tab changes
    useEffect(() => {
        const defaultFormulas = {
            'SUM': '=SUM(C2:C6)',
            'AVERAGE': '=AVERAGE(C2:C6)',
            'COUNT': '=COUNT(C2:C6)',
            'MAX': '=MAX(C2:C6)',
            'MIN': '=MIN(C2:C6)'
        };
        setFormulaInput(defaultFormulas[activeTab] || '=SUM(C2:C6)');
        setFormulaError('');
    }, [activeTab]);

    // Parse range like "C2:C6" or "C2;C3;C4" or individual cells
    const parseRange = (rangeStr) => {
        const colMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
        const cells = [];

        // Handle range format (C2:C6)
        const rangeMatch = rangeStr.match(/^([A-E])(\d+):([A-E])(\d+)$/i);
        if (rangeMatch) {
            const [_, startCol, startRow, endCol, endRow] = rangeMatch;
            const colIdx = colMap[startCol.toUpperCase()];
            const start = parseInt(startRow);
            const end = parseInt(endRow);

            for (let row = start; row <= end; row++) {
                if (row >= 1 && row <= 6 && examData[row - 1]) {
                    cells.push({
                        row: row - 1,
                        col: colIdx,
                        value: examData[row - 1][colIdx]
                    });
                }
            }
            return cells;
        }

        // Handle individual cells separated by ; (e.g., C2;C3;C4)
        const cellList = rangeStr.split(';').map(s => s.trim());
        for (const cell of cellList) {
            const cellMatch = cell.match(/^([A-E])(\d+)$/i);
            if (cellMatch) {
                const [_, col, row] = cellMatch;
                const colIdx = colMap[col.toUpperCase()];
                const rowIdx = parseInt(row) - 1;
                if (rowIdx >= 0 && rowIdx <= 5 && examData[rowIdx]) {
                    cells.push({
                        row: rowIdx,
                        col: colIdx,
                        value: examData[rowIdx][colIdx]
                    });
                }
            }
        }

        return cells;
    };

    // Parse the formula input with improved error messages
    const parseFormula = () => {
        const formula = formulaInput.trim();
        const formulaUpper = formula.toUpperCase();

        // Check if formula starts with =
        if (!formula.startsWith('=')) {
            return {
                valid: false,
                error: '⚠️ Formula harus diawali tanda "="',
                hint: 'Contoh yang benar: =' + activeTab + '(C2:C6)'
            };
        }

        // Match formula pattern: =FUNCTION(args)
        const match = formulaUpper.match(/^=(\w+)\((.+)\)$/);
        if (!match) {
            // Check for common mistakes
            if (!formula.includes('(')) {
                return {
                    valid: false,
                    error: '⚠️ Kurung buka "(" tidak ditemukan',
                    hint: 'Format: =' + activeTab + '(range) - contoh: =' + activeTab + '(C2:C6)'
                };
            }
            if (!formula.includes(')')) {
                return {
                    valid: false,
                    error: '⚠️ Kurung tutup ")" tidak ditemukan',
                    hint: 'Pastikan formula diakhiri dengan ")"'
                };
            }
            return {
                valid: false,
                error: '⚠️ Format formula tidak valid',
                hint: 'Format benar: =' + activeTab + '(C2:C6) atau =' + activeTab + '(C2;C3;C4)'
            };
        }

        const [_, funcName, args] = match;

        // Check if function matches active tab
        if (funcName !== activeTab) {
            return {
                valid: false,
                error: `⚠️ Fungsi "${funcName}" tidak sesuai tab "${activeTab}"`,
                hint: `Ganti menjadi =${activeTab}(${args}) atau klik tab ${funcName}`
            };
        }

        // Check for common range mistakes
        if (args.includes(',')) {
            return {
                valid: false,
                error: '⚠️ Gunakan titik koma (;) bukan koma (,)',
                hint: `Contoh: =${activeTab}(C2;C3;C4) atau =${activeTab}(C2:C6)`
            };
        }

        // Parse the range/arguments
        const cells = parseRange(args);
        if (cells.length === 0) {
            return {
                valid: false,
                error: '⚠️ Range "' + args + '" tidak valid',
                hint: 'Kolom valid: A-E, Baris valid: 1-6. Contoh: C2:C6 atau C2;C3;D2'
            };
        }

        // Get numeric values only
        const values = cells
            .map(c => parseFloat(c.value))
            .filter(v => !isNaN(v));

        if (values.length === 0) {
            return {
                valid: false,
                error: '⚠️ Range tidak berisi angka',
                hint: 'Pilih kolom C, D, atau E yang berisi nilai ujian'
            };
        }

        return { valid: true, funcName, cells, values };
    };

    // --- ENGINE SIMULASI ---
    const generateSteps = () => {
        let steps = [];
        let finalRes = "";

        const parsed = parseFormula();
        if (!parsed.valid) {
            setFormulaError(parsed.error);
            return { steps: [], finalRes: '#ERROR!' };
        }

        setFormulaError('');
        const { cells, values } = parsed;

        try {
            if (activeTab === 'SUM') {
                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                steps.push({
                    desc: `Mengidentifikasi range: ${cells.length} sel ditemukan`,
                    highlight: cells.map(c => `r${c.row}-c${c.col}`),
                    res: '...'
                });

                let runningSum = 0;
                cells.forEach((cell, i) => {
                    const val = parseFloat(cell.value);
                    if (!isNaN(val)) {
                        runningSum += val;
                        steps.push({
                            desc: `Sel ${String.fromCharCode(65 + cell.col)}${cell.row + 1} = ${val} → Total: ${runningSum}`,
                            highlight: [`r${cell.row}-c${cell.col}`],
                            res: runningSum
                        });
                    }
                });

                finalRes = values.reduce((a, b) => a + b, 0);
            }
            else if (activeTab === 'AVERAGE') {
                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                steps.push({
                    desc: `Mengidentifikasi ${cells.length} sel data`,
                    highlight: cells.map(c => `r${c.row}-c${c.col}`),
                    res: '...'
                });

                const sum = values.reduce((a, b) => a + b, 0);
                steps.push({
                    desc: `Langkah 1: SUM = ${values.join(' + ')} = ${sum}`,
                    highlight: cells.map(c => `r${c.row}-c${c.col}`),
                    res: sum
                });

                steps.push({
                    desc: `Langkah 2: COUNT = ${values.length} data`,
                    highlight: cells.map(c => `r${c.row}-c${c.col}`),
                    res: values.length
                });

                const avg = (sum / values.length).toFixed(2);
                steps.push({
                    desc: `Langkah 3: AVERAGE = ${sum} ÷ ${values.length} = ${avg}`,
                    highlight: cells.map(c => `r${c.row}-c${c.col}`),
                    res: avg
                });

                finalRes = avg;
            }
            else if (activeTab === 'COUNT') {
                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                let count = 0;
                cells.forEach((cell, i) => {
                    const val = parseFloat(cell.value);
                    const isNumber = !isNaN(val);
                    count += isNumber ? 1 : 0;
                    steps.push({
                        desc: `Sel ${String.fromCharCode(65 + cell.col)}${cell.row + 1} = "${cell.value}" ${isNumber ? '✓ Angka' : '✗ Bukan angka'} | Count: ${count}`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: count
                    });
                });

                finalRes = values.length;
            }
            else if (activeTab === 'MAX') {
                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                steps.push({
                    desc: `Mencari nilai TERBESAR dari ${values.length} data`,
                    highlight: cells.map(c => `r${c.row}-c${c.col}`),
                    res: '...'
                });

                let currentMax = values[0];
                let maxCell = cells[0];

                cells.forEach((cell, i) => {
                    const val = parseFloat(cell.value);
                    if (!isNaN(val)) {
                        if (i === 0) {
                            steps.push({
                                desc: `Nilai awal: ${val}`,
                                highlight: [`r${cell.row}-c${cell.col}`],
                                res: val
                            });
                        } else if (val > currentMax) {
                            currentMax = val;
                            maxCell = cell;
                            steps.push({
                                desc: `${val} > ${currentMax - (val - currentMax)} → MAX baru: ${val}`,
                                highlight: [`r${cell.row}-c${cell.col}`],
                                res: val
                            });
                        } else {
                            steps.push({
                                desc: `${val} ≤ ${currentMax} → Tetap: ${currentMax}`,
                                highlight: [`r${cell.row}-c${cell.col}`],
                                res: currentMax
                            });
                        }
                    }
                });

                finalRes = Math.max(...values);
                steps.push({
                    desc: `Nilai MAX ditemukan di ${String.fromCharCode(65 + maxCell.col)}${maxCell.row + 1}`,
                    highlight: [`r${maxCell.row}-c${maxCell.col}`],
                    res: finalRes
                });
            }
            else if (activeTab === 'MIN') {
                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                steps.push({
                    desc: `Mencari nilai TERKECIL dari ${values.length} data`,
                    highlight: cells.map(c => `r${c.row}-c${c.col}`),
                    res: '...'
                });

                let currentMin = values[0];
                let minCell = cells[0];

                cells.forEach((cell, i) => {
                    const val = parseFloat(cell.value);
                    if (!isNaN(val)) {
                        if (i === 0) {
                            steps.push({
                                desc: `Nilai awal: ${val}`,
                                highlight: [`r${cell.row}-c${cell.col}`],
                                res: val
                            });
                        } else if (val < currentMin) {
                            currentMin = val;
                            minCell = cell;
                            steps.push({
                                desc: `${val} < ${currentMin + (currentMin - val)} → MIN baru: ${val}`,
                                highlight: [`r${cell.row}-c${cell.col}`],
                                res: val
                            });
                        } else {
                            steps.push({
                                desc: `${val} ≥ ${currentMin} → Tetap: ${currentMin}`,
                                highlight: [`r${cell.row}-c${cell.col}`],
                                res: currentMin
                            });
                        }
                    }
                });

                finalRes = Math.min(...values);
                steps.push({
                    desc: `Nilai MIN ditemukan di ${String.fromCharCode(65 + minCell.col)}${minCell.row + 1}`,
                    highlight: [`r${minCell.row}-c${minCell.col}`],
                    res: finalRes
                });
            }
        } catch (e) {
            finalRes = "#ERROR!";
            console.error(e);
        }

        return { steps, finalRes };
    };

    const startAnimation = () => {
        const { steps, finalRes } = generateSteps();
        if (steps.length === 0) return;

        setAnimationSteps(steps);
        setResult(finalRes);
        setTempResult("...");
        setCurrentStep(0);
        setIsAnimating(true);
    };

    useEffect(() => {
        if (!isAnimating) {
            const parsed = parseFormula();
            if (parsed.valid) {
                const { cells, values } = parsed;
                setHighlightedCells(cells.map(c => `r${c.row}-c${c.col}`));

                let res;
                switch (activeTab) {
                    case 'SUM': res = values.reduce((a, b) => a + b, 0); break;
                    case 'AVERAGE': res = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2); break;
                    case 'COUNT': res = values.length; break;
                    case 'MAX': res = Math.max(...values); break;
                    case 'MIN': res = Math.min(...values); break;
                    default: res = 0;
                }
                setResult(res);
                setFormulaError('');
                setFormulaHint('');
            } else {
                setHighlightedCells([]);
                setResult('#ERROR!');
                setFormulaError(parsed.error);
                setFormulaHint(parsed.hint || '');
            }
        }
    }, [formulaInput, activeTab]);

    useEffect(() => {
        let timer;
        if (isAnimating) {
            if (currentStep < animationSteps.length) {
                timer = setTimeout(() => {
                    const stepData = animationSteps[currentStep];
                    setHighlightedCells(stepData.highlight);
                    setTempResult(stepData.res);
                    setCurrentStep(prev => prev + 1);
                }, playbackSpeed);
            } else {
                setIsAnimating(false);
            }
        }
        return () => clearTimeout(timer);
    }, [isAnimating, currentStep, animationSteps, playbackSpeed]);

    const tabs = ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'];

    const getFormulaInfo = () => {
        switch (activeTab) {
            case 'SUM': return {
                title: "SUM - Penjumlahan",
                desc: "Menjumlahkan semua nilai angka dalam rentang sel yang dipilih.",
                syntax: "=SUM(number1; [number2]; ...)",
                example: "=SUM(C2:C6) atau =SUM(C2;C3;C4)",
                icon: <Plus className="w-5 h-5" />,
                challenge: "Coba ketik =SUM(E2:E6) untuk menjumlahkan nilai IPA. Atau coba =SUM(C2;D2;E2) untuk menjumlahkan semua nilai Andi."
            };
            case 'AVERAGE': return {
                title: "AVERAGE - Rata-rata",
                desc: "Menghitung nilai rata-rata (mean) dari sekumpulan angka.",
                syntax: "=AVERAGE(number1; [number2]; ...)",
                example: "=AVERAGE(C2:C6) atau =AVERAGE(C2;D2;E2)",
                icon: <BarChart2 className="w-5 h-5" />,
                challenge: "Ketik =AVERAGE(C2;D2;E2) untuk menghitung rata-rata semua nilai Andi."
            };
            case 'COUNT': return {
                title: "COUNT - Menghitung",
                desc: "Menghitung berapa banyak sel yang berisi angka.",
                syntax: "=COUNT(value1; [value2]; ...)",
                example: "=COUNT(C2:C6)",
                icon: <Hash className="w-5 h-5" />,
                challenge: "Coba =COUNT(A2:A6) - apakah kolom No juga terhitung sebagai angka?"
            };
            case 'MAX': return {
                title: "MAX - Nilai Tertinggi",
                desc: "Menemukan nilai terbesar dari sekumpulan angka.",
                syntax: "=MAX(number1; [number2]; ...)",
                example: "=MAX(C2:C6) atau =MAX(C2;D2;E2)",
                icon: <TrendingUp className="w-5 h-5" />,
                challenge: "Ketik =MAX(C2;D2;E2) untuk mencari nilai tertinggi Andi dari semua mata pelajaran."
            };
            case 'MIN': return {
                title: "MIN - Nilai Terendah",
                desc: "Menemukan nilai terkecil dari sekumpulan angka.",
                syntax: "=MIN(number1; [number2]; ...)",
                example: "=MIN(C2:C6) atau =MIN(C2;D2;E2)",
                icon: <TrendingDown className="w-5 h-5" />,
                challenge: "Ketik =MIN(D2:D6) untuk mencari nilai Bahasa terendah. Siapa yang mendapatkannya?"
            };
            default: return {
                title: activeTab,
                desc: "Fungsi dasar spreadsheet.",
                syntax: "=FORMULA()",
                example: "",
                icon: <Calculator className="w-5 h-5" />,
                challenge: ""
            };
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-50 font-sans text-slate-800 p-4 md:p-8 overflow-y-auto text-left custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

                {/* LEFT COLUMN: VISUALIZATION */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-md border-b-4 border-blue-700">
                        <h2 className="flex items-center gap-2 font-bold text-lg mb-2">
                            <span className="text-blue-200">{getFormulaInfo().icon}</span>
                            {getFormulaInfo().title}
                        </h2>
                        <p className="text-sm opacity-90 mb-4 leading-relaxed">{getFormulaInfo().desc}</p>
                        <div className="space-y-2">
                            <div className="bg-blue-800/40 p-3 rounded-xl font-mono text-xs border border-white/10 tracking-wider">
                                <span className="text-blue-300">Sintaks:</span> {getFormulaInfo().syntax}
                            </div>
                            <div className="bg-blue-800/40 p-3 rounded-xl font-mono text-xs border border-white/10 tracking-wider">
                                <span className="text-blue-300">Contoh:</span> {getFormulaInfo().example}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
                        {isAnimating && (
                            <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2 z-10">
                                <Play size={10} className="fill-current" /> Simulasi Berjalan...
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Grid size={14} /> Data Nilai Ujian Siswa
                            </h2>
                            <div className="text-[10px] text-slate-400 font-mono">
                                Range: A1:E6
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-slate-200 mb-6 shadow-sm">
                            <table className="w-full border-collapse text-sm text-center">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-500">
                                        <th className="border border-slate-200 p-1 w-10 text-[10px] bg-slate-50 font-bold"></th>
                                        {['A', 'B', 'C', 'D', 'E'].map(l => (
                                            <th key={l} className="border border-slate-200 p-1 font-bold">{l}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {examData.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                            <td className={`border border-slate-200 p-1 text-[10px] bg-slate-50 font-bold ${rIdx === 0 ? 'text-slate-800' : 'text-slate-400'}`}>{rIdx + 1}</td>
                                            {row.map((cell, cIdx) => (
                                                <td
                                                    key={cIdx}
                                                    className={`border border-slate-200 p-3 transition-all duration-300 ${highlightedCells.includes(`r${rIdx}-c${cIdx}`)
                                                        ? 'bg-yellow-100 border-yellow-500 font-bold text-yellow-900 ring-2 ring-yellow-400 ring-inset scale-95 rounded'
                                                        : rIdx === 0
                                                            ? 'bg-slate-100 font-bold text-slate-700'
                                                            : 'bg-white'
                                                        }`}
                                                >
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cell Reference Guide */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-500">
                            <span className="font-bold">Referensi Kolom:</span>{' '}
                            A = No | B = Nama | C = Matematika | D = Bahasa | E = IPA
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border-t-4 border-blue-500 overflow-hidden text-center relative transition-all">
                        {isAnimating && (
                            <div className="h-1 bg-slate-100 w-full absolute top-0 left-0">
                                <div className="h-full bg-blue-500 transition-all duration-300 ease-linear" style={{ width: `${((currentStep) / animationSteps.length) * 100}%` }}></div>
                            </div>
                        )}

                        <div className="p-8 bg-blue-50/20 flex flex-col items-center justify-center min-h-[140px]">
                            {isAnimating ? (
                                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Proses Kalkulasi</span>
                                    <div className="text-xl font-medium text-slate-600">
                                        {animationSteps[currentStep]?.desc || "Memulai..."}
                                    </div>
                                    <div className="text-sm font-mono text-slate-400 mt-2">
                                        Hasil: {tempResult}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block mb-2">Hasil Formula</span>
                                    <div className={`text-6xl font-mono font-black drop-shadow-sm ${result === '#ERROR!' ? 'text-red-500' : 'text-slate-900'}`}>{result}</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: CONTROLS */}
                <div className="space-y-6">
                    <button
                        onClick={() => setShowQuiz(true)}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-3 rounded-xl border-2 border-yellow-500 shadow-sm flex items-center justify-center gap-2 font-bold transition-all text-sm uppercase tracking-wider mb-2"
                    >
                        <Trophy size={16} /> Mode Kuis
                    </button>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-4 overflow-y-auto max-h-[85vh] custom-scrollbar text-left flex flex-col h-full">
                        <div className="flex flex-col gap-3 mb-6">
                            <span className="text-[10px] font-bold text-slate-300 uppercase mb-2 block tracking-widest">Pilih Fungsi</span>
                            <div className="flex gap-1.5 flex-wrap">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        disabled={isAnimating}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${activeTab === tab
                                            ? 'bg-blue-600 border-blue-700 text-white shadow-md scale-105'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 block">
                                Ketik Formula
                            </label>
                            <FormulaInput
                                value={formulaInput}
                                onChange={(e) => setFormulaInput(e.target.value)}
                                placeholder={`=${activeTab}(C2:C6)`}
                                isValid={!formulaError}
                                errorMessage={formulaError}
                                hintMessage={formulaHint}
                            />
                            <p className="text-[10px] text-slate-400 mt-2 italic">
                                Gunakan format range seperti C2:C6 atau pisahkan dengan ; seperti C2;C3;C4
                            </p>
                        </div>

                        <button
                            onClick={startAnimation}
                            disabled={isAnimating || !!formulaError}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all mb-6 ${isAnimating || formulaError
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                                }`}
                        >
                            {isAnimating ? <Pause size={16} /> : <Play size={16} />}
                            {isAnimating ? 'Menjalankan...' : 'Jalankan Simulasi'}
                        </button>



                        {/* BOX TANTANGAN PRAKTIKUM */}
                        <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 shadow-sm mb-6">
                            <h4 className="text-yellow-800 text-[11px] font-bold mb-2 flex items-center gap-2 uppercase tracking-wider">
                                <Lightbulb size={16} className="text-yellow-600" /> Tantangan Praktikum
                            </h4>
                            <p className="text-[11px] text-yellow-700 leading-relaxed font-medium">
                                {getFormulaInfo().challenge}
                            </p>
                        </div>

                        {/* Info Rumus */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <h4 className="text-blue-800 text-[10px] font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
                                <BookOpen size={14} /> Cara Menulis Formula
                            </h4>
                            <ul className="text-[10px] text-blue-700 space-y-1.5 list-disc list-inside">
                                <li>Selalu awali dengan tanda <code className="bg-blue-100 px-1 rounded">=</code></li>
                                <li>Tulis nama fungsi: <code className="bg-blue-100 px-1 rounded">{activeTab}</code></li>
                                <li>Buka kurung dan tulis range: <code className="bg-blue-100 px-1 rounded">(C2:C6)</code></li>
                                <li>Atau gunakan pemisah <code className="bg-blue-100 px-1 rounded">;</code> untuk sel individual</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {/* Quiz Mode */}
            {showQuiz && (
                <QuizMode
                    moduleId="excel_basic"
                    moduleName="Microsoft Excel: Formula Dasar"
                    questions={excelBasicQuizQuestions}
                    onClose={() => setShowQuiz(false)}
                />
            )}
        </div>
    );
};

export default BasicFormulaLab;
