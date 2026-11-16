"use client"
import React, {useState} from 'react';
import {Button, buttonVariants} from "@/components/ui/button";
import {Sheet, SheetContent, SheetTrigger, SheetClose} from "@/components/ui/sheet"
import {HiBars3} from "react-icons/hi2";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {FiLogOut} from "react-icons/fi";
import {clientMenu, moderatorMenu, sliderMenu} from "@/data/slider.data";
import {redirect, usePathname, useRouter} from "next/navigation";
import {IconsComponent} from "@/components/common/icons.component";
import {signOut, useSession} from "next-auth/react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import Link from "next/link";
import {cn} from "@/lib/utils";
import UserAvatarSidebarComponent from "@/components/sidebar/user-avatar-sidebar.component";

const SlideMenuComponent = () => {
    const [loadingLogout, setLoadingLogout] = useState<boolean>(false);
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/')
        },
    })

    if (status === 'loading') {
        return (
            <div className={'h-screen flex items-center justify-center'}>
                <IconsComponent.spinner className="mr-2 h-6 w-6 mb-1 animate-spin" /><p>Laden</p>
            </div>
        )
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="h-9 px-3 md:hidden">
                    <HiBars3 className="h-5 w-5"/>
                </Button>
            </SheetTrigger>
            <SheetContent side={'left'} className={"bg-black"}>
                <div className='items-center flex-col justify-between px-3 py-4 flex h-full'>
                    <UserAvatarSidebarComponent isCollapsed={false}/>
                    <div
                        className="group flex flex-col gap-4 py-2 w-full data-[collapsed=true]:py-2"
                    >
                        <nav
                            className="flex flex-col gap-4 group-[[data-collapsed=true]]:justify-center items-center w-full">
                            {(session.user.depId === 3 ? sliderMenu : session.user.depId === 2 ? moderatorMenu : clientMenu).map((menu, index) =>
                                (
                                    <Link
                                        key={index}
                                        href={menu.route}
                                        className={cn(
                                            buttonVariants({variant: 'default', size: "sm"}),
                                            menu.route === pathname ?
                                                "bg-primary/90 text-white dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white"
                                                : "bg-white text-black hover:bg-white",
                                            "justify-start gap-4 w-full"
                                        )}
                                    >
                                        {menu.icon()}
                                        {menu.name}
                                    </Link>
                                )
                            )}
                        </nav>
                    </div>
                    <Button onClick={() => {
                        setLoadingLogout(true);
                        signOut().then(null)
                    }} disabled={loadingLogout}
                            className={'w-full gap-2'}
                            size={'default'}>
                        {loadingLogout ? <IconsComponent.spinner className="h-4 w-4 animate-spin"/> : <FiLogOut/>}
                        <p>Uitloggen</p>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default SlideMenuComponent;
