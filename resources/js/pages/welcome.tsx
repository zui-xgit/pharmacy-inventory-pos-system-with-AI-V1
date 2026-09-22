import { Head, Link, usePage } from '@inertiajs/react';
import {
    Pill,
    ShieldCheck,
    LayoutDashboard,
    Database,
    Store,
    Activity,
    ShoppingBag,
    Layers,
} from 'lucide-react';
import { login, register } from '@/routes';
import owner from '@/routes/owner';
import type { Auth } from '@/types';
import type { RouteDefinition } from '@/wayfinder';
import current_shop from '@/routes/current_shop';

export default function Welcome() {
    const { activeShop, auth } = usePage<{
        activeShop: { uuid: string } | undefined;
        auth: Auth;
    }>().props;

    let dashboardHref: RouteDefinition<'get'> =
        '#' as unknown as RouteDefinition<'get'>;

    if (auth.user) {
        if (auth.user.isOwner) {
            dashboardHref = owner.shops();
        } else if (auth.user.isManagerOrCashier && activeShop !== undefined) {
            dashboardHref = current_shop.overview({ shop: activeShop.uuid });
        }
    }

    return (
        <>
            <Head title="Pharmacy Operations Hub" />
            <div className="text-slate-850 relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#f8fafc] font-sans dark:bg-[#070a0e] dark:text-slate-100">
                {/* Background decorative glows */}
                <div className="pointer-events-none absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/5" />
                <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[120px] dark:bg-teal-500/5" />

                {/* Header */}
                <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between border-b border-slate-200/50 px-6 py-5 dark:border-slate-800/40">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 text-white shadow-md shadow-emerald-500/20">
                            <Pill className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-slate-905 flex items-center gap-1.5 text-lg font-bold tracking-tight dark:text-white">
                                RxPOS
                            </span>
                            <span className="block text-[10px] font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Multi-Pharmacy Hub
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboardHref}
                                className="hover:bg-emerald-505 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/10 transition-all dark:shadow-emerald-600/5"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Go to Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/60"
                                >
                                    Register Outlet
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Main Content */}
                <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 py-12 md:py-20 lg:grid-cols-12 lg:gap-16">
                    {/* Left Column: Core Portal Controls & Info */}
                    <div className="flex flex-col space-y-8 lg:col-span-7">
                        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Authorized Personnel Terminal</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl leading-none font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white">
                                Centralized <br className="hidden md:block" />
                                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                    Multi-Store Pharmacy
                                </span>{' '}
                                <br />
                                Management & POS
                            </h1>
                            <p className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
                                Seamlessly manage dispensing, monitor real-time
                                stock levels, coordinate inter-branch transfers,
                                and access consolidated sales metrics across all
                                pharmacy outlets.
                            </p>
                        </div>

                        {/* Feature Blocks */}
                        <div className="grid max-w-2xl gap-6 sm:grid-cols-1">
                            <div className="group flex gap-4">
                                <div className="h-fit flex-none rounded-xl border border-slate-100 bg-white p-3 text-emerald-600 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-slate-800/80 dark:bg-slate-900 dark:text-emerald-400">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 md:text-base dark:text-slate-100">
                                        Point of Sale & Dispensing
                                    </h3>
                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500 md:mt-1 md:text-sm dark:text-slate-400">
                                        Dispense prescriptions with real-time
                                        stock deductions, handle batch and drug
                                        category filters, and print receipts.
                                    </p>
                                </div>
                            </div>

                            <div className="group flex gap-4">
                                <div className="h-fit flex-none rounded-xl border border-slate-100 bg-white p-3 text-emerald-600 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-slate-800/80 dark:bg-slate-900 dark:text-emerald-400">
                                    <Database className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 md:text-base dark:text-slate-100">
                                        Cross-Branch Inventory Sync
                                    </h3>
                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500 md:mt-1 md:text-sm dark:text-slate-400">
                                        Track item quantities, batch numbers,
                                        supplier log records, expiry dates, and
                                        execute cross-outlet inventory
                                        allocations.
                                    </p>
                                </div>
                            </div>

                            <div className="group flex gap-4">
                                <div className="h-fit flex-none rounded-xl border border-slate-100 bg-white p-3 text-emerald-600 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-slate-800/80 dark:bg-slate-900 dark:text-emerald-400">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 md:text-base dark:text-slate-100">
                                        Unified Reporting & Compliance
                                    </h3>
                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500 md:mt-1 md:text-sm dark:text-slate-400">
                                        Monitor operator transaction audits,
                                        sales statistics, low stock warnings,
                                        and filter results by specific pharmacy
                                        branches.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Branch Live Monitor Mockup */}
                    <div className="relative lg:col-span-5">
                        {/* Decorative gradient blur */}
                        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl dark:opacity-10" />

                        <div className="relative rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/60">
                            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                    </span>
                                    <h3 className="font-mono text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                        Active Outlets Monitor
                                    </h3>
                                </div>
                                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                    SYNC ACTIVE
                                </span>
                            </div>

                            {/* Live branches */}
                            <div className="space-y-3.5">
                                {[
                                    {
                                        name: 'Apex Pharmacy - Main Branch',
                                        location: 'Medical Center Plaza',
                                        sales: '$6,420.50',
                                        stock: '14,230 items',
                                        status: 'Online',
                                        registers: '4 Live',
                                    },
                                    {
                                        name: 'Apex Pharmacy - Downtown',
                                        location: 'Commercial Ave, Floor 1',
                                        sales: '$3,890.10',
                                        stock: '8,410 items',
                                        status: 'Online',
                                        registers: '2 Live',
                                    },
                                    {
                                        name: 'Apex Pharmacy - Westside District',
                                        location: 'West Clinic District',
                                        sales: '$4,120.00',
                                        stock: '7,890 items',
                                        status: 'Online',
                                        registers: '3 Live',
                                    },
                                ].map((branch, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all duration-300 hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/80"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-slate-850 text-xs font-bold md:text-sm dark:text-slate-200">
                                                    {branch.name}
                                                </h4>
                                                <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                                                    {branch.location}
                                                </p>
                                            </div>
                                            <span className="flex items-center gap-1.5 rounded border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                                {branch.status}
                                            </span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100/50 pt-3 font-mono text-[10px] text-slate-500 dark:border-slate-800/30 dark:text-slate-400">
                                            <div>
                                                <span className="block text-[8px] tracking-wider text-slate-400 uppercase">
                                                    Today's Sales
                                                </span>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                                    {branch.sales}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[8px] tracking-wider text-slate-400 uppercase">
                                                    Stock Level
                                                </span>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                                    {branch.stock}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[8px] tracking-wider text-slate-400 uppercase">
                                                    Terminals
                                                </span>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                                    {branch.registers}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Consolidated Mini Stats */}
                            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                                <div className="grid grid-cols-2 gap-3.5">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                                        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                                            <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
                                                Active Outlets
                                            </span>
                                            <Store className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="mt-1 block text-lg font-bold text-slate-800 dark:text-slate-100">
                                            9 Stores
                                        </span>
                                        <span className="font-mono text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                                            Online Terminals
                                        </span>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                                        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                                            <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
                                                Total Sales
                                            </span>
                                            <Activity className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="mt-1 block text-lg font-bold text-slate-800 dark:text-slate-100">
                                            $14,430.60
                                        </span>
                                        <span className="font-mono text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                                            Combined Today
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-200/50 px-6 py-6 text-xs text-slate-400 sm:flex-row dark:border-slate-800/40 dark:text-slate-500">
                    <p>
                        © {new Date().getFullYear()} RxPOS Multi-Pharmacy
                        Network. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5 font-mono text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                            Secure Session SSL Encrypted
                        </span>
                        <span className="transition-colors hover:text-slate-600 dark:hover:text-slate-400">
                            Authorized Personnel Only
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
