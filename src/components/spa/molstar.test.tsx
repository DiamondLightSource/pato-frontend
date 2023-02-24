import MolstarWrapper from "./molstar";
import { renderWithProviders } from "../../utils/test-utils";
import { screen } from "@testing-library/react";

describe("Molstar Wrapper", () => {
  window.URL.createObjectURL = jest.fn();
  it("should display message if no volume file is available", async () => {
    renderWithProviders(<MolstarWrapper autoProcId={1} classificationId={1} />);

    await screen.findByText("No Volume File Available");
  });
});
