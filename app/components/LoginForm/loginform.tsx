'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import { authenticate } from '../../../lib/actions';
import { LoginButtonPT } from '@/lib/primereactPtClasses';

export default function LoginForm({ onClick }: { onClick: () => void }) {
    const router = useRouter();
    const [errorMessage, formAction, isPending] = useActionState(
        async (prevState, formData) => {
            const result = await authenticate(prevState, formData);
            // empty response indicates successful login
            if (!result) {
                router.push('/');
            }
            return result; // Return error message
        },
        undefined,
    );

    return (
        <div className="max-w-lg w-full">
            <div
                style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="dark:bg-zinc-900 rounded-2xl overflow-hidden dark:border-neutral-800"
            >
                <div className="p-8 pt-0">
                    <div className='flex justify-center my-6'>
                        <div
                            style={{
                                width: '90px',
                                height: '90px',
                                borderRadius: '90px',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                className="self-center object-cover object-center"
                                src="logo.svg"
                                width={130}
                                height={130}
                                alt="Memoir Map Logo"
                                style={{
                                    borderRadius: '90px',
                                    transform: "translate(2px)",
                                }}
                            />
                        </div>
                    </div>
                    <h2 className="text-center text-3xl text-zinc-100">
                        Memoir Map
                    </h2>
                    <form action={formAction} className="mt-8 space-y-6">
                        <div className="rounded-md shadow-sm">
                            <div>
                                <label className="sr-only" htmlFor="username">Username</label>
                                <input
                                    placeholder="Username"
                                    className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    required
                                    autoComplete="username"
                                    type="username"
                                    name="username"
                                    id="username"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="sr-only" htmlFor="password">Password</label>
                                <input
                                    placeholder="Password"
                                    className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    required
                                    autoComplete="current-password"
                                    type="password"
                                    name="password"
                                    id="password"
                                />
                            </div>
                            <div className='text-center mt-3'>
                                {(errorMessage) && (
                                    <>
                                        <p className="text-sm text-red-500">{errorMessage}</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <Button
                                className="sign-in group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 px-4 py-2 w-full relative transition-all duration-300 h-12 dark:bg-zinc-100 dark:hover:bg-zinc-300 dark:text-zinc-900 shadow-[0_1px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_1px_20px_rgba(0,0,0,0.15)] font-semibold text-sm"
                                type="submit"
                                aria-disabled={isPending}
                                loading={isPending}
                                pt={LoginButtonPT}
                            >
                                Sign In
                            </Button>
                        </div>
                    </form>
                    <div className="flex items-center justify-between uppercase gap-4 mt-6">
                        <span className="block w-full h-px bg-zinc-400"></span>
                        <span className='dark:text-zinc-400'>OR</span>
                        <span className="block w-full h-px bg-zinc-400"></span>
                    </div>
                    <form action={formAction} className='mt-5'>
                        <input
                            placeholder="Username"
                            className="hidden"
                            readOnly
                            type="username"
                            value="Guest"
                            name="username"
                        />
                        <Button
                            className="sign-in-guest font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 px-4 py-2 w-full relative transition-all duration-300 h-12 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 border dark:border-zinc-800 dark:hover:border-zinc-700 shadow-sm hover:shadow-md text-sm"
                            type="submit"
                            aria-disabled={isPending}
                            loading={isPending}
                            pt={LoginButtonPT}
                        >
                            Login as Guest
                        </Button>
                    </form>
                </div>

                <div className="px-8 py-6 text-center  dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 ">
                    <div className='flex justify-center gap-x-9'>
                        <a href='https://github.com/RayMathew/travel-history-viewer' target='_blank'>
                            <Image
                                src="/github.svg"
                                alt="Link to GitHub project"
                                width={35}
                                height={35}
                                className={``}
                            />
                        </a>
                        <a href='https://medium.com/towardsdev/building-an-api-with-go-postgresql-google-cloud-and-cockroachdb-78d78938c5db' target='_blank'>
                            <Image
                                src="/medium.svg"
                                alt="Link to medium article"
                                width={35}
                                height={35}
                                className={``}
                            />
                        </a>
                        <i className=" pi pi-question-circle text-slate-300 !leading-9 !text-xs !font-thin cursor-pointer" onClick={onClick} />
                    </div>
                </div>
            </div>
        </div>
    );
}