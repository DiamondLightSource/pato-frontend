import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import { TomogramPage } from "routes/Tomogram";
import { TomogramResponse } from "loaders/tomogram";
import { CollectionData } from "schema/interfaces";
import { ApngProps } from "components/visualisation/apng";
import { TomogramProps } from "components/tomogram/main";
import { AccordionItem } from "@chakra-ui/react";

type LoaderReturn = Awaited<TomogramResponse>;

const searchMap = new Map();
searchMap.set("onlyTomograms", false);

jest.mock("components/visualisation/apng", () => (props: ApngProps) => <p>{props.src}</p>);
jest.mock("components/tomogram/main", () => ({
  Tomogram: (props: TomogramProps) => (
    <AccordionItem>
      <button onClick={() => props.onTomogramOpened(1)} data-testid='view movie' />
    </AccordionItem>
  ),
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
  tomograms: [
    {
      Tomogram: { tomogramId: 1 },
      ProcessingJob: { processingJobId: 123 },
      AutoProcProgram: { autoProcProgramId: 1 },
      status: "Successful",
    },
  ],
} as LoaderReturn;

const secondValidData = {
  ...validData,
  tomograms: [
    {
      ...validData.tomograms![0],
      Tomogram: { tomogramId: 2 },
    },
  ],
} as LoaderReturn;

const noTomogramData = {
  ...validData,
  tomograms: [
    {
      ...validData.tomograms![0],
      Tomogram: undefined,
    },
  ],
} as LoaderReturn;

const invalidJob = {
  collection: {
    info: [],
    comments: "Tilt Align 1",
    fileTemplate: "?",
    imageDirectory: "?",
  } as CollectionData,
  total: 1,
  page: 1,
  tomograms: null,
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
    const { router } = renderWithRoute(<TomogramPage />, () => validData);
    await screen.findByText("Tilt Align 1");
    fireEvent.click(await screen.findByLabelText("Next Page"));

    await waitFor(() => expect(router.state.navigation.location?.pathname).toBe("/2"));

    /*await waitFor(() =>
      expect(mockNavigate).toBeCalledWith({ pathname: "../2", search: "onlyTomograms=false" }, { relative: "path" })
    );*/
  });

  it("should change search parameters when tomogram filter updates", async () => {
    const { router } = renderWithRoute(<TomogramPage />, () => validData);
    await screen.findByText("Tilt Align 1");
    fireEvent.click(screen.getByTestId("filter-tomograms"));

    await waitFor(() =>
      expect(router.state.navigation.location?.search).toBe("?onlyTomograms=true")
    );

    //await waitFor(() => expect(mockParams).toBeCalledWith({ onlyTomograms: "true" }));
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

describe("Tomogram Movie Modal", () => {
  it("should go to next page if button in movie modal is clicked", async () => {
    const { router } = renderWithRoute(<TomogramPage />, () => validData);
    await screen.findByText("Tilt Align 1");
    fireEvent.click(await screen.findByTestId(/view movie/i));

    await screen.findAllByText("tomograms/1/movie");

    fireEvent.click(screen.getByRole("button", { name: /next page/i }));

    await waitFor(() => expect(router.state.navigation.location?.pathname).toBe("/2"));
  });

  it("should display next tomogram movie if modal is open and next page is clicked", async () => {
    renderWithRoute(<TomogramPage />, ({ request }) =>
      request.url.includes("2") ? secondValidData : validData
    );
    await screen.findByText("Tilt Align 1");
    fireEvent.click(await screen.findByTestId(/view movie/i));

    await screen.findAllByText("tomograms/1/movie");

    fireEvent.click(screen.getByRole("button", { name: /next page/i }));

    await screen.findAllByText("tomograms/2/movie");
  });

  it("should close modal if most recent processing job is not a processed tomogram", async () => {
    renderWithRoute(<TomogramPage />, ({ request }) =>
      request.url.includes("2") ? noTomogramData : validData
    );
    await screen.findByText("Tilt Align 1");
    fireEvent.click(await screen.findByTestId(/view movie/i));

    await screen.findAllByText("tomograms/1/movie");

    fireEvent.click(screen.getByRole("button", { name: /next page/i }));

    await waitFor(() => expect(screen.queryByText("tomograms/1/movie")).not.toBeInTheDocument());
  });
});
