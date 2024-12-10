'use client';

import { Button } from 'primereact/button';
import { useActionState } from 'react';
import { authenticate } from '../../../lib/actions';

export default function LoginForm() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined,
    );

    return (
        <div className="max-w-lg w-full">
            <div
                style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="bg-gray-800 rounded-lg shadow-xl overflow-hidden"
            >
                <div className="p-8 pt-0">
                    <div className='flex justify-center my-6'>
                        <div style={{
                            width: '90px',
                            height: '90px',
                            overflow: 'hidden',
                            borderRadius: '90px'
                        }}>
                            <img
                                className="self-center object-cover object-center"
                                src="logo.svg"
                                width={130}
                                height={130}
                                alt="Logo"
                                style={{
                                    borderRadius: '90px',
                                    transform: "translate(2px)",
                                }}
                            />
                        </div>
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-white">
                        Memoir Map
                    </h2>
                    {/* <p className="mt-4 text-center text-gray-400">But first, prove you&apos;re my wife.</p> */}
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
                                className="group relative w-full flex justify-center py-3 px-4 cursor-pointer text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-200 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                type="submit"
                                aria-disabled={isPending}
                                loading={isPending}
                                pt={{
                                    loadingIcon: {
                                        className: 'mr-1'
                                    }
                                }}
                            >
                                Sign In
                            </Button>
                        </div>
                    </form>
                    <div className="flex items-center justify-between uppercase gap-4 mt-6">
                        <span className="block w-full h-px bg-slate-400"></span>
                        <span className='text-slate-400'>OR</span>
                        <span className="block w-full h-px bg-slate-400"></span>
                    </div>
                </div>

                <div className="px-8 py-4 bg-gray-700 text-center">
                    <form action={formAction}>
                        <input
                            placeholder="Username"
                            className="hidden"
                            readOnly
                            type="username"
                            value="Guest"
                            name="username"
                        />
                        <Button
                            className="font-medium text-blue-500 hover:text-blue-400"
                            type="submit"
                            aria-disabled={isPending}
                            loading={isPending}
                            pt={{
                                loadingIcon: {
                                    className: 'mr-1'
                                }
                            }}
                        >
                            Login as Guest
                        </Button>
                    </form>
                </div>
            </div>
        </div>);
}