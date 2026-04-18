import {ReactNode, FC} from "react";

interface ContainerProps  {
    children: ReactNode
}

export const Container: FC<ContainerProps> = ({children}) =>  {
    return (<div className={'w-full max-w-[1740px] m-auto px-[15px]'}>
        {children}
    </div>)
}