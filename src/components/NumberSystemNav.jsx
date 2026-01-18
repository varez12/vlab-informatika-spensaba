import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Binary, Hash, Sliders, Cpu } from 'lucide-react';

const NumberSystemNav = ({ activePage }) => {
    const navigate = useNavigate();

    const tabs = [
        { id: 'biner', label: 'Biner (Basis 2)', path: '/biner', icon: Binary, activeClass: 'border-indigo-500 text-indigo-600', iconClass: 'text-indigo-500' },
        { id: 'oktal', label: 'Oktal (Basis 8)', path: '/oktal', icon: Hash, activeClass: 'border-orange-500 text-orange-600', iconClass: 'text-orange-500' },
        { id: 'heksadesimal', label: 'Heksadesimal (Basis 16)', path: '/heksadesimal', icon: Cpu, activeClass: 'border-blue-500 text-blue-600', iconClass: 'text-blue-500' },
    ];

    return (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm flex-none">
            <div className="max-w-7xl mx-auto px-4">
                <nav className="flex space-x-2 md:space-x-8 overflow-x-auto no-scrollbar items-center h-14" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activePage === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => navigate(tab.path)}
                                className={`
                                    group inline-flex items-center gap-2 px-1 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap h-full
                                    ${isActive
                                        ? tab.activeClass
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                                `}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-slate-100' : 'bg-transparent group-hover:bg-slate-50'}`}>
                                    <Icon size={18} className={isActive ? tab.iconClass : 'text-slate-400 group-hover:text-slate-600'} />
                                </div>
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default NumberSystemNav;
