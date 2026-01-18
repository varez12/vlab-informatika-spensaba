import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileSpreadsheet,
    FileText,
    Gamepad2,
    Monitor,
    ArrowRight,
    Activity,
    Calculator,
    Cpu,
    FolderOpen,
    Zap,
    Scissors,
    Code2,
    Search,
    Trophy,
    Clock,
    ChevronRight,
    LayoutGrid,
    Hash,
    Box
} from 'lucide-react';
import { getProgress, getModuleProgress } from '../utils/progress';

const ModuleCard = ({ to, title, description, icon: Icon, color, progress }) => (
    <Link
        to={to}
        className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`${title}: ${description}`}
    >
        <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${color} opacity-10 rounded-bl-[80px] -mr-8 -mt-8 transition-transform group-hover:scale-110`} aria-hidden="true" />

        {/* Progress Badge */}
        {progress > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                <Trophy size={10} />
                {progress}
            </div>
        )}

        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-110 transition-transform`} aria-hidden="true">
            <Icon size={22} aria-hidden="true" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-1.5 group-hover:text-blue-600 transition-colors leading-tight">
            {title}
        </h3>

        <p className="text-slate-600 text-xs leading-relaxed mb-4 flex-grow">
            {description}
        </p>

        <div className="flex items-center text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-all" aria-hidden="true">
            Buka Modul <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-all" />
        </div>
    </Link>
);

const CategoryHeader = ({ icon: Icon, title, count, color }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md`}>
            <Icon size={20} />
        </div>
        <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <p className="text-xs text-slate-500">{count} modul tersedia</p>
        </div>
    </div>
);

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [totalProgress, setTotalProgress] = useState(0);

    // Load progress on mount
    useEffect(() => {
        const progress = getProgress();
        let total = 0;
        Object.values(progress).forEach(mod => {
            if (mod.completed) total += mod.completed.length;
            if (mod.simulationsRun) total += mod.simulationsRun;
        });
        setTotalProgress(total);
    }, []);

    // Get progress for specific modules
    const getModProgress = (moduleId) => {
        const prog = getModuleProgress(moduleId);
        return prog.completed?.length || prog.simulationsRun || 0;
    };

    const categories = [
        {
            id: 'office',
            title: 'Aplikasi Perkantoran',
            icon: FileSpreadsheet,
            color: 'from-green-500 to-emerald-600',
            modules: [
                {
                    to: "/excel",
                    title: "Excel Lookup",
                    description: "VLOOKUP, HLOOKUP, MATCH, INDEX, dan fungsi statistik COUNTIF, SUMIF.",
                    icon: FileSpreadsheet,
                    color: "from-green-500 to-emerald-600",
                    moduleId: "excel"
                },
                {
                    to: "/excel-basic",
                    title: "Excel Dasar",
                    description: "Fungsi SUM, AVERAGE, COUNT, MAX, MIN untuk kalkulasi data.",
                    icon: FileSpreadsheet,
                    color: "from-green-500 to-emerald-600",
                    moduleId: "excel-basic"
                },
                {
                    to: "/excel-text",
                    title: "Excel Teks",
                    description: "Manipulasi teks dengan LEFT, RIGHT, MID, LEN, UPPER, LOWER.",
                    icon: FileSpreadsheet,
                    color: "from-green-500 to-emerald-600",
                    moduleId: "excel-text"
                },
                {
                    to: "/mailmerge",
                    title: "Mail Merge",
                    description: "Surat massal dengan data source dan field placeholder.",
                    icon: FileText,
                    color: "from-blue-500 to-indigo-600",
                    moduleId: "mailmerge"
                },
                {
                    to: "/integrasi-office",
                    title: "Integrasi Office",
                    description: "Simulasi Cut, Copy, Paste antar aplikasi Word dan Excel.",
                    icon: Scissors,
                    color: "from-cyan-500 to-teal-600",
                    moduleId: "integrasi"
                },
            ]
        },
        {
            id: 'number',
            title: 'Sistem Bilangan',
            icon: Hash,
            color: 'from-rose-500 to-red-600',
            modules: [
                {
                    to: "/biner",
                    title: "Biner (Base 2)",
                    description: "Konversi desimal ke biner dan sebaliknya dengan penjelasan langkah.",
                    icon: Calculator,
                    color: "from-rose-500 to-red-600",
                    moduleId: "biner"
                },
                {
                    to: "/oktal",
                    title: "Oktal (Base 8)",
                    description: "Konversi desimal ke oktal dengan visualisasi pembagian.",
                    icon: Calculator,
                    color: "from-amber-500 to-orange-600",
                    moduleId: "oktal"
                },
                {
                    to: "/heksadesimal",
                    title: "Heksadesimal (Base 16)",
                    description: "Konversi ke heksadesimal untuk pemrograman dan warna.",
                    icon: Calculator,
                    color: "from-violet-500 to-purple-600",
                    moduleId: "heksadesimal"
                },
            ]
        },
        {
            id: 'system',
            title: 'Sistem Komputer',
            icon: Cpu,
            color: 'from-purple-500 to-pink-600',
            modules: [
                {
                    to: "/hardware",
                    title: "Hardware 3D",
                    description: "Jelajahi CPU, RAM, SSD, VGA, Motherboard dalam tampilan 3D.",
                    icon: Monitor,
                    color: "from-purple-500 to-pink-600",
                    moduleId: "hardware"
                },
                {
                    to: "/pemrosesan-data",
                    title: "CPU Simulation",
                    description: "Visualisasi proses Input → Process → Output di CPU.",
                    icon: Code2,
                    color: "from-slate-500 to-gray-700",
                    moduleId: "cpu"
                },
                {
                    to: "/explorer",
                    title: "File Explorer",
                    description: "Simulasi Windows Explorer: kelola file, folder, copy, paste.",
                    icon: FolderOpen,
                    color: "from-amber-500 to-orange-600",
                    moduleId: "explorer"
                },
                {
                    to: "/gerbang-logika",
                    title: "Gerbang Logika",
                    description: "AND, OR, NOT, XOR, NAND, NOR dengan truth table interaktif.",
                    icon: Zap,
                    color: "from-sky-500 to-blue-600",
                    moduleId: "gerbang"
                },
            ]
        },
        {
            id: 'programming',
            title: 'Logika & Pemrograman',
            icon: Box,
            color: 'from-indigo-500 to-violet-600',
            modules: [
                {
                    to: "/blockly",
                    title: "Blockly IoT",
                    description: "Pemrograman visual untuk mengontrol LED dan Buzzer.",
                    icon: Cpu,
                    color: "from-indigo-500 to-violet-600",
                    moduleId: "blockly"
                },
                {
                    to: "/blockly-maze",
                    title: "Blockly Game",
                    description: "Game labirin untuk belajar logika loop dan kondisi.",
                    icon: Gamepad2,
                    color: "from-orange-500 to-red-600",
                    moduleId: "maze"
                },
            ]
        }
    ];

    // Filter modules based on search
    const filteredCategories = categories.map(cat => ({
        ...cat,
        modules: cat.modules.filter(mod =>
            mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mod.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.modules.length > 0);

    return (
        <div className="h-[calc(100vh-4rem)] bg-[#f8fafc] overflow-y-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white pt-8 pb-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-3">
                        <Activity size={12} className="text-green-400" /> V-Lab Informatika v1.0
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black mb-3 tracking-tight leading-tight">
                        Laboratorium Virtual{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-300">
                            Informatika SMP
                        </span>
                    </h1>
                    <p className="text-sm text-blue-100 max-w-xl mx-auto mb-6">
                        Platform pembelajaran interaktif untuk menguasai Aplikasi Perkantoran, Sistem Bilangan, dan Pemrograman.
                    </p>

                    {/* Search Box */}
                    <div className="max-w-md mx-auto relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari modul... (contoh: vlookup, biner, hardware)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/95 text-slate-700 text-sm placeholder-slate-400 border-0 shadow-lg focus:ring-4 focus:ring-blue-500/30 outline-none"
                        />
                    </div>

                    {/* Quick Stats */}
                    {totalProgress > 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-xs">
                            <Trophy size={14} className="text-amber-400" />
                            <span>Aktivitas: <strong>{totalProgress}</strong> simulasi dijalankan</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Categories & Modules */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 relative z-20 pb-12">
                {filteredCategories.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <Search size={48} className="text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-600 mb-2">Tidak ditemukan</h3>
                        <p className="text-sm text-slate-500">Coba kata kunci lain seperti "excel", "biner", atau "blockly"</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {filteredCategories.map((category) => (
                            <div key={category.id} className="bg-white rounded-2xl shadow-lg p-6">
                                <CategoryHeader
                                    icon={category.icon}
                                    title={category.title}
                                    count={category.modules.length}
                                    color={category.color}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {category.modules.map((mod, idx) => (
                                        <ModuleCard
                                            key={idx}
                                            {...mod}
                                            progress={getModProgress(mod.moduleId)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="max-w-7xl mx-auto px-6 pb-8 text-center">
                <p className="text-slate-400 text-xs">
                    &copy; 2026 SMP Negeri 1 Baturetno - V-Lab Informatika
                </p>
            </div>
        </div>
    );
};

export default Home;
