import { Head, Link } from '@inertiajs/react';
import { LogIn, UserX } from 'lucide-react';

import { login } from '@/routes';

export default function Inactive() {
    return (
        <>
            <Head title="Account inactive" />

            <main className="flex min-h-screen w-screen items-center justify-center bg-muted/20 px-4 py-10">
                <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-xs">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <UserX className="h-8 w-8" />
                    </span>

                    <h1 className="mt-6 text-xl font-semibold text-foreground">
                        Your account is inactive
                    </h1>

                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                        Your account has not been activated yet, or it was
                        deactivated. Ask an administrator to turn it on so you
                        can access your pharmacy branches.
                    </p>

                    <Link
                        href={login()}
                        className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        <LogIn className="h-4 w-4" />
                        Try logging in again
                    </Link>
                </div>
            </main>
        </>
    );
}
