export function LogoLarge() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={215}
      height={60}
      viewBox="0 0 215 60"
      fill="none"
    >
      <rect width="60" height="60" rx="12" fill="currentColor" />
      <path d="M12 12H48L30 30Z" fill="hsl(240, 5%, 64.9%)" />
      <path
        d="M12 12L48 48M48 12L12 48"
        stroke="hsl(240,5%,64.9%)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <text
        x="68"
        y="40"
        fontFamily="Arial, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="currentColor"
      >
        travelese
      </text>
    </svg>
  );
}
