import {useRef} from "react";
import {AnimatedLogoHandle, AnimatedLogoNew} from "@/src/components/ui/AnimatedLogoNew";
import BurgerButton from "@/src/components/ui/BurgerButton";
import BurgerButtonNew from "@/src/components/ui/BurgerButtonNew";

export default function HeaderMobile() {
    const logoRef = useRef<AnimatedLogoHandle>(null);

    return (<div className='flex justify-between items-center pt-[20px]'>

        <AnimatedLogoNew ref={logoRef}/>
        {/*<BurgerButton/>*/}
        <BurgerButtonNew />
    </div>)
}