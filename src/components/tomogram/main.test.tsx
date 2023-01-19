import { Tomogram } from "./main";
import { renderWithProviders } from "../../utils/test-utils";
import { fireEvent, screen } from "@testing-library/react";

describe("Tomogram", () => {
  window.URL.createObjectURL = jest.fn();

  it("should display tomogram title (comment) correctly", () => {
    renderWithProviders(<Tomogram collection={1} title={"Tomogram 1"} tomogram={{ tomogramId: 1, info: [] }} />);

    expect(screen.getByText("Tomogram 1")).toBeInTheDocument();
  });

  it("should only display motion correction if no tomogram exists", async () => {
    renderWithProviders(<Tomogram collection={1} title={"Tomogram 1"} tomogram={null} />);

    await screen.findByText("Tomogram 1");

    expect(screen.queryByText("Defocus")).toBeNull();
  });

  it("should display placeholder title when no title is provided", () => {
    renderWithProviders(<Tomogram collection={1} title={null} tomogram={{ tomogramId: 1, info: [] }} />);

    expect(screen.getByText("No Title Provided")).toBeInTheDocument();
  });

  it("should update refined tilt axis from motion data", async () => {
    renderWithProviders(
      <Tomogram
        collection={1}
        title={null}
        tomogram={{ tomogramId: 3, info: [{ label: "Refined Tilt Axis", value: "?" }] }}
      />
    );

    const nextButton = await screen.findByRole("button", { name: "<" }, { timeout: 3000 });
    fireEvent.click(nextButton);

    await expect(screen.findByText("958")).resolves.toBeInTheDocument();
  });

  it("should display tomogram info", async () => {
    renderWithProviders(
      <Tomogram
        title={"Tomogram 1"}
        collection={1}
        tomogram={{ tomogramId: 1, info: [{ label: "testLabel", value: "testValue" }] }}
      />
    );

    await screen.findByText("testLabel:");

    expect(screen.getByText("testValue")).toBeInTheDocument();
  });

  it("should display astigmatism/defocus/resolution data when done loading", async () => {
    renderWithProviders(
      <Tomogram
        collection={1}
        title={"Tomogram 1"}
        tomogram={{ tomogramId: 3, info: [{ label: "testLabel", value: "testValue" }] }}
      />
    );

    await screen.findByText("Defocus");
  });
});
