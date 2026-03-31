import { ReactNode } from "react";

export default async function AsyncWrapper({children}: {children: ReactNode}): Promise<ReactNode> {
    const element = <div>{children}</div>

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(element)
        }, 2000)
    });
}