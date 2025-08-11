import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import InvalidUserPage from "./InvalidUser";

describe("Invalid User Page", () => {
  it("should render page", async () => {
    renderWithProviders(<InvalidUserPage />);
    expect(screen.getByText("User not recognised")).toBeInTheDocument();
  });
});
