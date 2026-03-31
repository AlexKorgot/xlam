import LogoBig from '@/src/lib/assets/logo_big.svg'
import Image from "next/image";

export default function MainFallback() {
    return (
        <div className={'min-h-[100vh] flex'}>
            <Image className={'m-auto'} src={LogoBig} alt={'logo'}/>
        </div>
    )
}