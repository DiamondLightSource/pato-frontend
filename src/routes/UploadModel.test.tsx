import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { UploadModelPage } from "routes/UploadModel";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { mockToast } from "../../vitest.setup";

const mockUseNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => mockUseNavigate,
    useParams: () => ({ propId: "cm1", visitId: 1 }),
  };
});

const file = new File(["test.h5"], "test.h5", { type: "text/plain" });

const mrcFile = new File(["test.mrc"], "test.mrc", { type: "text/plain" });

describe("Upload Particle Picking Model", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    mockUseNavigate.mockClear();
  });
  beforeAll(() => {
    vi.useRealTimers();
  });

  it("should display toast if upload is successful", async () => {
    renderWithProviders(<UploadModelPage />);

    const fileInput = screen.getByLabelText("Particle picking model(crYOLO):");

    Object.defineProperty(fileInput, "files", {
      value: [file],
    });

    fireEvent.change(fileInput);

    fireEvent.click(screen.getByTestId("submit-.h5"));

    await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith("/proposals/cm1/sessions/1"));
  });

  it("should display toast if upload fails and server returns error details", async () => {
    server.use(
      http.post(
        "http://localhost/proposals/:propId/sessions/:sessionId/processingModel",
        () => HttpResponse.json({ detail: "Specific Error" }, { status: 415 }),
        { once: true }
      )
    );

    renderWithProviders(<UploadModelPage />);

    const fileInput = screen.getByLabelText("Particle picking model(crYOLO):");

    Object.defineProperty(fileInput, "files", {
      value: [file],
    });

    fireEvent.click(screen.getByTestId("submit-.h5"));

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
      http.post(
        "http://localhost/proposals/:propId/sessions/:sessionId/processingModel",
        () => HttpResponse.json({}, { status: 500 }),
        { once: true }
      )
    );

    renderWithProviders(<UploadModelPage />);

    const fileInput = screen.getByLabelText("Particle picking model(crYOLO):");

    Object.defineProperty(fileInput, "files", {
      value: [file],
    });

    fireEvent.click(screen.getByTestId("submit-.h5"));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith({
        description: "Internal server error",
        status: "error",
        title: "Upload failed!",
      })
    );
  });
});

describe("Upload Initial Model", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    mockUseNavigate.mockClear();
  });
  beforeAll(() => {
    vi.useRealTimers();
  });

  it("should display toast if upload is successful", async () => {
    renderWithProviders(<UploadModelPage />);

    const fileInput = screen.getByLabelText("Initial reference model:");

    Object.defineProperty(fileInput, "files", {
      value: [mrcFile],
    });

    fireEvent.change(fileInput);

    fireEvent.click(screen.getByTestId("submit-.mrc"));

    await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith("/proposals/cm1/sessions/1"));
  });

  it("should display toast if upload fails and server returns error details", async () => {
    server.use(
      http.post(
        "http://localhost/proposals/:propId/sessions/:sessionId/initialModel",
        () => HttpResponse.json({ detail: "Specific Error" }, { status: 415 }),
        { once: true }
      )
    );

    renderWithProviders(<UploadModelPage />);

    const fileInput = screen.getByLabelText("Initial reference model:");

    Object.defineProperty(fileInput, "files", {
      value: [mrcFile],
    });

    fireEvent.click(screen.getByTestId("submit-.mrc"));

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
      http.post(
        "http://localhost/proposals/:propId/sessions/:sessionId/initialModel",
        () => HttpResponse.json({}, { status: 500 }),
        { once: true }
      )
    );

    renderWithProviders(<UploadModelPage />);

    const fileInput = screen.getByLabelText("Initial reference model:");

    Object.defineProperty(fileInput, "files", {
      value: [mrcFile],
    });

    fireEvent.click(screen.getByTestId("submit-.mrc"));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith({
        description: "Internal server error",
        status: "error",
        title: "Upload failed!",
      })
    );
  });
});
