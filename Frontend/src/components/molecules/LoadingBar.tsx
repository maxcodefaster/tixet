export default function LoadingBar() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="50"
      viewBox="0 0 200 50"
    >
      <rect
        x="10"
        y="20"
        width="180"
        height="10"
        fill="#ffffff"
        rx="5"
        ry="5"
      ></rect>
      <rect
        x="10"
        y="20"
        width="40"
        height="10"
        fill="#3e63dd"
        rx="5"
        ry="5"
        style={{ color: "#1e2631" }}
      >
        <animate
          attributeName="x"
          from="10"
          to="150"
          dur="1s"
          repeatCount="indefinite"
          keyTimes="0; 0.5; 1"
          values="10; 150; 10"
        ></animate>
         
      </rect>
    </svg>
  );
}
