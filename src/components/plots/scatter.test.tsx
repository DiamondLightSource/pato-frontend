import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import { Scatter } from "./scatter";

describe("Scatter Plot", () => {
  it("should render graph", () => {
    renderWithProviders(<Scatter data={[{ x: 1, y: 1 }]} width={100} height={100} />);
    expect(screen.getByTestId("dot")).toBeInTheDocument();
  });

  it("should render graph with multiple points", () => {
    renderWithProviders(
      <Scatter
        data={[
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ]}
        width={100}
        height={100}
      />
    );
    expect(screen.getAllByTestId("dot").length).toBe(2);
  });

  it("should render axis labels", () => {
    renderWithProviders(
      <Scatter
        data={[
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ]}
        options={{ x: { label: "test" } }}
        width={100}
        height={100}
      />
    );
    expect(screen.getAllByText("test").length).toBe(2);
  });

  it("should display tooltip when datapoint is hovered", async () => {
    renderWithProviders(<Scatter data={[{ x: 522, y: 999 }]} width={100} height={100} />);
    fireEvent.mouseMove(screen.getByLabelText("graph"), { clientX: 65, clientY: 35 });

    await waitFor(() => expect(screen.getByLabelText("tooltip x")).toHaveTextContent("x: 522"));
  });

  it("should hide tooltip after mouse leaves the Voronoi bounds for point", async () => {
    renderWithProviders(<Scatter data={[{ x: 522, y: 999 }]} width={100} height={100} />);
    const graph = screen.getByLabelText("graph");

    fireEvent.mouseMove(graph, { clientX: 65, clientY: 35 });

    await waitFor(() => {
      expect(screen.getByLabelText("tooltip x")).toBeInTheDocument();
    });

    fireEvent.mouseLeave(graph);

    await waitFor(() => expect(screen.queryByLabelText("tooltip x")).not.toBeInTheDocument(), { timeout: 3000 });
  });

  it("should use X axis provided by the configuration", () => {
    renderWithProviders(
      <Scatter
        data={[{ x: 522, y: 999 }]}
        options={{ x: { domain: { min: 0, max: 20 } } }}
        width={1000}
        height={1000}
      />
    );

    expect(screen.getAllByText("20").length).toBe(2);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should use Y axis provided by the configuration", () => {
    renderWithProviders(
      <Scatter
        data={[{ x: 522, y: 999 }]}
        options={{ y: { domain: { min: 0, max: 20 } } }}
        width={1000}
        height={1000}
      />
    );

    expect(screen.getAllByText("20").length).toBe(2);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should not render outside domain boundaries", () => {
    renderWithProviders(
      <Scatter
        data={[{ x: 522, y: 999 }]}
        options={{ x: { domain: { min: 0, max: 20 } } }}
        width={1000}
        height={1000}
      />
    );

    expect(screen.queryByTestId("dot")).not.toBeInTheDocument();
  });
});
