import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import { Dropdown, FormItem, NumericInput } from "./input";

describe("Form", () => {
  it("should render provided combobox options", () => {
    renderWithProviders(
      <Dropdown
        name='dropdown'
        values={[
          { key: "test", value: "label" },
          { key: "test2", value: "label2" },
        ]}
      ></Dropdown>
    );

    expect(screen.getByDisplayValue("label")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "label2" } });
    expect(screen.getByDisplayValue("label2")).toBeInTheDocument();
  });

  it("should render unit properly in form item", () => {
    renderWithProviders(
      <FormItem unit='kV' label='test'>
        <input />
      </FormItem>
    );

    expect(screen.getByText("(kV)")).toBeInTheDocument();
  });

  it("should render helper text in form item", () => {
    renderWithProviders(
      <FormItem unit='kV' helperText='Helper Text' label='test'>
        <input />
      </FormItem>
    );

    expect(screen.getByText("Helper Text")).toBeInTheDocument();
  });

  it("should render default value in numeric input", () => {
    renderWithProviders(<NumericInput defaultValue={900} precision={3} name='test' />);

    expect(screen.getByDisplayValue("900.000")).toBeInTheDocument();
  });
});
