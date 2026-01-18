import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trophy, ArrowRight, RotateCcw, Lightbulb, Target, X } from 'lucide-react';

const QuizMode = ({ moduleId, moduleName, questions, onClose, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const current = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    const handleSelectAnswer = (index) => {
        if (showResult) return;
        setSelectedAnswer(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        const isCorrect = selectedAnswer === current.correct;
        setAnswers([...answers, { questionIndex: currentQuestion, selected: selectedAnswer, isCorrect }]);

        if (isCorrect) {
            setScore(score + 1);
        }

        setShowResult(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizCompleted(true);
            // Save quiz result to localStorage
            const quizResults = JSON.parse(localStorage.getItem('vlabQuizResults') || '{}');
            quizResults[moduleId] = {
                score,
                total: questions.length,
                percentage: Math.round((score / questions.length) * 100),
                completedAt: new Date().toISOString()
            };
            localStorage.setItem('vlabQuizResults', JSON.stringify(quizResults));

            if (onComplete) {
                onComplete(score, questions.length);
            }
        }
    };

    const handleRetry = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setAnswers([]);
        setQuizCompleted(false);
    };

    const percentage = Math.round((score / questions.length) * 100);
    const isPassing = percentage >= 70;

    // Quiz Completed Screen
    if (quizCompleted) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
                    {/* Header */}
                    <div className={`p-6 text-center ${isPassing ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}>
                        <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                            {isPassing ? (
                                <Trophy size={40} className="text-white" />
                            ) : (
                                <Target size={40} className="text-white" />
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-white mb-1">
                            {isPassing ? 'Selamat!' : 'Coba Lagi!'}
                        </h2>
                        <p className="text-white/80 text-sm">
                            {isPassing ? 'Kamu telah menyelesaikan quiz!' : 'Masih perlu belajar lebih lanjut'}
                        </p>
                    </div>

                    {/* Score */}
                    <div className="p-6 text-center">
                        <div className="text-5xl font-black text-slate-800 mb-2">{percentage}%</div>
                        <p className="text-slate-500 mb-4">
                            {score} dari {questions.length} jawaban benar
                        </p>

                        {/* Answer Summary */}
                        <div className="flex justify-center gap-1 mb-6">
                            {answers.map((ans, idx) => (
                                <div
                                    key={idx}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${ans.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                >
                                    {idx + 1}
                                </div>
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleRetry}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
                            >
                                <RotateCcw size={16} />
                                Ulangi Quiz
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all"
                            >
                                Selesai
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Question Screen
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Lightbulb size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-sm">Quiz: {moduleName}</h2>
                            <p className="text-white/70 text-xs">Uji pemahamanmu!</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-white/70 text-xs">
                        <span>Pertanyaan {currentQuestion + 1} dari {questions.length}</span>
                        <span>Skor: {score}</span>
                    </div>
                </div>

                {/* Question */}
                <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 leading-snug">
                        {current.question}
                    </h3>

                    {/* Options */}
                    <div className="space-y-2 mb-6">
                        {current.options.map((option, idx) => {
                            let optionClass = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50';

                            if (showResult) {
                                if (idx === current.correct) {
                                    optionClass = 'border-green-500 bg-green-50';
                                } else if (idx === selectedAnswer && idx !== current.correct) {
                                    optionClass = 'border-red-500 bg-red-50';
                                } else {
                                    optionClass = 'border-slate-200 opacity-50';
                                }
                            } else if (selectedAnswer === idx) {
                                optionClass = 'border-indigo-500 bg-indigo-50';
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectAnswer(idx)}
                                    disabled={showResult}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${optionClass}`}
                                >
                                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${showResult && idx === current.correct
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : showResult && idx === selectedAnswer && idx !== current.correct
                                            ? 'border-red-500 bg-red-500 text-white'
                                            : selectedAnswer === idx
                                                ? 'border-indigo-500 bg-indigo-500 text-white'
                                                : 'border-slate-300'
                                        }`}>
                                        {showResult && idx === current.correct && <CheckCircle size={14} />}
                                        {showResult && idx === selectedAnswer && idx !== current.correct && <XCircle size={14} />}
                                        {!showResult && String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className={`text-sm ${showResult && idx === current.correct ? 'font-bold text-green-700' : ''}`}>
                                        {option}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation (after answer) */}
                    {showResult && current.explanation && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Penjelasan:</strong> {current.explanation}
                            </p>
                        </div>
                    )}

                    {/* Action Button */}
                    {!showResult ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedAnswer === null}
                            className={`w-full py-3 rounded-lg font-bold transition-all ${selectedAnswer !== null
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            Periksa Jawaban
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="w-full py-3 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                            {currentQuestion < questions.length - 1 ? 'Pertanyaan Berikutnya' : 'Lihat Hasil'}
                            <ArrowRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Quiz data export for different modules
export const excelQuizQuestions = [
    {
        question: "Fungsi manakah yang digunakan untuk mencari data secara vertikal (dari atas ke bawah)?",
        options: ["HLOOKUP", "VLOOKUP", "INDEX", "MATCH"],
        correct: 1,
        explanation: "VLOOKUP (Vertical Lookup) mencari data pada kolom pertama tabel dan mengembalikan nilai dari kolom tertentu pada baris yang sama."
    },
    {
        question: "Apa kegunaan argumen 'col_index_num' pada fungsi VLOOKUP?",
        options: [
            "Menentukan baris yang dicari",
            "Menentukan kolom mana yang akan diambil datanya",
            "Menentukan jenis pencarian (exact/approximate)",
            "Menentukan range tabel"
        ],
        correct: 1,
        explanation: "col_index_num menentukan nomor kolom dalam tabel yang nilai-nya akan dikembalikan oleh fungsi VLOOKUP."
    },
    {
        question: "Fungsi COUNTIF digunakan untuk...",
        options: [
            "Menjumlahkan nilai berdasarkan kriteria",
            "Menghitung jumlah sel yang memenuhi kriteria",
            "Mencari posisi data dalam rentang",
            "Mengambil nilai dari baris tertentu"
        ],
        correct: 1,
        explanation: "COUNTIF menghitung berapa banyak sel dalam rentang yang memenuhi kriteria tertentu."
    },
    {
        question: "Jika VLOOKUP tidak menemukan nilai yang dicari, apa yang dikembalikan?",
        options: ["0", "NULL", "#N/A", "#ERROR"],
        correct: 2,
        explanation: "#N/A menunjukkan bahwa nilai yang dicari tidak ditemukan dalam tabel referensi."
    },
    {
        question: "Fungsi INDEX(A1:D5, 3, 2) akan mengambil nilai dari...",
        options: [
            "Baris 2, Kolom 3",
            "Baris 3, Kolom 2",
            "Sel A3",
            "Sel B5"
        ],
        correct: 1,
        explanation: "INDEX(array, row_num, col_num) mengambil nilai dari baris ke-3 dan kolom ke-2 dalam rentang A1:D5."
    }
];

export const numberConversionQuizQuestions = [
    {
        question: "Berapa nilai desimal dari bilangan biner 1010?",
        options: ["8", "10", "12", "14"],
        correct: 1,
        explanation: "1010₂ = 1×8 + 0×4 + 1×2 + 0×1 = 8 + 0 + 2 + 0 = 10₁₀"
    },
    {
        question: "Bilangan heksadesimal 'A' sama dengan berapa dalam desimal?",
        options: ["9", "10", "11", "12"],
        correct: 1,
        explanation: "Dalam heksadesimal, A=10, B=11, C=12, D=13, E=14, F=15."
    },
    {
        question: "Sistem bilangan oktal menggunakan basis...",
        options: ["2", "8", "10", "16"],
        correct: 1,
        explanation: "Sistem oktal menggunakan basis 8 dengan digit 0-7."
    },
    {
        question: "Konversi desimal 255 ke biner adalah...",
        options: ["10101010", "11111111", "11110000", "10001111"],
        correct: 1,
        explanation: "255 = 128+64+32+16+8+4+2+1 = 11111111₂"
    },
    {
        question: "Warna #FF0000 dalam CSS menunjukkan warna...",
        options: ["Hijau", "Biru", "Merah", "Kuning"],
        correct: 2,
        explanation: "FF0000 = Red:255, Green:0, Blue:0 = Warna merah murni."
    }
];

export const logicGateQuizQuestions = [
    {
        question: "Gerbang logika manakah yang menghasilkan Output 1 (TRUE) hanya jika SEMUA inputnya bernilai 1?",
        options: ["OR", "AND", "XOR", "NAND"],
        correct: 1,
        explanation: "Gerbang AND hanya menghasilkan nilai 1 jika input A DAN input B keduanya 1."
    },
    {
        question: "Gerbang manakah yang memiliki fungsi 'Pembalik' (Inverter)?",
        options: ["AND", "NOT", "OR", "XOR"],
        correct: 1,
        explanation: "Gerbang NOT membalikkan nilai input. Jika 0 menjadi 1, jika 1 menjadi 0."
    },
    {
        question: "Jika Input A=1 dan Input B=1, gerbang manakah yang menghasilkan Output 0?",
        options: ["OR", "AND", "NAND", "XNOR"],
        correct: 2,
        explanation: "NAND adalah NOT-AND. Jika AND menghasilkan 1 (karena 1 & 1), maka NAND membalikannya menjadi 0."
    },
    {
        question: "Gerbang manakah yang menghasilkan Output 1 jika nilai kedua inputnya BERBEDA?",
        options: ["XNOR", "AND", "OR", "XOR"],
        correct: 3,
        explanation: "XOR (Exclusive OR) akan aktif (1) hanya jika salah satu input aktif, tapi tidak keduanya (berbeda)."
    },
    {
        question: "Simbol aljabar untuk gerbang OR adalah...",
        options: ["A • B", "A + B", "A ⊕ B", "A'"],
        correct: 1,
        explanation: "Tanda plus (+) melambangkan operasi logika OR atau penjumlahan boolean."
    }
];

export const excelBasicQuizQuestions = [
    {
        question: "Fungsi apa yang digunakan untuk menjumlahkan sekumpulan data numerik?",
        options: ["AVERAGE", "COUNT", "SUM", "MAX"],
        correct: 2,
        explanation: "SUM digunakan untuk menjumlahkan nilai numerik dalam range sel tertentu."
    },
    {
        question: "Simbol apa yang WAJIB ditulis pertama kali saat membuat formula di Excel?",
        options: ["#", ":", "=", "/"],
        correct: 2,
        explanation: "Setiap formula atau fungsi di Excel harus diawali dengan tanda sama dengan (=)."
    },
    {
        question: "Untuk menghitung nilai rata-rata dari sel A1 sampai A10, rumusnya adalah...",
        options: ["=AVERAGE(A1:A10)", "=MEAN(A1:A10)", "=AVG(A1:A10)", "=SUM(A1:A10)/10"],
        correct: 0,
        explanation: "Fungsi AVERAGE digunakan untuk menghitung rata-rata aritmatika dari argumen yang diberikan."
    },
    {
        question: "Fungsi MAX berguna untuk...",
        options: ["Menghitung jumlah data", "Mencari nilai tertinggi", "Mencari nilai terendah", "Membulatkan angka"],
        correct: 1,
        explanation: "MAX digunakan untuk menemukan nilai numerik terbesar (maksimum) dalam sekumpulan data."
    },
    {
        question: "Jika sel A1=10 dan A2=20, maka hasil =IF(A1>A2, 'Ya', 'Tidak') adalah...",
        options: ["Ya", "Tidak", "Error", "0"],
        correct: 1,
        explanation: "Karena 10 tidak lebih besar dari 20, kondisi bernilai FALSE, sehingga fungsi mengembalikan 'Tidak'."
    }
];

export const excelTextQuizQuestions = [
    {
        question: "Fungsi =LEFT('INFORMATIKA', 4) akan menghasilkan...",
        options: ["INFO", "ORMA", "TIKA", "ATIKA"],
        correct: 0,
        explanation: "LEFT mengambil jumlah karakter tertentu dari sisi kiri teks. 4 karakter pertama dari INFORMATIKA adalah INFO."
    },
    {
        question: "Untuk mengambil 3 karakter terakhir dari teks di sel A1, gunakan fungsi...",
        options: ["=LEFT(A1, 3)", "=MID(A1, 3)", "=RIGHT(A1, 3)", "=END(A1, 3)"],
        correct: 2,
        explanation: "RIGHT digunakan untuk mengambil karakter dari sisi kanan (akhir) teks."
    },
    {
        question: "Fungsi LEN('Halo Dunia') akan menghasilkan angka...",
        options: ["9", "10", "11", "8"],
        correct: 1,
        explanation: "LEN menghitung jumlah karakter TERMASUK spasi. 'Halo' (4) + spasi (1) + 'Dunia' (5) = 10."
    },
    {
        question: "Fungsi MID membutuhkan berapa argumen utama?",
        options: ["1 (Teks)", "2 (Teks, Jumlah)", "3 (Teks, Start, Jumlah)", "4"],
        correct: 2,
        explanation: "MID membutuhkan 3 argumen: Teks sumber, Posisi awal (Start), dan Jumlah karakter yang diambil."
    },
    {
        question: "Jika A1='DATA', hasil =CONCATENATE('BIG', ' ', A1) adalah...",
        options: ["BIGDATA", "BIG DATA", "DATABIG", "Error"],
        correct: 1,
        explanation: "CONCATENATE menggabungkan teks. Di sini ada spasi di tengah, jadi hasilnya 'BIG DATA'."
    }
];

export const excelChartQuizQuestions = [
    {
        question: "Grafik mana yang paling cocok untuk melihat tren kenaikan/penurunan data dari waktu ke waktu?",
        options: ["Pie Chart", "Bar Chart", "Line Chart", "Scatter Plot"],
        correct: 2,
        explanation: "Line Chart (Grafik Garis) paling efektif untuk menunjukkan perubahan data berkelanjutan sepanjang waktu (tren)."
    },
    {
        question: "Sumbu horizontal pada grafik batang biasanya disebut...",
        options: ["X-Axis", "Y-Axis", "Legend", "Title"],
        correct: 0,
        explanation: "Sumbu X (horizontal) biasanya untuk kategori, sedangkan Sumbu Y (vertikal) untuk nilai."
    },
    {
        question: "Apa fungsi Legend (Legenda) pada grafik?",
        options: ["Memberi judul grafik", "Menjelaskan arti warna/simbol data", "Mengatur skala sumbu", "Menampilkan tabel data"],
        correct: 1,
        explanation: "Legenda membantu pembaca mengidentifikasi seri data yang berbeda berdasarkan warna atau pola."
    },
    {
        question: "Pie Chart (Diagram Lingkaran) paling baik digunakan untuk...",
        options: ["Membandingkan banyak kategori", "Melihat proporsi/persentase dari total", "Data dengan nilai negatif", "Data waktu"],
        correct: 1,
        explanation: "Pie Chart menunjukkan bagaimana bagian-bagian berkontribusi terhadap keseluruhan (persentase)."
    },
    {
        question: "Bagian grafik yang berisi judul utama disebut...",
        options: ["Axis Title", "Chart Title", "Data Label", "Gridlines"],
        correct: 1,
        explanation: "Chart Title adalah teks utama di atas grafik yang menjelaskan tentang apa grafik tersebut."
    }
];

export const explorerQuizQuestions = [
    {
        question: "Shortcut keyboard untuk menyalin (Copy) file adalah...",
        options: ["Ctrl + X", "Ctrl + V", "Ctrl + C", "Ctrl + Z"],
        correct: 2,
        explanation: "Ctrl + C menyalin item terpilih ke clipboard."
    },
    {
        question: "Apa fungsi dari 'Cut' (Potong) pada file?",
        options: ["Menghapus file permanen", "Memindahkan file (setelah Paste)", "Menyalin file", "Mengganti nama file"],
        correct: 1,
        explanation: "Cut digunakan untuk memindahkan file. File asli akan hilang dari lokasi lama setelah di-Paste di lokasi baru."
    },
    {
        question: "Ekstensi file .docx biasanya digunakan untuk...",
        options: ["Gambar", "Video", "Dokumen Word", "Aplikasi"],
        correct: 2,
        explanation: ".docx adalah format standar untuk dokumen Microsoft Word."
    },
    {
        question: "Apa itu Root Directory?",
        options: ["Folder pengguna", "Tempat sampah (Recycle Bin)", "Direktori paling atas (utama) dalam drive", "Folder Windows"],
        correct: 2,
        explanation: "Root directory (misal C:\) adalah titik awal dari struktur file sistem hirarki."
    },
    {
        question: "Untuk mengubah nama file/folder, kita menggunakan opsi...",
        options: ["Delete", "Properties", "Rename", "New Folder"],
        correct: 2,
        explanation: "Rename digunakan untuk mengganti nama file atau folder."
    }
];

export const cpuQuizQuestions = [
    {
        question: "Bagian CPU yang bertugas melakukan operasi aritmatika (tambah, kurang) logika adalah...",
        options: ["CU (Control Unit)", "ALU (Arithmetic Logic Unit)", "Register", "Cache"],
        correct: 1,
        explanation: "ALU (Arithmetic Logic Unit) adalah sirkuit digital yang melakukan operasi aritmatika dan logika bitwise."
    },
    {
        question: "Siklus dasar pemrosesan instruksi CPU adalah...",
        options: ["Fetch - Decode - Execute", "Input - Process - Output", "Read - Write - Save", "Start - Run - Stop"],
        correct: 0,
        explanation: "CPU mengambil instruksi (Fetch), menerjemahkannya (Decode), lalu menjalankannya (Execute)."
    },
    {
        question: "Memori kecil berkecepatan sangat tinggi yang ada di dalam CPU disebut...",
        options: ["HDD", "RAM", "Register", "SSD"],
        correct: 2,
        explanation: "Register adalah memori tercepat di komputer, terletak langsung di dalam prosesor untuk menyimpan data sementara saat operasi."
    },
    {
        question: "Apa fungsi Control Unit (CU)?",
        options: ["Menyimpan data permanen", "Mengatur lalu lintas data & decoding instruksi", "Melakukan perhitungan matematika", "Mendinginkan CPU"],
        correct: 1,
        explanation: "Control Unit bertugas mengarahkan operasi prosesor, memberitahu memori dan ALU bagaimana merespons instruksi."
    },
    {
        question: "Kecepatan CPU biasanya diukur dalam satuan...",
        options: ["Byte", "Hertz (Hz)", "Pixel", "Bit"],
        correct: 1,
        explanation: "Clock speed CPU diukur dalam Hertz (biasanya GigaHertz/GHz), yang menunjukkan berapa banyak siklus yang bisa dilakukan per detik."
    }
];

export const memoryQuizQuestions = [
    {
        question: "Memori utama yang bersifat Volatile (data hilang saat listrik mati) adalah...",
        options: ["ROM", "Hard Disk", "RAM", "Flashdisk"],
        correct: 2,
        explanation: "RAM (Random Access Memory) adalah memori volatile yang digunakan untuk menyimpan data program yang sedang berjalan."
    },
    {
        question: "Dalam sistem bilangan heksadesimal, digit terbesar adalah...",
        options: ["9", "10", "F (15)", "G (16)"],
        correct: 2,
        explanation: "Heksadesimal menggunakan 16 simbol: 0-9 dan A-F, dimana F bernilai 15."
    },
    {
        question: "Apa fungsi Cache Memory?",
        options: ["Menyimpan data permanen", "Mempercepat akses data antara CPU dan RAM", "Mendinginkan RAM", "Menambah kapasitas penyimpanan"],
        correct: 1,
        explanation: "Cache menyimpan salinan data yang sering diakses dari memori utama untuk mempercepat akses oleh CPU."
    },
    {
        question: "Satuan 1 Kilobyte (KB) setara dengan...",
        options: ["1000 Byte", "1024 Byte", "8 Bit", "1024 Bit"],
        correct: 1,
        explanation: "Dalam komputasi biner, 1 KB = 2^10 Byte = 1024 Byte."
    },
    {
        question: "Proses 'Write Allocate' pada Cache terjadi saat...",
        options: ["CPU membaca data", "Data tidak ditemukan di Cache (Miss) saat menulis", "Data sudah ada di Cache", "Cache penuh"],
        correct: 1,
        explanation: "Pada Write Allocate, jika terjadi Cache Miss saat menulis, blok data akan dimuat dari RAM ke Cache terlebih dahulu, baru ditulisi."
    }
];

export default QuizMode;
