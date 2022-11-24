import { screen } from "@testing-library/react";
import { renderWithProviders } from "../src/utils/test-utils";
import Collection from "../src/routes/Collection";
import React from "react";

describe("Collection", () => {
  it("should display title with proposals, collection, group and visit", () => {
    renderWithProviders(<Collection />);
    expect(screen.getByText("Data Collection #5")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Proposal cm-31111 , visit 5000 , data collection group 2000" })
    ).toBeInTheDocument();
  });
});
