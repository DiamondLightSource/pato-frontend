import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "mocks/server";
import { renderWithAccordion } from "utils/test-utils";
import { Tomogram } from "components/tomogram/main";
import { BaseProcessingJobProps } from "schema/interfaces";
import { components } from "schema/main";

const basicProcJob: BaseProcessingJobProps["procJob"] = {
  processingJobId: 1,
  dataCollectionId: 1,
  displayName: "Test",
  comments: "Test",
  recipe: "Test",
  automatic: 1,
};

const autoProcJob = {
  autoProcProgramId: 1,
} as components["schemas"]["AutoProcProgramResponse"];

const basicTomogram = { tomogramId: 1, dataCollectionId: 1, volumeFile: "", stackFile: "" };

describe("Tomogram", () => {
  beforeAll(() => {
    vi.spyOn(global, "scrollTo").mockImplementation(() => {});
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should only display motion correction if tomogram is not fully processed", async () => {
    server.use(
      http.get(
        "http://localhost/autoProc/:autoProcId/tomogram",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    renderWithAccordion(
      <Tomogram
        active={true}
        autoProc={autoProcJob}
        procJob={basicProcJob}
        tomogram={null}
        status={"Queued"}
        onTomogramOpened={() => {}}
      />
    );

    await screen.findByText("Motion Correction/CTF");
    expect(screen.queryByText("Alignment")).not.toBeInTheDocument();
  });

  it("should display tomogram if response is a valid tomogram", async () => {
    renderWithAccordion(
      <Tomogram
        active={true}
        autoProc={autoProcJob}
        procJob={basicProcJob}
        tomogram={basicTomogram}
        status={"Queued"}
        onTomogramOpened={() => {}}
      />
    );

    await screen.findByText("Alignment");
  });

  it("should fire callback when open movie button clicked", async () => {
    const openCallback = vi.fn();

    renderWithAccordion(
      <Tomogram
        active={true}
        autoProc={autoProcJob}
        procJob={basicProcJob}
        tomogram={basicTomogram}
        status={"Queued"}
        onTomogramOpened={openCallback}
      />
    );

    await screen.findByText("Alignment");

    fireEvent.click(screen.getByLabelText("Show Content"));
    fireEvent.click(await screen.findByRole("button", { name: "View Denoised" }));

    await waitFor(() => expect(openCallback).toHaveBeenCalledWith(1, "denoised"));
  });

  it("should show all tomograms on large screens", async () => {
    renderWithAccordion(
      <Tomogram
        active={true}
        autoProc={autoProcJob}
        procJob={basicProcJob}
        tomogram={basicTomogram}
        status={"Success"}
        onTomogramOpened={() => {}}
      />
    );

    fireEvent.click(screen.getByLabelText("Show Content"));

    expect(await screen.findByText("Segmented")).toBeInTheDocument();
    expect(await screen.findByText("Picked")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "View Segmented" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Picked" })).toBeInTheDocument();
  });

  it("should show tomogram selector on small screens", async () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderWithAccordion(
      <Tomogram
        active={true}
        autoProc={autoProcJob}
        procJob={basicProcJob}
        tomogram={basicTomogram}
        status={"Success"}
        onTomogramOpened={() => {}}
      />
    );

    fireEvent.click(screen.getByLabelText("Show Content"));

    const selectBox = await screen.findByRole("combobox");

    expect(selectBox).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);

    expect(screen.getByText("Segmented", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Segmented" })).toBeInTheDocument();

    fireEvent.change(selectBox, { target: { value: "picked" } });

    expect(screen.getByText("Picked", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Picked" })).toBeInTheDocument();
  });

  it("should render if autoprocessing program is null", async () => {
    renderWithAccordion(
      <Tomogram
        active={true}
        autoProc={null}
        procJob={basicProcJob}
        tomogram={null}
        status={"Queued"}
        onTomogramOpened={() => {}}
      />
    );

    await screen.findByText("Motion Correction/CTF");
  });
});
