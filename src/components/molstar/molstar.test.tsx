import MolstarWrapper from "components/molstar/molstar";
import { renderWithProviders } from "utils/test-utils";
import { screen } from "@testing-library/react";

jest.mock("molstar/lib/mol-canvas3d/canvas3d");
jest.mock("molstar/lib/mol-plugin/context");
jest.mock("molstar/lib/mol-plugin/spec");

describe("Molstar Wrapper", () => {
  afterAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should display message if no volume file is available", async () => {
    renderWithProviders(<MolstarWrapper autoProcId={1} classId={1} />);
    await screen.findByText("No Valid Volume File");
  });
});
