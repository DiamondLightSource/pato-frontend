import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { Form } from "components/form/form";

describe("Form", () => {
  it("should fire callback when submit button is pressed", () => {
    const mockCallback = jest.fn();
    renderWithProviders(
      <Form onSubmit={mockCallback}>
        <input name='test' />
      </Form>
    );

    fireEvent.click(screen.getByText("Submit"));

    expect(mockCallback).toBeCalled();
  });

  it("should return values to callback as dictionary", () => {
    const mockCallback = jest.fn();
    renderWithProviders(
      <Form onSubmit={mockCallback}>
        <input name='test' defaultValue='value' />
      </Form>
    );

    fireEvent.click(screen.getByText("Submit"));

    expect(mockCallback).toHaveBeenCalledWith({ test: "value" });
  });

  it("should ignore form elements without names", () => {
    const mockCallback = jest.fn();
    renderWithProviders(
      <Form onSubmit={mockCallback}>
        <input name='test' defaultValue='value' /> <input defaultValue='noName'></input>
      </Form>
    );

    fireEvent.click(screen.getByText("Submit"));

    expect(mockCallback).toHaveBeenCalledWith({ test: "value" });
  });

  it("should not fire callback when form has no elements", () => {
    const mockCallback = jest.fn();
    renderWithProviders(
      <Form onSubmit={mockCallback}>
        <input defaultValue='noName'></input>
      </Form>
    );

    fireEvent.click(screen.getByText("Submit"));

    expect(mockCallback).not.toHaveBeenCalled();
  });
});
