import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { UploadModelPage } from "routes/UploadModel";
import { server } from "mocks/server";
import { rest } from "msw";
import { mockToast } from "../../vitest.setup";

const mockUseNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => mockUseNavigate,
  };
});

const file = new File(["test.h5"], "test.h5", { type: "text/plain" });

describe("Upload Model", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    mockUseNavigate.mockClear();
  });

  it("should display toast if upload is successful", async () => {
    renderWithProviders(<UploadModelPage />);

    const fileInput = screen.getByTestId("file-input");

    Object.defineProperty(fileInput, "files", {
      value: [file],
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith(-1));
  });

  it("should display toast if upload fails and server returns error details", async () => {
    server.use(
      rest.post(
        "http://localhost/proposals/:propId/sessions/:sessionId/processingModel",
        (req, res, ctx) => res.once(ctx.status(415), ctx.json({ detail: "Specific Error" }))
      )
    );

    renderWithProviders(<UploadModelPage />);

    const fileInput = screen.getByTestId("file-input");

    Object.defineProperty(fileInput, "files", {
      value: [file],
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith({
        description: "Specific Error",
        status: "error",
        title: "Upload failed!",
      })
    );
  });

  it("should display toast if upload fails and server doesn't return details", async () => {
    server.use(
      rest.post(
        "http://localhost/proposals/:propId/sessions/:sessionId/processingModel",
        (req, res, ctx) => res.once(ctx.status(500), ctx.json({}))
      )
    );

    renderWithProviders(<UploadModelPage />);

    const fileInput = screen.getByTestId("file-input");

    Object.defineProperty(fileInput, "files", {
      value: [file],
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith({
        description: "Internal server error",
        status: "error",
        title: "Upload failed!",
      })
    );
  });
});
