import { waitFor, screen, fireEvent } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "mocks/server";
import { renderWithRoute } from "utils/test-utils";
import { RelionReprocessing } from "./reprocessing";
import { mockToast } from "../../../vitest.setup";

describe("SPA Reprocessing", () => {
  it("should not close when not successful", async () => {
    const reprocessingCallback = vi.fn();
    server.use(
      http.post(
        "http://localhost/dataCollections/1/reprocessing/spa",
        () => HttpResponse.json({ detail: "some error message" }, { status: 500 }),
        { once: true }
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
    const reprocessingCallback = vi.fn();
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
    renderWithRoute(
      <RelionReprocessing
        defaultValues={{ dosePerFrame: 1, pixelSize: 1 }}
        collectionId={1}
        onClose={() => {}}
      />
    );

    fireEvent.click(screen.getByText("Submit"));
    const errors = await screen.findAllByText("Field is required");
    expect(errors).toHaveLength(2);
  });

  it("should clear errors if stopping after CTF estimation", async () => {
    renderWithRoute(
      <RelionReprocessing
        defaultValues={{ dosePerFrame: 1, pixelSize: 1 }}
        collectionId={1}
        onClose={() => {}}
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
    const reprocessingCallback = vi.fn();
    renderWithRoute(
      <RelionReprocessing collectionId={1} defaultValues={{}} onClose={reprocessingCallback} />
    );

    fireEvent.click(screen.getByText("Submit"));
    await screen.findAllByText("Field is required");
    await waitFor(() => expect(reprocessingCallback).not.toHaveBeenCalled());
  });

  it("should disable manual fields when stopping after CTF estimation", () => {
    renderWithRoute(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{ stopAfterCtfEstimation: true }}
        onClose={() => {}}
      />
    );

    expect(screen.getByRole("group", { name: /particle picking/i })).toHaveAttribute("disabled");
    expect(screen.getByRole("group", { name: /experiment/i })).not.toHaveAttribute("disabled");
  });

  it("should disable some manual fields when enabling auto calculation", () => {
    renderWithRoute(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{
          performCalculation: true,
          doClass2D: true,
          doClass3D: true,
          useCryolo: true,
        }}
        onClose={() => {}}
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
    renderWithRoute(<RelionReprocessing collectionId={1} defaultValues={{}} onClose={() => {}} />);

    fireEvent.click(screen.getByLabelText("Stop After CTF Estimation"));

    expect(screen.getByRole("group", { name: /particle picking/i })).toHaveAttribute("disabled");
    expect(screen.getByRole("group", { name: /experiment/i })).not.toHaveAttribute("disabled");
  });

  it("should autocalculate box size and mask diameter", async () => {
    renderWithRoute(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{ performCalculation: true }}
        onClose={() => {}}
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
    renderWithRoute(
      <RelionReprocessing
        collectionId={1}
        defaultValues={{ performCalculation: true, maximumDiameter: 30 }}
        onClose={() => {}}
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
