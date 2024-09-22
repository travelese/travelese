export function LogoIcon() {
  return (
    <>
      {/* Mobile version (102x30) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={102}
        height={30}
        viewBox="0 0 102 30"
        fill="none"
        className="md:hidden"
      >
        <rect width="30" height="30" rx="6" fill="currentColor" />
        <path d="M6 6H24L15 15Z" fill="hsl(240, 5%, 64.9%)" />
        <path
          d="M6 6L24 24M24 6L6 24"
          stroke="hsl(240,5%,64.9%)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <text
          x="34"
          y="20"
          fontFamily="Arial, sans-serif"
          fontSize="14"
          fontWeight="bold"
          fill="currentColor"
        >
          travelese
        </text>
      </svg>

      {/* Desktop version (30x30) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={30}
        height={30}
        viewBox="0 0 30 30"
        fill="none"
        className="hidden md:block"
      >
        <rect width="30" height="30" rx="6" fill="currentColor" />
        <path d="M6 6H24L15 15Z" fill="hsl(240, 5%, 64.9%)" />
        <path
          d="M6 6L24 24M24 6L6 24"
          stroke="hsl(240,5%,64.9%)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}
