import { screen} from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import { ScatterPlot } from "./scatter";

describe("Scatter Plot", () => {
  it('should display title', () => {
    renderWithProviders(<ScatterPlot scatterData={[{x: 1, y:1}]} title="test"/>);
    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
