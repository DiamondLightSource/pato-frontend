import { Tomogram } from "./main";
import { renderWithProviders } from "../../utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Accordion } from "@chakra-ui/react";

describe("Tomogram", () => {
  window.URL.createObjectURL = jest.fn();

  it("should display tomogram title (comment) correctly", () => {
    renderWithProviders(
      <Accordion>
        <Tomogram collection={1} title={"Tomogram 1"} tomogram={{ tomogramId: 1, info: [] }} />
      </Accordion>
    );

    expect(screen.getByText("Tomogram 1")).toBeInTheDocument();
  });

  it("should only display motion correction if no tomogram exists", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram collection={1} title={"Tomogram 1"} tomogram={null} />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByText("Tomogram 1")).toBeInTheDocument();
    });

    expect(screen.queryByText("Defocus")).toBeNull();
  });

  it("should display placeholder title when no title is provided", () => {
    renderWithProviders(
      <Accordion>
        <Tomogram collection={1} title={null} tomogram={{ tomogramId: 1, info: [] }} />
      </Accordion>
    );

    expect(screen.getByText("No Title Provided")).toBeInTheDocument();
  });

  it("should update refined tilt axis from motion data", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram
          collection={1}
          title={null}
          tomogram={{ tomogramId: 3, info: [{ label: "Refined Tilt Axis", value: "?" }] }}
        />
      </Accordion>
    );

    const nextButton = await screen.findByRole("button", { name: "<" }, { timeout: 3000 });
    fireEvent.click(nextButton);

    await expect(screen.findByText("958")).resolves.toBeInTheDocument();
  });

  it("should display tomogram info", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram
          title={"Tomogram 1"}
          collection={1}
          tomogram={{ tomogramId: 1, info: [{ label: "testLabel", value: "testValue" }] }}
        />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByText("testLabel:")).toBeInTheDocument();
    });

    expect(screen.getByText("testValue")).toBeInTheDocument();
  });

  it("should display astigmatism/defocus/resolution data when done loading", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram
          collection={1}
          title={"Tomogram 1"}
          tomogram={{ tomogramId: 3, info: [{ label: "testLabel", value: "testValue" }] }}
        />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByText("Defocus")).toBeInTheDocument();
    });
  });
});
