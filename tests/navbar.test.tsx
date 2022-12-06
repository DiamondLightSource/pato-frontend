import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../src/utils/test-utils";
import Navbar from "../src/components/navbar";
import React from "react";

describe("Navbar", () => {
  it("should display login button when not authenticated", () => {
    const textToFind = "Login";

    renderWithProviders(<Navbar />);
    const loginButton = screen.getByText(textToFind);

    expect(loginButton).toBeInTheDocument();
  });

  it("should display logout button when authenticated", () => {
    const textToFind = "Logout";

    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { user: { name: "Someone", fedid: "aaa" } }, ui: { loading: false } },
    });
    const logoutButton = screen.getByText(textToFind);

    expect(logoutButton).toBeInTheDocument();
  });

  it("should display loading bar when loading", () => {
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { user: { name: "Someone", fedid: "aaa" } }, ui: { loading: true } },
    });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should not display loading bar when not loading", () => {
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { user: { name: "Someone", fedid: "aaa" } }, ui: { loading: false } },
    });
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("should display hamburger menu on narrow displays", () => {
    global.innerWidth = 600;
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { user: { name: "Someone", fedid: "aaa" } }, ui: { loading: false } },
    });
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it("should display menu items when hamburger menu is clicked", () => {
    global.innerWidth = 600;
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: { user: { name: "Someone", fedid: "aaa" } }, ui: { loading: false } },
    });
    const menu = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(menu)

    expect(screen.getAllByText("Proposals").length).toBe(2);
  });
});
