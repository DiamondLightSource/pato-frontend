import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { Form } from "components/form/form";

describe("Form", () => {
  it("should fire callback when submit button is pressed", () => {
    const mockCallback = vi.fn();
    renderWithProviders(
      <Form onSubmit={mockCallback}>
        <input name='test' />
      </Form>
    );

    fireEvent.click(screen.getByText("Submit"));

    expect(mockCallback).toBeCalled();
  });
});
