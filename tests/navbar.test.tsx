import { screen } from "@testing-library/react";
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

    renderWithProviders(<Navbar />, { preloadedState: { auth: { user: "user" }, ui: { loading: false } } });
    const logoutButton = screen.getByText(textToFind);

    expect(logoutButton).toBeInTheDocument();
  });

  it("should display loading bar when loading", () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: { user: "user" }, ui: { loading: true } } });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should not display loading bar when not loading", () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: { user: "user" }, ui: { loading: false } } });
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
