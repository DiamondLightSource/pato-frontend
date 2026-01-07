import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { Footer } from "./footer";

describe("No Data Indicator", () => {
  it("should render version", async () => {
    process.env.REACT_APP_VERSION = "0.0.1";
    renderWithProviders(<Footer />);
    expect(screen.getByText("0.0.1")).toBeInTheDocument();
  });

  it("should render feedback link if enabled", async () => {
    window.ENV.FEEDBACK_URL = "true";
    renderWithProviders(<Footer />);
    expect(screen.getByText("Feedback")).toBeInTheDocument();
  });

  it("should render changelog link if enabled", async () => {
    window.ENV.CHANGELOG_URL = "https://foo.com";
    renderWithProviders(<Footer />);
    expect(screen.getByText("Changelog")).toBeInTheDocument();
  });
});
