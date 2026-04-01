'use client';


import {Header} from "@/src/components/ui/Header/Header";
import FullPageScroll from "@/src/components/ui/FullPageScroll";
import FullPageSection from "@/src/components/ui/FullPageSection";
import {useRef, useState} from "react";

export default function Home() {
    const [progress, setProgress] = useState(0)
    const callback = (value: number) => {
        setProgress(value)
    }
    return (
        <>
            <Header scrollProgress={progress} />

            <FullPageScroll progressCallback={callback}>
                <FullPageSection >
                    <div>1</div>
                </FullPageSection>

                <FullPageSection >
                    <div>2</div>
                </FullPageSection>

                <FullPageSection >
                    <div>3</div>
                </FullPageSection>

                <FullPageSection >
                    <div>4</div>
                </FullPageSection>
            </FullPageScroll>
        </>
    );
}