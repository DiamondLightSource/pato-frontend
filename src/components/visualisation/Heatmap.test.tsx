import { renderWithProviders } from "utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { HeatmapOptions, HeatmapOverlay } from "components/visualisation/Heatmap";

const baseOptions: HeatmapOptions = { label: "test label (nm)", type: "linear", binCount: 5 };
const baseItems = [{ x: 0, y: 0, id: 1, diameter: 10, value: 0 }];

describe("Heatmap", () => {
  it("should apply white border to selected item", async () => {
    renderWithProviders(
      <HeatmapOverlay selectedItem={1} image='' options={baseOptions} items={baseItems} />
    );

    const item = await screen.findByRole("button");
    fireEvent.click(item);
    expect(item).toHaveAttribute("stroke", "white");
  });

  it("should fire callback if non-null item clicked", async () => {
    const itemCallback = vi.fn();
    renderWithProviders(
      <HeatmapOverlay
        selectedItem={1}
        image=''
        options={baseOptions}
        items={baseItems}
        onItemClicked={itemCallback}
      />
    );

    const item = await screen.findByRole("button");
    fireEvent.click(item);
    expect(itemCallback).toBeCalledWith(1);
  });

  it("should hide null items if hideNull is set", async () => {
    const itemCallback = vi.fn();
    renderWithProviders(
      <HeatmapOverlay
        hideNull={true}
        selectedItem={1}
        image=''
        options={baseOptions}
        items={[...baseItems, { x: 0, y: 0, id: 2, diameter: 10, value: null }]}
        onItemClicked={itemCallback}
      />
    );

    await waitFor(() =>
      expect(screen.getByTestId("item-1")).toHaveAttribute("visibility", "hidden")
    );
  });

  it("should calculate bins based on log progression if log is set", async () => {
    const itemCallback = vi.fn();
    renderWithProviders(
      <HeatmapOverlay
        selectedItem={1}
        image=''
        options={{ ...baseOptions, type: "log" }}
        items={[...baseItems, { x: 0, y: 0, id: 2, diameter: 10, value: 10000 }]}
        onItemClicked={itemCallback}
      />
    );

    await screen.findByText("999.1");
  });

  it("should display rectangles if passed items are rectangles", async () => {
    const itemCallback = vi.fn();
    renderWithProviders(
      <HeatmapOverlay
        selectedItem={1}
        image=''
        options={baseOptions}
        items={[{ x: 0, y: 0, id: 2, angle: 10, width: 10, height: 20, value: 10000 }]}
        onItemClicked={itemCallback}
      />
    );

    const rectangle = await screen.findByTestId("item-0");
    expect(rectangle).toHaveAttribute("width", "10");
  });

  it("should display circles if passed items are circles", async () => {
    const itemCallback = vi.fn();
    renderWithProviders(
      <HeatmapOverlay
        selectedItem={1}
        image=''
        options={baseOptions}
        items={baseItems}
        onItemClicked={itemCallback}
      />
    );

    const circle = await screen.findByTestId("item-0");
    expect(circle).toHaveAttribute("r", "5");
  });

  it("should not display bins if all values are null", async () => {
    const itemCallback = vi.fn();
    renderWithProviders(
      <HeatmapOverlay
        selectedItem={1}
        image=''
        options={baseOptions}
        items={[{ ...baseItems[0], value: null }]}
        onItemClicked={itemCallback}
      />
    );

    await screen.findByTestId("item-0");
    expect(screen.queryByText("test label (nm)")).not.toBeInTheDocument();
  });

  it("should calculate bins based on linear progression if linear is set", async () => {
    const itemCallback = vi.fn();
    renderWithProviders(
      <HeatmapOverlay
        selectedItem={1}
        image=''
        options={baseOptions}
        items={[...baseItems, { x: 0, y: 0, id: 2, diameter: 10, value: 10000 }]}
        onItemClicked={itemCallback}
      />
    );

    await screen.findByText("7500.0");
  });

  it("should use autocalculated max if min is greater than user-supplied max", async () => {
    const itemCallback = vi.fn();
    renderWithProviders(
      <HeatmapOverlay
        selectedItem={1}
        image=''
        options={{ ...baseOptions, max: 0 }}
        items={[
          { ...baseItems[0], value: 1 },
          { ...baseItems[0], id: 2, value: 10000 },
        ]}
        onItemClicked={itemCallback}
      />
    );

    await screen.findByText("4999.5");
  });
});
