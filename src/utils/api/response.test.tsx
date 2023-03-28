import { downloadBuffer } from "./response";
import { screen } from "@testing-library/react";

describe("Response", () => {
  // Testing for other things is not so productive, as downloading deals in side effects
  // rather than explicitly exposing points to be tested
  
  it("cleans up element after download", async () => {
    const content = new Uint8Array([10,10,10,10]);
    downloadBuffer(content.buffer, "image/png")
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  });
});
