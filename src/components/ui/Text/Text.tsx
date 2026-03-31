'use client'

import {ReactNode} from "react";
import {gsap} from "gsap";
import {useGSAP} from "@gsap/react";
import {SplitText} from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

export default function TextP({children, ...rest}: {children : ReactNode, className?: string}) {
    // console.log(children)
    // gsap.to(".text", {
    //     text: { value: "DECODED", chars: "XO!#" },
    //     duration: 1.5, ease: "none"
    // });

    return (
        <p {...rest}> {children}</p>
    )
}
