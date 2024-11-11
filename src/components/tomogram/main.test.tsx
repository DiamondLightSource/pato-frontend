import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "mocks/server";
import { renderWithAccordion } from "utils/test-utils";
import { Tomogram } from "components/tomogram/main";
import { BaseProcessingJobProps } from "schema/interfaces";

const basicProcJob: BaseProcessingJobProps["procJob"] = {
  processingJobId: 1,
  dataCollectionId: 1,
  displayName: "Test",
  comments: "Test",
  recipe: "Test",
  automatic: 1,
};

const basicTomogram = { tomogramId: 1, dataCollectionId: 1, volumeFile: "", stackFile: "" };

describe("Tomogram", () => {
  beforeAll(() => {
    vi.spyOn(global, "scrollTo").mockImplementation(() => {});
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
        autoProc={{ autoProcProgramId: 1 }}
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
        autoProc={{ autoProcProgramId: 1 }}
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
        autoProc={{ autoProcProgramId: 1 }}
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
