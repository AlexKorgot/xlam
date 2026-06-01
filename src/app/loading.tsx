export default function Loading() {
  return (
    <>
      <div
        data-route-loading="true"
        className="sr-only"
        aria-live="polite"
      >
        Загрузка
      </div>
      <div data-route-loading-noise aria-hidden="true" />
    </>
  );
}
