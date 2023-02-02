import { Tomogram } from "./main";
import { renderAccordionItem } from "../../utils/test-utils";
import { fireEvent, screen } from "@testing-library/react";

describe("Tomogram", () => {
  window.URL.createObjectURL = jest.fn();

  it("should update refined tilt axis from motion data", async () => {
    renderAccordionItem(
      <Tomogram title={"Test"} tomogram={{ tomogramId: 3, info: [{ label: "Refined Tilt Axis", value: "?" }] }} />
    );

    const nextButton = await screen.findByLabelText("Previous Page", {}, { timeout: 3000 });
    fireEvent.click(nextButton);

    await expect(screen.findByText("958 °")).resolves.toBeInTheDocument();
  });

  it("should display tomogram info", async () => {
    renderAccordionItem(
      <Tomogram title={"Tomogram 1"} tomogram={{ tomogramId: 1, info: [{ label: "testLabel", value: "testValue" }] }} />
    );

    await screen.findByText("testLabel:");

    expect(screen.getByText("testValue")).toBeInTheDocument();
  });

  it("should display astigmatism/defocus/resolution data when done loading", async () => {
    renderAccordionItem(
      <Tomogram title={"Tomogram 1"} tomogram={{ tomogramId: 3, info: [{ label: "testLabel", value: "testValue" }] }} />
    );

    await screen.findByText("Defocus", {}, { timeout: 3000 });
  });
});
