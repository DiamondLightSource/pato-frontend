import { waitFor, screen, fireEvent } from "@testing-library/react";
import { rest } from "msw";
import { server } from "mocks/server";
import { renderWithProviders } from "utils/test-utils";
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

    renderWithProviders(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{ dosePerFrame: 1, pixelSize: 1 }}
        onClose={reprocessingCallback}
      />
    );

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(mockToast).toBeCalled());
    expect(reprocessingCallback).not.toBeCalled();
  });

  it("should call close callback when successful", async () => {
    const reprocessingCallback = jest.fn();
    renderWithProviders(
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

    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(reprocessingCallback).toBeCalled());
  });

  it("should use provided default values", () => {
    renderWithProviders(
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
    renderWithProviders(
      <RelionReprocessing collectionId={1} defaultValues={{}} onClose={reprocessingCallback} />
    );

    fireEvent.click(screen.getByText("Submit"));
    await screen.findAllByText("Field is required");
    await waitFor(() => expect(reprocessingCallback).not.toBeCalled());
  });

  it("should disable manual fields when stopping after CTF estimation", () => {
    const reprocessingCallback = jest.fn();
    renderWithProviders(
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
    renderWithProviders(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{ performCalculation: true }}
        onClose={reprocessingCallback}
      />
    );

    expect(screen.getByRole("spinbutton", { name: "Box Size (Pixels)" })).toHaveAttribute(
      "disabled"
    );
    expect(screen.getByRole("spinbutton", { name: /mask diameter \(å\)/i })).toHaveAttribute(
      "disabled"
    );
    expect(
      screen.getByRole("spinbutton", { name: /downsample box size \(pixels\)/i })
    ).toHaveAttribute("disabled");
  });

  it("should disable manual fields when stopping after CTF estimation (on checkbox interaction)", () => {
    const reprocessingCallback = jest.fn();
    renderWithProviders(
      <RelionReprocessing collectionId={1} defaultValues={{}} onClose={reprocessingCallback} />
    );

    fireEvent.click(screen.getByLabelText("Stop After CTF Estimation"));

    expect(screen.getByRole("group", { name: /particle picking/i })).toHaveAttribute("disabled");
    expect(screen.getByRole("group", { name: /experiment/i })).not.toHaveAttribute("disabled");
  });

  it("should disable some manual fields when enabling auto calculation (on checkbox interaction)", () => {
    const reprocessingCallback = jest.fn();
    renderWithProviders(
      <RelionReprocessing collectionId={1} defaultValues={{}} onClose={reprocessingCallback} />
    );

    fireEvent.click(screen.getByLabelText("Calculate for Me"));

    expect(screen.getByRole("spinbutton", { name: "Box Size (Pixels)" })).toHaveAttribute(
      "disabled"
    );
    expect(screen.getByRole("spinbutton", { name: /mask diameter \(å\)/i })).toHaveAttribute(
      "disabled"
    );
    expect(
      screen.getByRole("spinbutton", { name: /downsample box size \(pixels\)/i })
    ).toHaveAttribute("disabled");
  });
});
