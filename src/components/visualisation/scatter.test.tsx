import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import { ScatterPlot } from "./scatter";

describe("Scatter Card", () => {
  it("should display title", () => {
    renderWithProviders(<ScatterPlot data={[{ x: 1, y: 1 }]} title='test' />);
    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
