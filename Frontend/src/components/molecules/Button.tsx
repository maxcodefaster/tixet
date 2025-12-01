import { Button } from "@radix-ui/themes";
import { ButtonProps } from "../../type";
import Loading from "./Loading";
export default function myButton({ title, onClick, disabled }: ButtonProps) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      size={"3"}
      radius="full"
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        minWidth: "120px", 
        height: "40px",
        background: "#0101ff",
        color: "white",
        boxShadow: "2px 2px 0px rgba(0, 0, 0, 0.15)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "2px solid #0101ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: "bold",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {disabled && <Loading />}
      {title}
    </Button>
  );
}