import { fireEvent, screen } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import { TomogramList } from "routes/TomogramList";

const defaultData = [
  {
    comments: "Tilt series: Position_1_1",
    dataCollectionId: 1,
    globalAlignmentQuality: 0.5,
    tomograms: 1,
    index: 1,
  },
];

describe("Tomogram List", () => {
  it("should render tomograms in list", async () => {
    renderWithRoute(<TomogramList />, () => ({
      data: defaultData,
      total: 1,
      limit: 30,
    }));

    await screen.findByText(/tilt series: position_1_1/i);
  });

  it("should display error when returned data is null", async () => {
    renderWithRoute(<TomogramList />, () => ({ data: null, total: 0 }));

    await screen.findByText("No Tomograms Found");
  });

  it("should not show pagination component if no tomograms are available", async () => {
    renderWithRoute(<TomogramList />, () => ({
      data: [],
      total: 0,
      limit: 30,
    }));

    await screen.findByText("No Tomograms Found");
    expect(screen.queryByText(/page 1 out of 0/i)).not.toBeInTheDocument();
  });

  it("should include sort key in URL when fields are updated", async () => {
    const { router } = renderWithRoute(<TomogramList />, () => ({ data: [] }));

    const sortBySelect = await screen.findByRole("combobox", { name: "Sort By" });
    fireEvent.change(sortBySelect, { target: { value: "dataCollectionId" } });

    expect(router.state.navigation.location!.search).toEqual("?sortBy=dataCollectionId");
  });

  it("should redirect user when tomogram is clicked", async () => {
    const { router } = renderWithRoute(<TomogramList />, () => ({
      data: defaultData,
      total: 1,
      limit: 30,
    }));

    const title = await screen.findByText(/tilt series: position_1_1/i);
    fireEvent.click(title);
    expect(router.state.navigation.location?.pathname).toEqual("/tomograms/1");
  });

  it("should include sorting key in redirect URL", async () => {
    const { router } = renderWithRoute(
      <TomogramList />,
      () => ({
        data: defaultData,
        total: 1,
        limit: 30,
      }),
      ["/?sortBy=globalAlignmentQuality"]
    );

    const title = await screen.findByText(/tilt series: position_1_1/i);
    fireEvent.click(title);
    expect(router.state.navigation.location?.pathname).toEqual("/tomograms/1");
    expect(router.state.navigation.location?.search).toEqual("?sortBy=globalAlignmentQuality");
  });
});
