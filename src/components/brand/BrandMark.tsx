/** The working mark: a play button on the accent square. */
export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg className="bm" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="var(--accent)" />
      <path d="M26 19.5v25L45 32z" fill="#fff" />
    </svg>
  );
}
