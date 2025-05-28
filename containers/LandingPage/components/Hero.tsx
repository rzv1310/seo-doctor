"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles"
import { ActionButton } from '@/components/ui';



interface HeroProps {
    isAuthenticated?: boolean;
}

export default function Hero({ isAuthenticated = false }: HeroProps) {
    return (
        <div className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
            <h1 className="mt-8 md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20">
                SEO Doctor
            </h1>
            <p className="mt-4 text-text-secondary text-center text-base sm:text-lg md:text-xl max-w-2xl mb-8 sm:mb-12 drop-shadow">
                Soluții garantate de optimizare SEO, mai mulți pacienti în clinica ta.
            </p>
            <ActionButton
                href={isAuthenticated ? "/dashboard" : "/login"}
                size="lg"
                animate
            >
                Start aici
            </ActionButton>
            <div className="w-[40rem] h-40 relative mt-12">
                {/* Gradients */}
                <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
                <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
                <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
                <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

                {/* Core component */}
                <SparklesCore
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={1200}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                />

                {/* Radial Gradient to prevent sharp edges */}
                <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
            </div>
        </div>
    );
}
