"use client"

import React from 'react'

const AlreadyFilledPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
            <div className="max-w-md mx-auto px-4 w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-10 h-10 text-amber-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Form Already Submitted
                        </h1>
                        <p className="text-gray-600">
                            This review form has already been filled and submitted. Thank you for your participation.
                        </p>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600">
                            If you believe this is an error or need to make changes, please contact the administrator.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AlreadyFilledPage
