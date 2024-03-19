import { waitFor, screen, fireEvent } from "@testing-library/react";
import { rest } from "msw";
import { server } from "mocks/server";
import { renderWithRoute } from "utils/test-utils";
import { RelionReprocessing } from "./reprocessing";

const mockToast = jest.fn();

jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  createStandaloneToast: () => ({ toast: mockToast }),
}));

describe("SPA Reprocessing", () => {
  it("should not close when not successful", async () => {
    const reprocessingCallback = jest.fn();
    server.use(
      rest.post("http://localhost/dataCollections/1/reprocessing/spa", (req, res, ctx) =>
        res.once(ctx.status(500), ctx.json({ detail: "some error message" }), ctx.delay(0))
      )
    );

    renderWithRoute(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{ dosePerFrame: 1, pixelSize: 1, maximumDiameter: 1, minimumDiameter: 1 }}
        onClose={reprocessingCallback}
      />
    );

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(reprocessingCallback).not.toHaveBeenCalled();
  });

  it("should call close callback when successful", async () => {
    const reprocessingCallback = jest.fn();
    renderWithRoute(
      <RelionReprocessing
        defaultValues={{ dosePerFrame: 1, pixelSize: 1 }}
        collectionId={1}
        onClose={reprocessingCallback}
      />
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "Pixel Size (Å/pixel)" }), {
      target: { value: 2 },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Dose per Frame (e⁻/Å²)" }), {
      target: { value: 2 },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Minimum Diameter (Å)" }), {
      target: { value: 2 },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Maximum Diameter (Å)" }), {
      target: { value: 2 },
    });

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(reprocessingCallback).toHaveBeenCalled());
  });

  it("should display errors if not stopping after CTF estimation and diameters are not set", async () => {
    const reprocessingCallback = jest.fn();
    renderWithRoute(
      <RelionReprocessing
        defaultValues={{ dosePerFrame: 1, pixelSize: 1 }}
        collectionId={1}
        onClose={reprocessingCallback}
      />
    );

    fireEvent.click(screen.getByText("Submit"));
    const errors = await screen.findAllByText("Field is required");
    expect(errors).toHaveLength(2);
  });

  it("should clear errors if stopping after CTF estimation", async () => {
    const reprocessingCallback = jest.fn();
    renderWithRoute(
      <RelionReprocessing
        defaultValues={{ dosePerFrame: 1, pixelSize: 1 }}
        collectionId={1}
        onClose={reprocessingCallback}
      />
    );

    fireEvent.click(screen.getByText("Submit"));
    const errors = await screen.findAllByText("Field is required");
    expect(errors).toHaveLength(2);

    fireEvent.click(screen.getByRole("checkbox", { name: "Stop After CTF Estimation" }));
    await waitFor(() => expect(screen.queryByText("Field is required")).not.toBeInTheDocument());
  });

  it("should use provided default values", () => {
    renderWithRoute(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{ voltage: 200, pixelSize: 30, phasePlateUsed: true }}
        onClose={() => {}}
      />
    );

    expect(screen.getByRole("combobox", { name: /voltage \(kv\)/i })).toHaveValue("200");
    expect(screen.getByRole("spinbutton", { name: /pixel size \(å\/pixel\)/i })).toHaveValue("30");
  });

  it("should error instead of submitting if not all required fields are set", async () => {
    const reprocessingCallback = jest.fn();
    renderWithRoute(
      <RelionReprocessing collectionId={1} defaultValues={{}} onClose={reprocessingCallback} />
    );

    fireEvent.click(screen.getByText("Submit"));
    await screen.findAllByText("Field is required");
    await waitFor(() => expect(reprocessingCallback).not.toHaveBeenCalled());
  });

  it("should disable manual fields when stopping after CTF estimation", () => {
    const reprocessingCallback = jest.fn();
    renderWithRoute(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{ stopAfterCtfEstimation: true }}
        onClose={reprocessingCallback}
      />
    );

    expect(screen.getByRole("group", { name: /particle picking/i })).toHaveAttribute("disabled");
    expect(screen.getByRole("group", { name: /experiment/i })).not.toHaveAttribute("disabled");
  });

  it("should disable some manual fields when enabling auto calculation", () => {
    const reprocessingCallback = jest.fn();
    renderWithRoute(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{
          performCalculation: true,
          doClass2D: true,
          doClass3D: true,
          useCryolo: true,
        }}
        onClose={reprocessingCallback}
      />
    );

    expect(screen.getByRole("spinbutton", { name: "Box Size (Pixels)" })).toHaveAttribute(
      "readonly"
    );
    expect(screen.getByRole("spinbutton", { name: /mask diameter \(å\)/i })).toHaveAttribute(
      "readonly"
    );
  });

  it("should disable manual fields when stopping after CTF estimation (on checkbox interaction)", () => {
    const reprocessingCallback = jest.fn();
    renderWithRoute(
      <RelionReprocessing collectionId={1} defaultValues={{}} onClose={reprocessingCallback} />
    );

    fireEvent.click(screen.getByLabelText("Stop After CTF Estimation"));

    expect(screen.getByRole("group", { name: /particle picking/i })).toHaveAttribute("disabled");
    expect(screen.getByRole("group", { name: /experiment/i })).not.toHaveAttribute("disabled");
  });

  it("should autocalculate box size and mask diameter", async () => {
    const reprocessingCallback = jest.fn();
    renderWithRoute(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{ performCalculation: true }}
        onClose={reprocessingCallback}
      />
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "Maximum Diameter (Å)" }), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Pixel Size (Å/pixel)" }), {
      target: { value: "0.8" },
    });

    await waitFor(() =>
      expect(screen.getByRole("spinbutton", { name: "Box Size (Pixels)" })).toHaveValue("46")
    );
    expect(screen.getByRole("spinbutton", { name: /mask diameter \(å\)/i })).toHaveValue("33");
  });

  it("should not recalculate box size if pixel size is less or equal to 0", async () => {
    const reprocessingCallback = jest.fn();
    renderWithRoute(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{ performCalculation: true, maximumDiameter: 30 }}
        onClose={reprocessingCallback}
      />
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "Pixel Size (Å/pixel)" }), {
      target: { value: "0" },
    });

    await waitFor(() =>
      expect(screen.getByRole("spinbutton", { name: "Box Size (Pixels)" })).toHaveValue("")
    );
  });
});
