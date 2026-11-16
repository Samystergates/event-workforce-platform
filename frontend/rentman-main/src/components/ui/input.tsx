"use client"
import React, {useState} from "react"
import { cn } from "@/lib/utils"
import HStackComponent from "@/components/common/horizontal-stack.component";
import {Button} from "@/components/ui/button";
import { LuEyeOff, LuEye } from "react-icons/lu";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
      const [visible, setVisible] = useState<boolean>(false);
      return (
        <HStackComponent className={'flex !flex-row h-10 bg-background w-full rounded-md border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'}>
            <input
                type={visible ? 'text' : type}
                className={cn(
                    "w-full bg-background px-3 py-2 text-sm rounded-md file:border-0 file:bg-transparent focus-visible:outline-none file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
            {type === 'password' && (
                <>
                    <Button type={'button'} variant={'ghost'} onClick={() => setVisible(!visible)}>
                        {visible ? <LuEye /> : <LuEyeOff />}
                    </Button>
                </>
            )}
        </HStackComponent>
    )
  }
)
Input.displayName = "Input"

export { Input }
