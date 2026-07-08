export default function MicIcon({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={(size * 8) / 11}
      height={size}
      viewBox="0 0 8 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <rect x="2.5" y="0.5" width="3" height="6" rx="1.5" />
      <path d="M1 5v0.5a3 3 0 0 0 6 0V5" />
      <line x1="4" y1="8.5" x2="4" y2="10.5" />
    </svg>
  )
}
