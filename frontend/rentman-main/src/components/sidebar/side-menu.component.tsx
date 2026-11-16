"use client"

import Link from "next/link"
import {cn} from "@/lib/utils"
import {buttonVariants} from "@/components/ui/button"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip"
import {clientMenu, moderatorMenu, sliderMenu} from "@/data/slider.data";
import {usePathname} from "next/navigation";
import {useSession} from "next-auth/react";

interface NavProps {
    isCollapsed: boolean
}

export default function SideMenuComponent({isCollapsed}: NavProps) {
    const pathname = usePathname()
    const { data: session } = useSession()

    if (!session) return <></>

    return (
        <div
            data-collapsed={isCollapsed}
            className="group flex flex-col gap-4 py-2 w-full data-[collapsed=true]:py-2"
        >
            <nav
                className="flex flex-col gap-4 group-[[data-collapsed=true]]:justify-center items-center w-full">
                {(session.user.depId === 3 ? sliderMenu : session.user.depId === 2 ? moderatorMenu : clientMenu).map((menu, index) =>
                    isCollapsed ? (
                        <TooltipProvider key={index}>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={menu.route}
                                        className={cn(
                                            buttonVariants({
                                                variant: menu.route === pathname ? 'default' : 'ghost',
                                                size: "icon"
                                            }),
                                            "h-9 w-9",
                                            menu.route === pathname ?
                                            "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                                                : "bg-white text-black hover:bg-white"
                                        )}
                                    >
                                        {menu.icon()}
                                        <span className="sr-only">{menu.name}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="flex items-center gap-4">
                                    {menu.name}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <Link
                            key={index}
                            href={menu.route}
                            className={cn(
                                buttonVariants({variant: 'default' , size: "sm"}),
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
    )
}
