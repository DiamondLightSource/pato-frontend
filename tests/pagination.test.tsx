import { fireEvent, getByRole, screen } from "@testing-library/react";
import { renderWithProviders } from "../src/utils/test-utils";
import Pagination from "../src/components/pagination";
import React from "react";

describe("Breadcrumbs", () => {
  it("should display first 5 pages when there are more than 5 pages", () => {
    renderWithProviders(<Pagination total={90} />);
    for (let i = 1; i < 6; i++) {
      expect(screen.getByRole("button", { name: i.toString() })).toBeInTheDocument();
    }
  });

  it("should only display relevant pages when there are fewer than 5 pages", () => {
    renderWithProviders(<Pagination total={10} />);
    for (let i = 1; i < 3; i++) {
      expect(screen.getByRole("button", { name: i.toString() })).toBeInTheDocument();
    }

    expect(screen.queryByText("3")).toBeNull();
  });

  it("should display correct pages after increasing the amount of items per page", () => {
    renderWithProviders(<Pagination total={30} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: 15 } });

    for (let i = 1; i < 3; i++) {
      expect(screen.getByRole("button", { name: i.toString() })).toBeInTheDocument();
    }

    expect(screen.queryByText("3")).toBeNull();
  });

  it("should display correct pages after decreasing the amount of items per page", () => {
    renderWithProviders(<Pagination total={20} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: 10 } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: 5 } });

    for (let i = 1; i < 5; i++) {
      expect(screen.getByRole("button", { name: i.toString() })).toBeInTheDocument();
    }

    expect(screen.queryByRole("button", { name: "5" })).toBeNull();
  });

  it("should move page 'window' forward when moving to any page greater than 4", () => {
    renderWithProviders(<Pagination total={40} />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));

    for (let i = 3; i < 8; i++) {
      expect(screen.getByRole("button", { name: i.toString() })).toBeInTheDocument();
    }

    expect(screen.queryByRole("button", { name: "8" })).toBeNull();
    expect(screen.queryByRole("button", { name: "2" })).toBeNull();
  });

  it("should display last 5 pages when moving to last page", () => {
    renderWithProviders(<Pagination total={40} />);
    fireEvent.click(screen.getByRole("button", { name: ">>" }));

    for (let i = 4; i < 9; i++) {
      expect(screen.getByRole("button", { name: i.toString() })).toBeInTheDocument();
    }

    expect(screen.queryByRole("button", { name: "9" })).toBeNull();
    expect(screen.queryByRole("button", { name: "3" })).toBeNull();
  });
});
