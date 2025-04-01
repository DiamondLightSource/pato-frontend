import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import { DataCollectionCreationForm, SessionPage } from "./Session";
import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { mockToast } from "../../vitest.setup";

const mockNavigate = vi.fn();
const oldEnv = structuredClone(process.env);

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Session Page", () => {
  afterAll(() => {
    process.env = oldEnv;
  });

  it("should render session metadata headers", async () => {
    renderWithRoute(<SessionPage />, () => ({
      items: [],
      session: { microscopeName: "Krios I", startDate: "startDateValue", endDate: "endDateValue" },
    }));

    await screen.findByText(/krios i/i);
    expect(screen.getByText(/startDateValue/i)).toBeInTheDocument();
    expect(screen.getByText(/endDateValue/i)).toBeInTheDocument();
  });

  it("should navigate to the clicked group's path when table row clicked", async () => {
    renderWithRoute(<SessionPage />, () => ({
      items: [{ experimentTypeName: "Tomogram", dataCollectionGroupId: 1 }],
      session: { microscopeName: "Krios I", startDate: "startDateValue", endDate: "endDateValue" },
    }));

    const row = await screen.findByText(/tomogram/i);

    fireEvent.click(row);

    expect(mockNavigate).toHaveBeenCalledWith("groups/1/tomograms/1", { relative: "path" });
  });

  it("should disable 'edit sample information' button if no sample handling service is provided", async () => {
    process.env.REACT_APP_API_ENDPOINT = undefined;

    renderWithRoute(<SessionPage />, () => ({
      items: [],
      session: { microscopeName: "Krios I", startDate: "startDateValue", endDate: "endDateValue" },
    }));

    const link = await screen.findByText("Edit sample information");
    expect(link.parentNode?.parentNode?.parentNode).toHaveAttribute("aria-disabled");
  });

  it("should disable 'submit feedback' button if no feedback URL is provided", async () => {
    process.env.REACT_APP_FEEDBACK_URL = undefined;

    renderWithRoute(<SessionPage />, () => ({
      items: [],
      session: { microscopeName: "Krios I", startDate: "startDateValue", endDate: "endDateValue" },
    }));

    const link = await screen.findByText("Submit Feedback");
    expect(link.parentNode?.parentNode?.parentNode).toHaveAttribute("aria-disabled");
  });

  it("should display link to atlas if data collection group has atlas", async () => {
    renderWithRoute(<SessionPage />, () => ({
      items: [{ experimentTypeName: "Tomogram", dataCollectionGroupId: 1, atlasId: 5 }],
      session: { microscopeName: "Krios I", startDate: "startDateValue", endDate: "endDateValue" },
    }));

    const atlasButton = await screen.findByText("View Atlas");

    expect(atlasButton).toHaveAttribute("href", "/groups/1/atlas");
  });

  it("should not display link to atlas if data collection group has no atlas", async () => {
    renderWithRoute(<SessionPage />, () => ({
      items: [{ experimentTypeName: "Tomogram", dataCollectionGroupId: 1 }],
      session: { microscopeName: "Krios I", startDate: "startDateValue", endDate: "endDateValue" },
    }));

    await screen.findByText("Tomogram");

    expect(screen.queryByText("View Atlas")).not.toBeInTheDocument();
  });
});

describe("Data Collection Creation", () => {
  it("should display toast if unsuccessful", async () => {
    server.use(
      http.post(
        "http://localhost/proposals/:propId/sessions/:sessionId/dataCollections",
        () => HttpResponse.json({ detail: "Error message here" }, { status: 404 }),
        { once: true }
      )
    );

    renderWithRoute(<DataCollectionCreationForm onClose={() => {}} isOpen={true} />);

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ description: "Error message here" })
      )
    );
  });

  it("should display toast and close modal if successful", async () => {
    const onCloseMock = vi.fn();

    renderWithRoute(<DataCollectionCreationForm onClose={onCloseMock} isOpen={true} />);

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Successfully created data collection!" })
      )
    );
    expect(onCloseMock).toHaveBeenCalled();
  });
});
