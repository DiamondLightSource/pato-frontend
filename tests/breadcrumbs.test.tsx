import { screen } from "@testing-library/react";
import { renderWithProviders } from "../src/utils/test-utils";
import Breadcrumbs from "../src/components/breadcrumbs";
import React from "react";

describe("Breadcrumbs", () => {
  it("should not be displayed on home page", () => {
    renderWithProviders(<Breadcrumbs />);
    expect(screen.queryByRole("nav")).toBeNull();
  });

  it("should be displayed on all non-home pages", () => {
    renderWithProviders(<Breadcrumbs />, { route: "/test" });
    const breadcrumb = screen.getByText("test");

    expect(breadcrumb).toBeInTheDocument();
  });

  it("should display longer routes", () => {
    renderWithProviders(<Breadcrumbs />, { route: "/test/page" });
    const breadcrumb = screen.getByText("test");
    const breadcrumb2 = screen.getByText("page");

    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb2).toBeInTheDocument();
  });
});
