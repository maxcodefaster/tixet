import { Box } from "@radix-ui/themes";

export default function CopyToClipboard({ text }: { text: string }) {
  return (
    <Box
      style={{ cursor: "pointer" }}
      onClick={() => {
        navigator.clipboard.writeText(text);
        alert("Address copied to clipboard!");
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect
          x="8"
          y="8"
          width="12"
          height="12"
          rx="2"
          stroke="#A0A0A0"
          stroke-width="2"
        />
        <rect
          x="4"
          y="4"
          width="12"
          height="12"
          rx="2"
          stroke="#A0A0A0"
          stroke-width="2"
        />
      </svg>
    </Box>
  );
}
