"use client"
import React, {useState} from 'react';
import {ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {cn} from "@/lib/utils";
import SideMenuComponent from "@/components/sidebar/side-menu.component";
import SlideMenuComponent from "@/components/sidebar/slide-menu.component";
import {IconsComponent} from "@/components/common/icons.component";
import {FiLogOut} from "react-icons/fi";
import {Button} from "@/components/ui/button";
import {redirect, usePathname} from "next/navigation";
import {signOut, useSession} from "next-auth/react";
import UserAvatarSidebarComponent from "@/components/sidebar/user-avatar-sidebar.component";
import { PlanningFinanceTabs } from "@/components/navigation/planning-finance-tabs";
import { FinanceLayoutShell } from "@/components/layout/finance-layout-shell";

export default function AuthLayout({children}: { children: React.ReactNode }) {
    const path = usePathname()
    const isFinance = path?.startsWith('/finance') ?? false;
    const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
    const [loadingLogout, setLoadingLogout] = useState<boolean>(false);
    const {data: session, status} = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/')
        },
    })

    if (status === 'loading' || !session) {
        return (
            <div className={'h-screen flex items-center justify-center'}>
                <IconsComponent.spinner className="mr-2 h-6 w-6 mb-1 animate-spin"/><p>Laden</p>
            </div>
        )
    }

    const handleLogout = () => {
        setLoadingLogout(true);
        signOut().then(null);
    };

    if (isFinance) {
        return (
            <FinanceLayoutShell
                loadingLogout={loadingLogout}
                onLogout={handleLogout}
            >
                {children}
            </FinanceLayoutShell>
        );
    }

    return (
        <div className='flex w-full h-screen'>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    setIsCollapsed(sizes[0] <= 6.2)
                }}
                className="h-full"
            >
                <ResizablePanel
                    defaultSize={2}
                    minSize={2}
                    maxSize={20}
                    className={cn(isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out", "bg-black py-7 hidden md:flex flex-col items-center justify-between px-4")}
                >
                    <UserAvatarSidebarComponent isCollapsed={isCollapsed}/>
                    <SideMenuComponent isCollapsed={isCollapsed}/>
                    <Button onClick={handleLogout} disabled={loadingLogout}
                            className={isCollapsed ? 'h-9 w-9 ' : 'w-full gap-2'}
                            size={isCollapsed ? "icon" : 'default'}>
                        {loadingLogout ? <IconsComponent.spinner className="h-4 w-4 animate-spin"/> : <FiLogOut/>}
                        {!isCollapsed && <p>Uitloggen</p>}
                    </Button>
                </ResizablePanel>
                <ResizablePanel defaultSize={96}>
                    <div
                        className={`w-full h-screen overflow-auto ${path === '/create-user' ? 'md:p-0 md:pt-0' : 'md:p-8 md:pt-6'}`}>
                        {path !== '/create-user' && (
                            <div className="flex justify-between space-y-2 w-full bg-black flex-col p-8 pt-6 md:flex-row md:bg-white md:p-0 md:pt-0 md:mb-8">
                                <div className="flex items-center justify-between w-full">
                                    <PlanningFinanceTabs />
                                    <SlideMenuComponent/>
                                </div>
                            </div>
                        )}
                        <div className={"p-4 md:p-0"}>
                            {children}
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
