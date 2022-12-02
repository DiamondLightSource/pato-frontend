import MotionPagination from "../src/components/motion/pagination";
import React from "react";
import { server, renderWithProviders } from "../src/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";

beforeAll(() => server.listen());

describe("MotionPagination", () => {
  window.URL.createObjectURL = jest.fn();
  it("should display item count properly", async () => {
    renderWithProviders(<MotionPagination total={112} />);

    expect(screen.getByText("112")).toBeInTheDocument();
  });

  it("should set last item as default", async () => {
    renderWithProviders(<MotionPagination total={112} />);

    expect(screen.getByDisplayValue("112")).toBeInTheDocument();
  });

  it("should set middle item as default if startFrom is middle", async () => {
    renderWithProviders(<MotionPagination startFrom='middle' total={90} />);

    expect(screen.getByDisplayValue("45")).toBeInTheDocument();
  });

  it("should set first item as default if startFrom is start", async () => {
    renderWithProviders(<MotionPagination startFrom='start' total={90} />);

    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
  });

  it("should not allow item greater than the item count to be set", async () => {
    renderWithProviders(<MotionPagination total={112} />);

    const input = screen.getByDisplayValue("112");

    fireEvent.change(input, { target: { value: 200 } });
    fireEvent.blur(input);

    expect(screen.getByDisplayValue("112")).toBeInTheDocument();
  });

  it("should not allow item inferior to the item count to be set", async () => {
    renderWithProviders(<MotionPagination total={112} />);

    const input = screen.getByDisplayValue("112");

    fireEvent.change(input, { target: { value: 0 } });
    fireEvent.blur(input);

    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
  });

  it("should allow any valid page to be set", async () => {
    renderWithProviders(<MotionPagination total={112} />);

    const input = screen.getByDisplayValue("112");

    fireEvent.change(input, { target: { value: 20 } });
    fireEvent.blur(input);

    expect(screen.getByDisplayValue("20")).toBeInTheDocument();
  });

  it("should call callback when page changes", async () => {
    const mockCallback = jest.fn();
    renderWithProviders(<MotionPagination total={112} onChange={mockCallback} />);

    const input = screen.getByRole("button", { name: "<" });
    fireEvent.click(input);

    expect(mockCallback).toBeCalledWith(111);
  });
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
