"use client"
import React from 'react';
import {SessionProvider} from 'next-auth/react';
import Providers from "@/redux/provider";

const Provider = ({children}: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <Providers>
                {children}
            </Providers>
        </SessionProvider>
    );
};

export default Provider;
