import { fireEvent, screen } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import { SpaPage } from "./SPA";

const job = {
  AutoProcProgram: {
    autoProcProgramId: 1,
  },
  ProcessingJob: {
    processingJobId: 1,
    dataCollectionId: 1,
    displayName: "",
    comments: "",
    recipe: "em-process-class2d",
  },
  status: "Submitted",
};

const baseLoaderData = {
  collection: { dataCollectionId: 1, imageDirectory: "/dls/test", info: [] },
  jobs: [job],
  allowReprocessing: true,
  jobParameters: { items: [] },
};

vi.mock("components/spa/statistics", () => ({
  default: () => <p>Statistics Page</p>,
}));

describe("SPA", () => {
  it("should display warning if no jobs are available", async () => {
    renderWithRoute(<SpaPage />, () => ({ ...baseLoaderData, jobs: [] }));

    await screen.findByText("No Single Particle Analysis Data Available");
  });

  it("should display jobs if they are available", async () => {
    renderWithRoute(<SpaPage />, () => baseLoaderData);

    await screen.findByText(/ctf/i);
  });

  it("should display statistics tab if hash is in URL", async () => {
    renderWithRoute(<SpaPage />, () => baseLoaderData, [{ hash: "#statistics" }]);

    await screen.findByText("Statistics Page");
  });

  it("should grey out atlas button if no atlas is returned from the backend", async () => {
    renderWithRoute(<SpaPage />, () => ({ ...baseLoaderData, hasAtlas: false }));

    const viewAtlasButton = await screen.findByText("Atlas");
    expect(viewAtlasButton).toHaveAttribute("disabled");
  });

  it("should not grey out atlas button if atlas is returned from the backend", async () => {
    renderWithRoute(<SpaPage />, () => ({ ...baseLoaderData, hasAtlas: true }));

    const viewAtlasButton = await screen.findByText("Atlas");
    expect(viewAtlasButton).not.toHaveAttribute("disabled");
  });

  it("should go tab if tab clicked", async () => {
    renderWithRoute(<SpaPage />, () => baseLoaderData);

    fireEvent.click(await screen.findByText("Collection Statistics"));
    await screen.findByText("Statistics Page");

    fireEvent.click(screen.getByText("Processing Jobs"));
    await screen.findByText(/ctf/i);
  });
});
