"use client";

import React from 'react';
import { Button } from "@/components/ui/button";

interface ReviewErrorStateProps {
    onRetry?: () => void;
}

const ReviewErrorState: React.FC<ReviewErrorStateProps> = ({ onRetry }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
            <div className="max-w-md mx-auto px-4 w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-10 h-10 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Something Went Wrong
                        </h1>
                        <p className="text-gray-600">
                            We encountered an error while processing your request. Please try again later.
                        </p>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600">
                            If this problem persists, please contact support for assistance.
                        </p>
                    </div>

                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                        >
                            Try Again
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewErrorState;
