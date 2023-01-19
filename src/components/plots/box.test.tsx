import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import { Box } from "./box";

describe("Box Plot", () => {
  it("should render graph", () => {
    renderWithProviders(
      <Box data={[{ min: 1, max: 10, median: 5, q1: 3, q3: 6, label: "test" }]} width={100} height={100} />
    );
    expect(screen.getAllByText("test").length).toBe(2);
  });

  it("should render multiple boxes", () => {
    renderWithProviders(
      <Box
        data={[
          { min: 1, max: 10, median: 5, q1: 3, q3: 6, label: "test" },
          { min: 1, max: 10, median: 5, q1: 3, q3: 6, label: "test2" },
        ]}
        width={100}
        height={100}
      />
    );
    expect(screen.getAllByTestId("box-item").length).toBe(2);
  });

  it("should render axis labels", () => {
    renderWithProviders(
      <Box
        data={[{ min: 1, max: 10, median: 5, q1: 3, q3: 6, label: "test" }]}
        options={{ y: { label: "axis label" } }}
        width={100}
        height={100}
      />
    );
    expect(screen.getByText("axis label")).toBeInTheDocument();
  });

  it("should display tooltip when datapoint is hovered", async () => {
    renderWithProviders(
      <Box data={[{ min: 1, max: 10, median: 5, q1: 3, q3: 6, label: "test" }]} width={100} height={100} />
    );
    const box = screen.getByLabelText("box");
    fireEvent.mouseOver(box);

    await waitFor(() => expect(screen.getByLabelText("box title")).toHaveTextContent("test"));
  });

  it("should hide tooltip when mouse leaves box", async () => {
    renderWithProviders(
      <Box data={[{ min: 1, max: 10, median: 5, q1: 3, q3: 6, label: "test" }]} width={100} height={100} />
    );
    const box = screen.getByLabelText("box");
    fireEvent.mouseOver(box);

    await waitFor(() => expect(screen.getByLabelText("box title")).toHaveTextContent("test"));

    fireEvent.mouseLeave(box);
    await waitFor(() => expect(screen.queryByLabelText("box title")).not.toBeInTheDocument());
  });

  it("should calculate domain when no domain is given", () => {
    renderWithProviders(
      <Box
        data={[
          { min: 3, max: 10, median: 5, q1: 3, q3: 6, label: "test" },
          { min: 1, max: 90, median: 5, q1: 3, q3: 6, label: "test2" },
        ]}
        width={100}
        height={100}
      />
    );

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getAllByText("100").length).toBe(2);
  });

  it("should use domain when provided", () => {
    renderWithProviders(
      <Box
        data={[
          { min: 3, max: 10, median: 5, q1: 3, q3: 6, label: "test" },
          { min: 1, max: 90, median: 5, q1: 3, q3: 6, label: "test2" },
        ]}
        options={{ y: { domain: { min: 0, max: 5 } } }}
        width={100}
        height={100}
      />
    );

    expect(screen.getByText("0.0")).toBeInTheDocument();
    expect(screen.getAllByText("5.0").length).toBe(2);
  });

  it("should not render outside domain boundaries", () => {
    renderWithProviders(
      <Box
        data={[{ min: 60, max: 90, median: 65, q1: 61, q3: 70, label: "test" }]}
        options={{ y: { domain: { min: 0, max: 5 } } }}
        width={100}
        height={100}
      />
    );

    expect(screen.queryByTestId("box-item")).not.toBeInTheDocument();
  });
});
