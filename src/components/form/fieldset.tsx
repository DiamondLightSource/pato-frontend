import { ReactNode } from "react";

interface FieldSetProps {
  title: string;
  children?: ReactNode;
}

const FieldSet = ({ children, title }: FieldSetProps) => (
  <fieldset
    style={{
      border: "1px solid var(--chakra-colors-diamond-200)",
      padding: "0.5em",
      borderRadius: "0.3em",
      height: "100%",
    }}
  >
    <legend
      style={{
        position: "relative",
        color: "var(--chakra-colors-chakra-body-text)",
        marginLeft: "0.2vw",
        padding: "0 5px",
        fontWeight: "600",
      }}
    >
      {title}
    </legend>
    {children}
  </fieldset>
);

export { FieldSet };
