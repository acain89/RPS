export default function ArenaLogo({ size = 135 }) { // ✅ 1.5x scale
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer neon ring */}
      <circle
        cx="100" cy="100" r="92"
        stroke="#00ffc8"
        strokeWidth="3"
        fill="none"
        opacity="0.9"
      />

      {/* Inner glow ring */}
      <circle
        cx="100" cy="100" r="75"
        stroke="#00eaff"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />

      {/* Heartbeat line */}
      <polyline
        points="30,100 60,100 75,120 90,80 105,140 120,100 170,100"
        fill="none"
        stroke="#00ffd5"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="stroke-opacity"
          values="0.6;1;0.6"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="points"
          dur="2.2s"
          repeatCount="indefinite"
          values="
            30,100 60,100 75,120 90,80 105,140 120,100 170,100;
            30,100 60,100 80,120 95,85 110,135 125,100 170,100;
            30,100 60,100 75,120 90,80 105,140 120,100 170,100
          "
        />
      </polyline>

      {/* Soft inner glow */}
      <circle cx="100" cy="100" r="72" fill="#00ffc8" opacity="0.07" />
    </svg>
  );
}
