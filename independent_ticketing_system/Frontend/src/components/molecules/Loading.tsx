export default function Loading() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="#ffffff"
        stroke-width="10"
        fill="none"
        stroke-dasharray="283"
        strokeDashoffset="75"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="strokeDashoffset"
          values="283;0"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
