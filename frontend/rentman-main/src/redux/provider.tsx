"use client"

import React from 'react';
import {Provider} from "react-redux";
import store, {persistor} from "@/redux/store";
import {PersistGate} from 'redux-persist/integration/react';
import { Toaster } from "@/components/ui/toaster"

const Providers = ({children}: { children: React.ReactNode }) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
                <Toaster />
            </PersistGate>
        </Provider>
    )
};

export default Providers;
