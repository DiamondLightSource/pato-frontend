import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import { CTF } from "./ctf";
import React from "react";

describe("CTF", () => {
  it("should use tomogram domain for resolution when a tomogram is the parent", async () => {
    renderWithProviders(<CTF parentId={3} parentType="tomograms" />);
    await screen.findByText("10");
  });
});
