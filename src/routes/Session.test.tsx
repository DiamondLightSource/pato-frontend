import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import { DataCollectionCreationForm, SessionPage } from "./Session";
import { server } from "mocks/server";
import { rest } from "msw";

const mockNavigate = jest.fn();
const mockToast = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  useToast: () => mockToast,
}));

describe("Session Page", () => {
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
});

describe("Data Collection Creation", () => {
  it("should display toast if unsuccessful", async () => {
    server.use(
      rest.post(
        "http://localhost/proposals/:propId/sessions/:sessionId/dataCollections",
        (req, res, ctx) => res.once(ctx.status(404), ctx.json({ detail: "Error message here" }))
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
    const onCloseMock = jest.fn();

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
