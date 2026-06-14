"use client";

import { useRouter } from "next/navigation";
import React from "react";



interface ButtonProps {
    children: React.ReactNode
}

export const Button = ({
    children,
}: ButtonProps) => {
    const router = useRouter();

    const handleClick = () => {
        router.push("/create");
    };

    return (
        <button 
            onClick={handleClick}
            className="hover:cursor-pointer flex gap-2 items-center justify-center px-5 py-3 rounded-[16px] relative border-x border-t-2 border-brand-purple bg-gradient-to-b from-[#4F46E5] to-[#5100FF] [box-shadow:0px_-2px_0px_0px_#2c04b1_inset] hover:opacity-90 transition-opacity duration-100 text-white font-medium">
            {children}
        </button>
    )
}