import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithRoute } from "../utils/test-utils";
import { TomogramPage } from "./Tomogram";
import { getTomogramData } from "../utils/loaders/tomogram";
import { CollectionData } from "../schema/interfaces";

type LoaderReturn = Awaited<ReturnType<typeof getTomogramData>>;

const searchMap = new Map();

searchMap.set("onlyTomograms", false);

const mockParams = jest.fn();
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [searchMap, mockParams],
}));

const validData = {
  collection: {
    info: [],
    dataCollectionId: 1,
    comments: "Tilt Align 1",
    fileTemplate: "?",
    imageDirectory: "?",
  } as CollectionData,
  total: 2,
  page: 1,
  jobs: [{ ProcessingJob: { processingJobId: 123 }, AutoProcProgram: { autoProcProgramId: 1 }, status: "Successful" }],
} as LoaderReturn;

const invalidJob = {
  collection: { info: [], comments: "Tilt Align 1", fileTemplate: "?", imageDirectory: "?" } as CollectionData,
  total: 1,
  page: 1,
  jobs: null,
} as LoaderReturn;

describe("Tomogram Page", () => {
  /*
  it("should allow reprocessing if collection has tomogram", async () => {
    renderWithRoute(<TomogramPage />, () => validData);
    await screen.findByText("Tilt Align 1");
    expect(screen.getByRole("button", { name: /run reprocessing/i })).not.toHaveAttribute("disabled");
  });

  
  it("should display reprocessing modal when button is clicked", async () => {
    renderWithRoute(<TomogramPage />, () => validData);
    await screen.findByText("Tilt Align 1");
    fireEvent.click(screen.getByRole("button", { name: /run reprocessing/i }));

    await screen.findByText("Reprocessing");
  });
  */

  it("should change page when next page button is clicked", async () => {
    renderWithRoute(<TomogramPage />, () => validData);
    await screen.findByText("Tilt Align 1");
    fireEvent.click(await screen.findByLabelText("Next Page"));

    await waitFor(() => expect(mockNavigate).toBeCalledWith("../2?onlyTomograms=false", {"relative": "path"}));
  });

  it("should change search parameters when tomogram filter updates", async () => {
    renderWithRoute(<TomogramPage />, () => validData);
    await screen.findByText("Tilt Align 1");
    fireEvent.click(screen.getByTestId("filter-tomograms"));

    await waitFor(() => expect(mockParams).toBeCalledWith({ onlyTomograms: "true" }));
  });

  it("should not allow reprocessing if collection doesn't have a tomogram", async () => {
    renderWithRoute(<TomogramPage />, () => invalidJob);
    await screen.findByText("Tilt Align 1");
    expect(screen.getByRole("button", { name: /run reprocessing/i })).toHaveAttribute("disabled");
  });

  /*
  it("should not allow reprocessing if collection has more than 2 processed tomograms", async () => {
  });
  
  it("should not allow reprocessing if collection has no processed tomograms", async () => {
  });*/
});
