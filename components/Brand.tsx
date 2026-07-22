export default function Brand({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
         stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 16.5 30.5 12v40L10 56.5z" />
      <path d="M30.5 12 51 16.5v40L30.5 52z" opacity=".55" />
      <path d="M30.5 12v40" />
      <path d="M20.2 26.5v13M15.4 32.2h9.6" />
    </svg>
  );
}
