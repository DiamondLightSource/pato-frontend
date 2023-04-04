import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { InfoGroup } from "components/visualisation/infogroup";

describe("InfoGroup", () => {
  it('should display "?" when no value is present', () => {
    renderWithProviders(<InfoGroup info={[{ label: "title" }]} />);
    const questionMark = screen.getByText("?");

    expect(questionMark).toBeInTheDocument();
  });

  it("should display value when provided", () => {
    renderWithProviders(<InfoGroup info={[{ label: "title", value: "value" }]} />);
    const value = screen.getByText("value");

    expect(value).toBeInTheDocument();
  });
});
