import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Grid, HelpCircle, BookOpen, Play, Pause, Lightbulb, ChevronDown,
    Type, CaseSensitive, FileText, ArrowUpCircle, ArrowDownCircle, Sparkles, AlertCircle
} from 'lucide-react';

// ============================================================
// MODUL: FORMULA TEKS (UPPER, LOWER, PROPER, TEXT)
// Versi Real - Input Sintaks Formula Sebenarnya
// ============================================================

const FormulaInput = ({ value, onChange, placeholder, isValid, errorMessage, hintMessage }) => (
    <div className="relative">
        <div className={`flex items-center bg-slate-900 rounded-xl overflow-hidden border-2 transition-all ${!isValid && errorMessage ? 'border-red-500/70 ring-2 ring-red-500/20' : 'border-slate-700 focus-within:border-purple-500'}`}>
            <span className="text-purple-400 font-bold text-lg px-3 font-serif italic">fx</span>
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

const TextFormulaLab = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState(tabParam || 'UPPER');

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Animation State
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [animationSteps, setAnimationSteps] = useState([]);
    const [playbackSpeed, setPlaybackSpeed] = useState(500);

    const [highlightedCells, setHighlightedCells] = useState([]);
    const [result, setResult] = useState(null);
    const [tempResult, setTempResult] = useState(null);
    const [formulaError, setFormulaError] = useState('');
    const [formulaHint, setFormulaHint] = useState('');

    // Sample Data - Daftar Karyawan
    const employeeData = [
        ['No', 'Nama Lengkap', 'Jabatan', 'Gaji', 'Tgl Masuk'],
        ['1', 'budi santoso', 'staff IT', '5000000', '45292'],
        ['2', 'DEWI LESTARI', 'manager HR', '8500000', '44562'],
        ['3', 'andi WIJAYA pratama', 'supervisor', '6500000', '45000'],
        ['4', 'siti NURhayati', 'admin keuangan', '4500000', '44927'],
        ['5', 'rahmat hidayat', 'kepala divisi', '9000000', '44197']
    ];

    // Formula input state
    const [formulaInput, setFormulaInput] = useState('=UPPER(B2)');

    // Update formula when tab changes
    useEffect(() => {
        const defaultFormulas = {
            'UPPER': '=UPPER(B2)',
            'LOWER': '=LOWER(B2)',
            'PROPER': '=PROPER(B2)',
            'TEXT': '=TEXT(D2;"Rp #.##0")',
            'LEFT': '=LEFT(B2;3)',
            'RIGHT': '=RIGHT(B2;3)',
            'MID': '=MID(B2;3;5)',
            'LEN': '=LEN(B2)'
        };
        setFormulaInput(defaultFormulas[activeTab] || '=UPPER(B2)');
        setFormulaError('');
        setFormulaHint('');
    }, [activeTab]);

    // Parse cell reference like "B2"
    const parseCell = (cellRef) => {
        const colMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
        const match = cellRef.trim().match(/^([A-E])(\d+)$/i);
        if (!match) return null;

        const [_, col, row] = match;
        const colIdx = colMap[col.toUpperCase()];
        const rowIdx = parseInt(row) - 1;

        if (rowIdx >= 0 && rowIdx <= 5 && employeeData[rowIdx]) {
            return {
                row: rowIdx,
                col: colIdx,
                value: employeeData[rowIdx][colIdx],
                ref: `${col.toUpperCase()}${row}`
            };
        }
        return null;
    };

    // Parse the formula input with improved error messages and hints
    const parseFormula = () => {
        const formula = formulaInput.trim();
        const formulaUpper = formula.toUpperCase();

        // 1. Check start
        if (!formula.startsWith('=')) {
            return {
                valid: false,
                error: '⚠️ Formula harus diawali tanda "="',
                hint: `Contoh yang benar: =${activeTab}(...)`
            };
        }

        // 2. Check parenthesis
        const match = formulaUpper.match(/^=(\w+)\((.*)\)$/);
        if (!match) {
            if (!formula.includes('(')) return { valid: false, error: '⚠️ Kurung buka "(" tidak ditemukan', hint: `Format: =${activeTab}(...)` };
            if (!formula.includes(')')) return { valid: false, error: '⚠️ Kurung tutup ")" tidak ditemukan', hint: `Pastikan formula diakhiri dengan ")"` };
            return { valid: false, error: '⚠️ Format formula tidak valid', hint: `Cek kembali penulisan formula Anda` };
        }

        const [_, funcName, argsStr] = match;

        // 3. Check function name
        if (funcName !== activeTab) {
            return {
                valid: false,
                error: `⚠️ Fungsi "${funcName}" tidak sesuai tab "${activeTab}"`,
                hint: `Ganti menjadi =${activeTab}(...) atau klik tab ${funcName}`
            };
        }

        // 4. Check separator hint
        if (argsStr.includes(',') && !argsStr.includes(';')) {
            return {
                valid: false,
                error: '⚠️ Gunakan titik koma (;) bukan koma (,)',
                hint: `Excel di sini menggunakan regional Indonesia (;)`
            };
        }

        // 5. Parse Arguments based on function type
        const args = argsStr.split(';').map(s => s.trim());

        // Helper to parse cell
        const getCell = (ref) => {
            const cell = parseCell(ref);
            if (!cell) return { error: `Sel "${ref}" tidak valid`, hint: 'Gunakan range A1:E6 (misal B2, C3)' };
            return { cell };
        };

        if (['UPPER', 'LOWER', 'PROPER', 'LEN'].includes(activeTab)) {
            if (args.length !== 1 || !args[0]) {
                return { valid: false, error: '⚠️ Fungsi ini butuh 1 argumen', hint: `Contoh: =${activeTab}(B2)` };
            }
            const { cell, error, hint } = getCell(args[0]);
            if (error) return { valid: false, error: '⚠️ ' + error, hint };
            return { valid: true, funcName, cell };
        }
        else if (['LEFT', 'RIGHT'].includes(activeTab)) {
            if (args.length < 1 || args.length > 2) {
                return { valid: false, error: '⚠️ Fungsi ini butuh 1 atau 2 argumen', hint: `Contoh: =${activeTab}(B2; 3)` };
            }
            const { cell, error, hint } = getCell(args[0]);
            if (error) return { valid: false, error: '⚠️ ' + error, hint };

            let numChars = 1; // default
            if (args.length === 2) {
                numChars = parseInt(args[1]);
                if (isNaN(numChars) || numChars < 0) return { valid: false, error: '⚠️ Jumlah karakter harus angka positif', hint: 'Contoh: 3, 4, 5' };
            }
            return { valid: true, funcName, cell, numChars };
        }
        else if (activeTab === 'MID') {
            if (args.length !== 3) {
                return { valid: false, error: '⚠️ MID butuh 3 argumen', hint: `Format: =MID(sel; mulai; jumlah) -> =MID(B2; 3; 5)` };
            }
            const { cell, error, hint } = getCell(args[0]);
            if (error) return { valid: false, error: '⚠️ ' + error, hint };

            const startNum = parseInt(args[1]);
            const numChars = parseInt(args[2]);

            if (isNaN(startNum) || startNum < 1) return { valid: false, error: '⚠️ Posisi mulai harus angka >= 1', hint: 'Karakter pertama = 1' };
            if (isNaN(numChars) || numChars < 0) return { valid: false, error: '⚠️ Jumlah karakter harus angka positif', hint: 'Contoh: 5' };

            return { valid: true, funcName, cell, startNum, numChars };
        }
        else if (activeTab === 'TEXT') {
            // TEXT needs special regex because format string has quotes and might have ; inside quotes (though rare here)
            // Re-parse with regex for TEXT to capture quotes safely
            const textMatch = formula.match(/^=TEXT\(([A-E]\d+)\s*;\s*"([^"]+)"\)$/i);
            if (!textMatch) {
                return { valid: false, error: '⚠️ Format TEXT salah', hint: `Contoh: =TEXT(D2; "Rp #.##0")` };
            }
            const [__, cellRef, fmt] = textMatch;
            const { cell, error, hint } = getCell(cellRef);
            if (error) return { valid: false, error: '⚠️ ' + error, hint };

            return { valid: true, funcName, cell, format: fmt };
        }

        return { valid: false, error: '⚠️ Fungsi tidak dikenal' };
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
        const { cell, format } = parsed;
        const text = cell.value;

        try {
            if (activeTab === 'UPPER') {
                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                steps.push({
                    desc: `Mengambil teks dari sel ${cell.ref}: "${text}"`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: text
                });

                // Show character conversion
                let converted = "";
                const chars = text.split('');
                for (let i = 0; i < Math.min(chars.length, 6); i++) {
                    const char = chars[i];
                    const upper = char.toUpperCase();
                    converted += upper;
                    if (char !== upper) {
                        steps.push({
                            desc: `Karakter "${char}" → "${upper}"`,
                            highlight: [`r${cell.row}-c${cell.col}`],
                            res: converted + (i < chars.length - 1 ? '...' : '')
                        });
                    }
                }

                if (chars.length > 6) {
                    steps.push({
                        desc: `Memproses ${chars.length - 6} karakter lainnya...`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: text.toUpperCase()
                    });
                }

                finalRes = text.toUpperCase();
                steps.push({
                    desc: `Hasil UPPER: Semua huruf menjadi KAPITAL`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: finalRes
                });
            }
            else if (activeTab === 'LOWER') {
                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                steps.push({
                    desc: `Mengambil teks dari sel ${cell.ref}: "${text}"`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: text
                });

                let converted = "";
                const chars = text.split('');
                for (let i = 0; i < Math.min(chars.length, 6); i++) {
                    const char = chars[i];
                    const lower = char.toLowerCase();
                    converted += lower;
                    if (char !== lower) {
                        steps.push({
                            desc: `Karakter "${char}" → "${lower}"`,
                            highlight: [`r${cell.row}-c${cell.col}`],
                            res: converted + (i < chars.length - 1 ? '...' : '')
                        });
                    }
                }

                if (chars.length > 6) {
                    steps.push({
                        desc: `Memproses ${chars.length - 6} karakter lainnya...`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: text.toLowerCase()
                    });
                }

                finalRes = text.toLowerCase();
                steps.push({
                    desc: `Hasil LOWER: Semua huruf menjadi kecil`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: finalRes
                });
            }
            else if (activeTab === 'PROPER') {
                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                steps.push({
                    desc: `Mengambil teks dari sel ${cell.ref}: "${text}"`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: text
                });

                const words = text.split(' ');
                let properResult = [];

                words.forEach((word, i) => {
                    const properWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                    properResult.push(properWord);
                    steps.push({
                        desc: `Kata "${word}" → "${properWord}"`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: properResult.join(' ')
                    });
                });

                finalRes = properResult.join(' ');
                steps.push({
                    desc: `Hasil PROPER: Setiap kata diawali huruf kapital`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: finalRes
                });
            }
            else if (['LEFT', 'RIGHT', 'MID'].includes(activeTab)) {
                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                steps.push({
                    desc: `Mengambil teks dari sel ${cell.ref}: "${text}" (Panjang: ${text.length})`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: text
                });

                let startIndex = 0;
                let length = 0;

                if (activeTab === 'LEFT') {
                    startIndex = 0;
                    length = parsed.numChars;
                    steps.push({
                        desc: `Mengambil ${length} karakter dari KIRI`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: text
                    });
                } else if (activeTab === 'RIGHT') {
                    length = parsed.numChars;
                    startIndex = text.length - length;
                    if (startIndex < 0) startIndex = 0;
                    steps.push({
                        desc: `Mengambil ${length} karakter dari KANAN`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: text
                    });
                } else if (activeTab === 'MID') {
                    startIndex = parsed.startNum - 1; // 1-based to 0-based
                    length = parsed.numChars;
                    steps.push({
                        desc: `Mulai dari karakter ke-${parsed.startNum}, ambil ${length} karakter`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: text
                    });
                }

                // Simulate extraction
                let extracted = "";
                // Clamp length to valid range
                const actualEnd = Math.min(startIndex + length, text.length);

                for (let i = startIndex; i < actualEnd; i++) {
                    extracted += text[i];
                    steps.push({
                        desc: `Ambil karakter ke-${i + 1}: "${text[i]}"`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: extracted
                    });
                }

                finalRes = extracted;
                steps.push({
                    desc: `Hasil ${activeTab}: "${finalRes}"`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: finalRes
                });
            }
            else if (activeTab === 'LEN') {
                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                steps.push({
                    desc: `Mengambil teks dari sel ${cell.ref}: "${text}"`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: text
                });

                // Animate counting
                const chars = text.split('');
                let count = 0;
                // Don't step every char if too long
                const jump = chars.length > 10 ? 3 : 1;

                for (let i = 0; i < chars.length; i += jump) {
                    count = i + 1;
                    steps.push({
                        desc: `Menghitung karakter ke-${count}: "${chars[i]}"...`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: count
                    });
                }

                // Ensure final count is correct
                if (count !== chars.length) {
                    steps.push({
                        desc: `Menghitung sisa karakter...`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: chars.length
                    });
                }

                finalRes = text.length;
                steps.push({
                    desc: `Hasil LEN: Total ${finalRes} karakter`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: finalRes
                });
            }
            else if (activeTab === 'TEXT') {
                const value = parseFloat(text);

                steps.push({
                    desc: `Membaca formula: ${formulaInput}`,
                    highlight: [],
                    res: '...'
                });

                steps.push({
                    desc: `Mengambil nilai dari sel ${cell.ref}: ${value}`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: value
                });

                steps.push({
                    desc: `Format yang digunakan: "${format}"`,
                    highlight: [`r${cell.row}-c${cell.col}`],
                    res: '...'
                });

                // Process format
                let formatted = "";
                const formatLower = format.toLowerCase();

                if (formatLower.includes('rp') || formatLower.includes('#')) {
                    // Currency/Number format
                    const prefix = format.match(/^[^#0]*/)?.[0] || '';
                    formatted = prefix + value.toLocaleString('id-ID');
                    steps.push({
                        desc: `Menerapkan format angka dengan pemisah ribuan`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: formatted
                    });
                }
                else if (formatLower.includes('dd') || formatLower.includes('mm') || formatLower.includes('yyyy')) {
                    // Date format - convert Excel serial to date
                    const excelDate = new Date((value - 25569) * 86400 * 1000);
                    const day = excelDate.getDate().toString().padStart(2, '0');
                    const month = (excelDate.getMonth() + 1).toString().padStart(2, '0');
                    const year = excelDate.getFullYear();
                    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

                    if (formatLower === 'dd-mm-yyyy') {
                        formatted = `${day}-${month}-${year}`;
                    } else if (formatLower === 'mmmm yyyy') {
                        formatted = `${months[excelDate.getMonth()]} ${year}`;
                    } else if (formatLower === 'dddd') {
                        formatted = days[excelDate.getDay()];
                    } else {
                        formatted = `${day}/${month}/${year}`;
                    }
                    steps.push({
                        desc: `Mengkonversi nomor seri ${value} ke format tanggal`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: formatted
                    });
                }
                else if (formatLower.includes('%')) {
                    formatted = (value * 100).toFixed(0) + '%';
                    steps.push({
                        desc: `Menerapkan format persentase`,
                        highlight: [`r${cell.row}-c${cell.col}`],
                        res: formatted
                    });
                }
                else {
                    formatted = value.toString();
                }

                finalRes = formatted;
                steps.push({
                    desc: `Hasil TEXT: Angka diformat menjadi teks`,
                    highlight: [`r${cell.row}-c${cell.col}`],
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

    // Calculate result on formula change
    useEffect(() => {
        if (!isAnimating) {
            const parsed = parseFormula();
            if (parsed.valid) {
                const { cell, format } = parsed;
                setHighlightedCells([`r${cell.row}-c${cell.col}`]);

                let res;
                const text = cell.value;

                switch (activeTab) {
                    case 'UPPER': res = text.toUpperCase(); break;
                    case 'LOWER': res = text.toLowerCase(); break;
                    case 'PROPER': res = text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '); break;
                    case 'LEN': res = text.length; break;
                    case 'LEFT': res = text.substring(0, parsed.numChars); break;
                    case 'RIGHT': res = text.substring(text.length - parsed.numChars); break;
                    case 'MID': res = text.substring(parsed.startNum - 1, parsed.startNum - 1 + parsed.numChars); break;
                    case 'TEXT':
                        const value = parseFloat(text);
                        const formatLower = format?.toLowerCase() || '';
                        if (formatLower.includes('rp') || formatLower.includes('#')) {
                            const prefix = format.match(/^[^#0]*/)?.[0] || '';
                            res = prefix + value.toLocaleString('id-ID');
                        } else if (formatLower.includes('dd') || formatLower.includes('mm') || formatLower.includes('yyyy')) {
                            const excelDate = new Date((value - 25569) * 86400 * 1000);
                            const day = excelDate.getDate().toString().padStart(2, '0');
                            const month = (excelDate.getMonth() + 1).toString().padStart(2, '0');
                            const year = excelDate.getFullYear();
                            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

                            if (formatLower === 'dd-mm-yyyy') {
                                res = `${day}-${month}-${year}`;
                            } else if (formatLower === 'mmmm yyyy') {
                                res = `${months[excelDate.getMonth()]} ${year}`;
                            } else if (formatLower === 'dddd') {
                                res = days[excelDate.getDay()];
                            } else {
                                res = `${day}/${month}/${year}`;
                            }
                        } else if (formatLower.includes('%')) {
                            res = (value * 100).toFixed(0) + '%';
                        } else {
                            res = value.toLocaleString('id-ID');
                        }
                        break;
                    default:
                        res = text;
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

    const tabs = ['UPPER', 'LOWER', 'PROPER', 'TEXT', 'LEFT', 'RIGHT', 'MID', 'LEN'];

    const getFormulaInfo = () => {
        switch (activeTab) {
            case 'UPPER': return {
                title: "UPPER - Huruf Kapital",
                desc: "Mengubah semua huruf dalam teks menjadi huruf KAPITAL.",
                syntax: "=UPPER(text)",
                example: "=UPPER(B2) atau =UPPER(C3)",
                icon: <ArrowUpCircle className="w-5 h-5" />,
                challenge: "Ketik =UPPER(C2) untuk mengubah jabatan menjadi kapital. Coba juga =UPPER(B3) untuk nama lain."
            };
            case 'LOWER': return {
                title: "LOWER - Huruf Kecil",
                desc: "Mengubah semua huruf dalam teks menjadi huruf kecil.",
                syntax: "=LOWER(text)",
                example: "=LOWER(B2) atau =LOWER(B3)",
                icon: <ArrowDownCircle className="w-5 h-5" />,
                challenge: "Coba =LOWER(B3) untuk mengubah 'DEWI LESTARI' menjadi huruf kecil semua."
            };
            case 'PROPER': return {
                title: "PROPER - Huruf Judul",
                desc: "Mengubah huruf pertama setiap kata menjadi kapital.",
                syntax: "=PROPER(text)",
                example: "=PROPER(B2) atau =PROPER(C4)",
                icon: <Sparkles className="w-5 h-5" />,
                challenge: "Ketik =PROPER(B4) untuk merapikan 'andi WIJAYA pratama' menjadi format nama yang benar."
            };
            case 'TEXT': return {
                title: "TEXT - Format Angka",
                desc: "Mengubah angka menjadi teks dengan format tertentu.",
                syntax: '=TEXT(value;"format_text")',
                example: '=TEXT(D2;"Rp #.##0") atau =TEXT(E2;"dd-mm-yyyy")',
                icon: <FileText className="w-5 h-5" />,
                challenge: 'Coba =TEXT(E2;"dd-mm-yyyy") untuk mengubah nomor seri tanggal. Atau =TEXT(D3;"Rp #.##0") untuk format gaji.'
            };
            case 'LEFT': return {
                title: "LEFT - Ambil Kiri",
                desc: "Mengambil beberapa karakter dari awal (kiri) teks.",
                syntax: "=LEFT(text; [num_chars])",
                example: "=LEFT(B2; 4) -> 'budi'",
                icon: <ArrowUpCircle className="w-5 h-5 rotate-[-45deg]" />,
                challenge: "Ambil 4 karakter pertama dari nama 'DEWI LESTARI' dengan =LEFT(B3;4)."
            };
            case 'RIGHT': return {
                title: "RIGHT - Ambil Kanan",
                desc: "Mengambil beberapa karakter dari akhir (kanan) teks.",
                syntax: "=RIGHT(text; [num_chars])",
                example: "=RIGHT(B2; 7) -> 'santoso'",
                icon: <ArrowUpCircle className="w-5 h-5 rotate-[45deg]" />,
                challenge: "Ambil nama belakang 'santoso' dari B2 menggunakan =RIGHT(B2;7)."
            };
            case 'MID': return {
                title: "MID - Ambil Tengah",
                desc: "Mengambil karakter dari tengah teks, mulai dari posisi tertentu.",
                syntax: "=MID(text; start_num; num_chars)",
                example: "=MID(B2; 6; 7) -> 'santoso'",
                icon: <Grid className="w-5 h-5" />,
                challenge: "Ambil kata 'WIJAYA' dari B4 (mulai karakter ke-6, panjang 6) dengan =MID(B4;6;6)."
            };
            case 'LEN': return {
                title: "LEN - Panjang Teks",
                desc: "Menghitung jumlah karakter dalam sebuah teks (termasuk spasi).",
                syntax: "=LEN(text)",
                example: "=LEN(B2) -> 12",
                icon: <Type className="w-5 h-5" />,
                challenge: "Hitung panjang nama 'andi WIJAYA pratama' dengan =LEN(B4)."
            };
            default: return {
                title: activeTab,
                desc: "Fungsi teks spreadsheet.",
                syntax: "=FORMULA()",
                example: "",
                icon: <Type className="w-5 h-5" />,
                challenge: ""
            };
        }
    };

    const formatExamples = [
        { format: 'Rp #.##0', desc: 'Format mata uang Indonesia', example: 'Rp 5.000.000' },
        { format: '#.##0', desc: 'Format angka dengan pemisah ribuan', example: '5.000.000' },
        { format: 'dd-mm-yyyy', desc: 'Format tanggal standar', example: '15-01-2024' },
        { format: 'mmmm yyyy', desc: 'Format bulan dan tahun', example: 'Januari 2024' },
        { format: 'dddd', desc: 'Format nama hari', example: 'Senin' },
        { format: '0%', desc: 'Format persentase', example: '50%' }
    ];

    return (
        <div className="flex flex-col h-full w-full bg-slate-50 font-sans text-slate-800 p-4 md:p-8 overflow-y-auto text-left custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

                {/* LEFT COLUMN: VISUALIZATION */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-md border-b-4 border-purple-700">
                        <h2 className="flex items-center gap-2 font-bold text-lg mb-2">
                            <span className="text-purple-200">{getFormulaInfo().icon}</span>
                            {getFormulaInfo().title}
                        </h2>
                        <p className="text-sm opacity-90 mb-4 leading-relaxed">{getFormulaInfo().desc}</p>
                        <div className="space-y-2">
                            <div className="bg-purple-800/40 p-3 rounded-xl font-mono text-xs border border-white/10 tracking-wider">
                                <span className="text-purple-300">Sintaks:</span> {getFormulaInfo().syntax}
                            </div>
                            <div className="bg-purple-800/40 p-3 rounded-xl font-mono text-xs border border-white/10 tracking-wider">
                                <span className="text-purple-300">Contoh:</span> {getFormulaInfo().example}
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
                                <Grid size={14} /> Data Karyawan
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
                                    {employeeData.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                            <td className={`border border-slate-200 p-1 text-[10px] bg-slate-50 font-bold ${rIdx === 0 ? 'text-slate-800' : 'text-slate-400'}`}>{rIdx + 1}</td>
                                            {row.map((cell, cIdx) => (
                                                <td
                                                    key={cIdx}
                                                    className={`border border-slate-200 p-2 transition-all duration-300 text-xs ${highlightedCells.includes(`r${rIdx}-c${cIdx}`)
                                                        ? 'bg-yellow-100 border-yellow-500 font-bold text-yellow-900 ring-2 ring-yellow-400 ring-inset scale-95 rounded'
                                                        : rIdx === 0
                                                            ? 'bg-slate-100 font-bold text-slate-700'
                                                            : 'bg-white'
                                                        }`}
                                                >
                                                    {cIdx === 3 && rIdx > 0
                                                        ? parseInt(cell).toLocaleString('id-ID')
                                                        : cIdx === 4 && rIdx > 0
                                                            ? cell
                                                            : cell
                                                    }
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cell Reference Guide */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-500">
                            <span className="font-bold">Referensi:</span>{' '}
                            A = No | B = Nama | C = Jabatan | D = Gaji | E = Tgl Masuk (serial)
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border-t-4 border-purple-500 overflow-hidden text-center relative transition-all">
                        {isAnimating && (
                            <div className="h-1 bg-slate-100 w-full absolute top-0 left-0">
                                <div className="h-full bg-purple-500 transition-all duration-300 ease-linear" style={{ width: `${((currentStep) / animationSteps.length) * 100}%` }}></div>
                            </div>
                        )}

                        <div className="p-8 bg-purple-50/20 flex flex-col items-center justify-center min-h-[140px]">
                            {isAnimating ? (
                                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Proses Kalkulasi</span>
                                    <div className="text-lg font-medium text-slate-600">
                                        {animationSteps[currentStep]?.desc || "Memulai..."}
                                    </div>
                                    <div className="text-sm font-mono text-slate-400 mt-2">
                                        Hasil: {tempResult}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest block mb-2">Hasil Formula</span>
                                    <div className={`text-3xl md:text-4xl font-mono font-black drop-shadow-sm break-all px-4 ${result === '#ERROR!' ? 'text-red-500' : 'text-slate-900'}`}>{result}</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: CONTROLS */}
                <div className="space-y-6">
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
                                            ? 'bg-purple-600 border-purple-700 text-white shadow-md scale-105'
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
                                placeholder={activeTab === 'TEXT' ? '=TEXT(D2;"Rp #.##0")' : activeTab === 'MID' ? '=MID(B2;1;5)' : `=${activeTab}(B2)`}
                                isValid={!formulaError}
                                errorMessage={formulaError}
                                hintMessage={formulaHint}
                            />
                            <p className="text-[10px] text-slate-400 mt-2 italic">
                                {activeTab === 'TEXT'
                                    ? 'Format: =TEXT(sel;"format"). Gunakan tanda kutip untuk format.'
                                    : `Format: =${activeTab}(sel). Contoh: =${activeTab}(B2)`
                                }
                            </p>
                        </div>

                        <button
                            onClick={startAnimation}
                            disabled={isAnimating || !!formulaError}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all mb-6 ${isAnimating || formulaError
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-purple-500/30'
                                }`}
                        >
                            {isAnimating ? <Pause size={16} /> : <Play size={16} />}
                            {isAnimating ? 'Menjalankan...' : 'Jalankan Simulasi'}
                        </button>



                        {/* TEXT Format Examples */}
                        {activeTab === 'TEXT' && (
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl border border-purple-200 mb-6">
                                <h4 className="text-purple-800 text-[10px] font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <CaseSensitive size={14} /> Format yang Tersedia
                                </h4>
                                <div className="space-y-2 text-[10px]">
                                    {formatExamples.map((fmt, i) => (
                                        <div key={i} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-purple-100">
                                            <code className="font-mono text-purple-700 font-bold whitespace-nowrap">"{fmt.format}"</code>
                                            <span className="text-slate-500">→ {fmt.example}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                            <h4 className="text-purple-800 text-[10px] font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
                                <BookOpen size={14} /> Cara Menulis Formula
                            </h4>
                            <ul className="text-[10px] text-purple-700 space-y-1.5 list-disc list-inside">
                                <li>Selalu awali dengan tanda <code className="bg-purple-100 px-1 rounded">=</code></li>
                                <li>Tulis nama fungsi: <code className="bg-purple-100 px-1 rounded">{activeTab}</code></li>
                                {activeTab === 'TEXT' ? (
                                    <>
                                        <li>Buka kurung, tulis sel dan format: <code className="bg-purple-100 px-1 rounded">(D2;"format")</code></li>
                                        <li>Gunakan tanda kutip untuk format text</li>
                                    </>
                                ) : (
                                    <li>Buka kurung dan tulis referensi sel: <code className="bg-purple-100 px-1 rounded">(B2)</code></li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default TextFormulaLab;
