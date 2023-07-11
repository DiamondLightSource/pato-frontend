import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { FormItem, Options } from "components/form/input";
import { Select } from "@chakra-ui/react";

describe("Form", () => {
  it("should render provided combobox options", () => {
    renderWithProviders(
      <Select>
        <Options
          values={[
            { key: "test", value: "label" },
            { key: "test2", value: "label2" },
          ]}
        ></Options>
      </Select>
    );

    expect(screen.getByText("label")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "label2" } });
    expect(screen.getByText("label2")).toBeInTheDocument();
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
});
