'use client'

import {AnimatedLogoNew, type AnimatedLogoHandle} from "@/src/components/ui/AnimatedLogoNew";
import {useRef} from "react";
import GlitchText from "@/src/components/ui/GlitchText/GlitchText";


export default function HeaderDesktop() {

    const logoRef = useRef<AnimatedLogoHandle>(null);
    return (
        <div className='flex justify-between items-center font-normalidad font-medium uppercase pt-[20px]'>
            <div className='flex gap-[20px]'>
                <GlitchText size='20'>
                    Услуги
                </GlitchText>

                <GlitchText size='20'>
                    Портфолио
                </GlitchText>
            </div>
            <div>
                <AnimatedLogoNew ref={logoRef}/>
            </div>
            <div className='flex gap-[20px]'>
                <GlitchText size='20'>
                    Контакты
                </GlitchText>

                <GlitchText size='20'>
                    Связаться с нами
                </GlitchText>
            </div>
        </div>
    )
}