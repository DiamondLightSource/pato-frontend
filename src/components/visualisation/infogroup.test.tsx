import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { InfoGroup } from "components/visualisation/infogroup";

describe("InfoGroup", () => {
  it('should display "?" when no value is present', () => {
    renderWithProviders(<InfoGroup info={[{ label: "title" }]} />);

    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("should display value when provided", () => {
    renderWithProviders(<InfoGroup info={[{ label: "title", value: "value" }]} />);

    expect(screen.getByText("value")).toBeInTheDocument();
  });

  it("shold render skeleton if there is no info", () => {
    renderWithProviders(<InfoGroup info={[]} />);

    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });
});
