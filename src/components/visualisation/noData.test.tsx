import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { NoData } from "./noData";

describe("No Data Indicator", () => {
  it("should render component", async () => {
    renderWithProviders(<NoData />);
    expect(screen.getByText("No Data Available")).toBeInTheDocument();
  });
});
