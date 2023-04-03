import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { Navbar } from "components/navigation/navbar";

describe("Navbar", () => {
  it("should display login button when not authenticated", () => {
    const textToFind = "Login";

    renderWithProviders(<Navbar />);
    const loginButton = screen.getByText(textToFind);

    expect(loginButton).toBeInTheDocument();
  });

  it("should display logout button when authenticated", () => {
    const textToFind = "Logout";

    renderWithProviders(<Navbar user={{ fedid: "1", name: "1" }} />, {});
    const logoutButton = screen.getByText(textToFind);

    expect(logoutButton).toBeInTheDocument();
  });

  it("should display hamburger menu on narrow displays", () => {
    global.innerWidth = 600;
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
  });

  it("should display menu items when hamburger menu is clicked", () => {
    global.innerWidth = 600;
    renderWithProviders(<Navbar />);
    const menu = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(menu);

    expect(screen.getAllByText("Proposals").length).toBe(2);
  });
});
