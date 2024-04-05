import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import AboutPage from "./About";

describe("About", () => {
  it("should render page", async () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText("About")).toBeInTheDocument();
  });
});
