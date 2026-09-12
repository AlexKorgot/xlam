import { useRef, useState, type RefObject } from 'react';
import { preloadServiceModalBackground } from './serviceModalBackground';
import type { ServicePoster, ServiceSlide } from './services.types';

type ServiceVideoRef = RefObject<HTMLVideoElement | null>;

type ServiceVideoMediaProps = {
  poster: ServicePoster;
  shouldLoad: boolean;
  videoRef: ServiceVideoRef;
  videoSrc: string;
};

type ServicePosterMediaProps = {
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  poster: ServicePoster;
};

function ServicePosterMedia({
  className = '',
  onError,
  onLoad,
  poster,
}: ServicePosterMediaProps) {
  return (
    <picture className="pointer-events-none absolute inset-0 block h-full w-full">
      <source media="(max-width: 999.98px)" srcSet={poster.mobile.src} />
      <img
        src={poster.desktop.src}
        alt=""
        aria-hidden="true"
        width={poster.desktop.width}
        height={poster.desktop.height}
        loading="lazy"
        decoding="async"
        onLoad={onLoad}
        onError={onError}
        className={`h-full w-full object-cover ${className}`}
      />
    </picture>
  );
}

function ServiceVideoMedia({
  poster,
  shouldLoad,
  videoRef,
  videoSrc,
}: ServiceVideoMediaProps) {
  const [isPosterReady, setIsPosterReady] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  const markVideoReady = () => {
    setIsVideoReady(true);
    setIsVideoLoading(false);
    setHasVideoError(false);
  };

  const showLoader =
    !isPosterReady || (shouldLoad && isVideoLoading && !hasVideoError);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgba(99,255,69,0.14),rgba(0,0,0,0.96)_68%)]">
      <ServicePosterMedia
        poster={poster}
        onLoad={() => setIsPosterReady(true)}
        onError={() => setIsPosterReady(true)}
        className={`transition-opacity duration-300 ${isPosterReady ? 'opacity-100' : 'opacity-0'
          }`}
      />

      <video
        ref={videoRef}
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isVideoReady && !hasVideoError ? 'opacity-100' : 'opacity-0'
          }`}
        src={shouldLoad ? videoSrc : undefined}
        playsInline
        loop
        muted
        preload="none"
        onLoadStart={() => {
          setIsVideoLoading(true);
          setHasVideoError(false);
        }}
        onLoadedData={markVideoReady}
        onCanPlay={markVideoReady}
        onPlaying={markVideoReady}
        onWaiting={() => setIsVideoLoading(true)}
        onStalled={() => setIsVideoLoading(true)}
        onSuspend={() => {
          if (!isVideoReady) {
            setIsVideoLoading(false);
          }
        }}
        onError={() => {
          setHasVideoError(true);
          setIsVideoReady(false);
          setIsVideoLoading(false);
        }}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-black/25 backdrop-blur-[1px] transition-opacity duration-200 ${showLoader ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#63ff45]/25 border-r-[#63ff45] border-t-[#63ff45] shadow-[0_0_22px_rgba(99,255,69,0.38)] animate-spin">
          <span className="h-1.5 w-1.5 rotate-45 bg-[#63ff45] shadow-[0_0_12px_rgba(99,255,69,0.9)]" />
        </span>
      </div>
    </div>
  );
}

type ServiceSlideCardProps = {
  slide: ServiceSlide;
  index: number;
  shouldLoad: boolean;
  onOpen: (index: number) => void;
  onPrepare: (index: number) => void;
};

export function ServiceSlideCard({ slide, index, shouldLoad, onOpen, onPrepare }: ServiceSlideCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <button
      type="button"
      className="embla__slide relative h-full min-w-0 flex-none basis-[calc((100%+9px)/2)] cursor-pointer border-0 bg-transparent pb-0 pl-[9px] pr-0 pt-0 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45] min-[600px]:basis-[calc((100%+9px)/3)] min-[1000px]:basis-1/4 min-[1000px]:pl-[22px]"
      aria-label={`Открыть услугу ${slide.title}`}
      onClick={() => onOpen(index)}
      onFocus={() => {
        onPrepare(index);
        void preloadServiceModalBackground(slide.modal.backgroundImage);
      }}
      onPointerDown={() => {
        onPrepare(index);
        void preloadServiceModalBackground(slide.modal.backgroundImage);
      }}
      onPointerEnter={() => {
        onPrepare(index);
        void preloadServiceModalBackground(slide.modal.backgroundImage);
      }}
      onMouseEnter={() => {
        void videoRef.current?.play().catch(() => undefined);
      }}
      onMouseLeave={() => {
        const video = videoRef.current;
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      }}
    >
      <div
        data-service-slide-visual
        className="relative h-full w-full overflow-hidden"
      >
        {slide.videoSrc ? (
          <ServiceVideoMedia
            poster={slide.poster}
            shouldLoad={shouldLoad}
            videoRef={videoRef}
            videoSrc={slide.videoSrc}
          />
        ) : (
          <ServicePosterMedia poster={slide.poster} />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex w-full flex-col items-center px-1.5 text-center min-[1000px]:pb-[25px]">
          <p className="hidden max-w-[260px] text-[12px] leading-[1.12] min-[1000px]:block mb-2">{slide.description}</p>
          <h4 className="text-[22px] font-black leading-none text-[#63ff45] [text-shadow:-4px_5px_18px_rgba(0,0,0,0.82)] min-[1000px]:text-[18px] min-[1430px]:text-[30px]">
            {slide.title}
          </h4>
        </div>
      </div>
    </button>
  );
}
