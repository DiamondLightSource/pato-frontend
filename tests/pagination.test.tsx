import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../src/utils/test-utils";
import Pagination from "../src/components/pagination";
import React from "react";

describe("Pagination", () => {
  it("should display first 5 pages when there are more than 5 pages", () => {
    renderWithProviders(<Pagination total={90} />);
    for (let i = 1; i < 6; i++) {
      expect(screen.getByRole("button", { name: i.toString() })).toBeInTheDocument();
    }
  });

  it("should only display relevant pages when there are fewer than 5 pages", () => {
    renderWithProviders(<Pagination total={40} />);
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
    renderWithProviders(<Pagination total={160} />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));

    for (let i = 3; i < 8; i++) {
      expect(screen.getByRole("button", { name: i.toString() })).toBeInTheDocument();
    }

    expect(screen.queryByRole("button", { name: "8" })).toBeNull();
    expect(screen.queryByRole("button", { name: "2" })).toBeNull();
  });

  it("should display last 5 pages when moving to last page", () => {
    renderWithProviders(<Pagination total={160} />);
    fireEvent.click(screen.getByRole("button", { name: ">>" }));

    for (let i = 4; i < 9; i++) {
      expect(screen.getByRole("button", { name: i.toString() })).toBeInTheDocument();
    }

    expect(screen.queryByRole("button", { name: "9" })).toBeNull();
    expect(screen.queryByRole("button", { name: "3" })).toBeNull();
  });

  it("should update page number when page changes", () => {
    renderWithProviders(<Pagination total={160} />);
    fireEvent.click(screen.getByRole("button", { name: ">" }));

    expect(screen.getByText("Page 2 out of 8")).toBeInTheDocument();
  });

  it("should update page amount when items per page changes", () => {
    renderWithProviders(<Pagination total={160} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: 10 } });

    expect(screen.getByText("Page 2 out of 16")).toBeInTheDocument();
  });

  it("should call callback when page changes", async () => {
    const mockCallback = jest.fn();
    renderWithProviders(<Pagination total={160} onChange={mockCallback} />);

    const input = screen.getByRole("button", { name: ">" });
    fireEvent.click(input);

    expect(mockCallback).toBeCalledWith(2, 20);
  });

  it("should call items per page changes", async () => {
    const mockCallback = jest.fn();
    renderWithProviders(<Pagination total={160} onChange={mockCallback} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: 5 } });

    expect(mockCallback).toBeCalledWith(1, 5);
  });
});
