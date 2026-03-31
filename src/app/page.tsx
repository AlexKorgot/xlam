'use client';


import {Header} from "@/src/components/ui/Header/Header";
import FullPageScroll from "@/src/components/ui/FullPageScroll";
import FullPageSection from "@/src/components/ui/FullPageSection";

export default function Home() {
    return (
        <>
            <Header />

            <FullPageScroll>
                <FullPageSection className="bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    <div className="flex flex-col items-center justify-center h-full text-white relative z-10">
                        <h1 className="text-4xl font-bold">
                            Добро пожаловать
                        </h1>
                        <p className="text-xl mt-4 text-center max-w-2xl">
                            Скролльте вниз - логотип плавно уменьшится и переместится в хедер
                        </p>
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-2xl">
                            ↓
                        </div>
                    </div>
                </FullPageSection>

                <FullPageSection className="bg-gradient-to-br from-purple-600 to-pink-600">
                    <div className="text-center text-white">
                        <h2 className="text-5xl font-bold mb-4">О нас</h2>
                        <p className="text-xl max-w-2xl mx-auto px-4">
                            Логотип теперь маленький в хедере
                        </p>
                    </div>
                </FullPageSection>

                <FullPageSection className="bg-gradient-to-br from-pink-600 to-red-600">
                    <div className="text-center text-white">
                        <h2 className="text-5xl font-bold mb-4">Особенности</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto px-4">
                            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                                <h3 className="text-2xl font-bold mb-2">GSAP</h3>
                                <p>Плавные анимации</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                                <h3 className="text-2xl font-bold mb-2">Observer</h3>
                                <p>Полный контроль скролла</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                                <h3 className="text-2xl font-bold mb-2">Next.js 16</h3>
                                <p>Оптимизированная производительность</p>
                            </div>
                        </div>
                    </div>
                </FullPageSection>
            </FullPageScroll>
        </>
    );
}