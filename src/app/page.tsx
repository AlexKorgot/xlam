'use client';


import {Header} from "@/src/components/ui/Header/Header";
import FullPageScroll from "@/src/components/ui/FullPageScroll";
import FullPageSection from "@/src/components/ui/FullPageSection";

export default function Home() {
    const callback = (value: number) => {
        console.log(value)
    }
    return (
        <>
            <Header />

            <FullPageScroll>
                <FullPageSection  >
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