import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { Error } from "./Error";
import { useRouteError } from "react-router";
import { Mock } from "vitest";

const mockRouteError = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useRouteError: vi.fn(),
  };
});

describe("Error", () => {
  afterEach(() => {
    mockRouteError.mockClear();
  });

  it("should render page not found error if status is 404", async () => {
    (useRouteError as Mock).mockReturnValue({ status: 404 });
    renderWithProviders(<Error />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("should render error if status is not 404", async () => {
    (useRouteError as Mock).mockReturnValue("Some Error Here");
    renderWithProviders(<Error />);
    expect(screen.getByText("Some Error Here")).toBeInTheDocument();
  });
});
