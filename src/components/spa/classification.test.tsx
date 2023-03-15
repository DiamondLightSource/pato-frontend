import { Classification } from "components/spa/classification";
import { renderWithProviders } from "utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { server } from "mocks/server";

describe("Classification", () => {
  window.URL.createObjectURL = jest.fn();
  it("should display first page as default", async () => {
    renderWithProviders(<Classification autoProcId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("155");
    });

    expect(screen.getByLabelText("Current Page")).toHaveValue("1");
  });

  it("should update information when new class is selected (2d)", async () => {
    renderWithProviders(<Classification autoProcId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("155");
    });

    const newClass = screen.getAllByLabelText("Image Title")[1];
    fireEvent.click(newClass);

    await waitFor(() => expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("355"));
  });

  it("should update query when different sort type is selected", async () => {
    renderWithProviders(<Classification autoProcId={1} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "class" } });

    await waitFor(() => {
      expect(screen.getByLabelText("Class Distribution Value")).toHaveTextContent("999");
    });
  });

  it("should not display row when classification data is not available", async () => {
    server.use(
      rest.get("http://localhost/autoProc/:procId/classification", (req, res, ctx) => res.once(ctx.status(404)))
    );
    renderWithProviders(<Classification autoProcId={2} />);

    await waitFor(() => expect(screen.queryByText("2D Classification")).not.toBeInTheDocument());
  });

  it("should display visualisation button for 3D", async () => {
    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    await screen.findByText("Open 3D Visualisation", {}, { timeout: 3000 });
  });

  it("should update information when new class is selected (3d)", async () => {
    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("155");
    });

    fireEvent.click(screen.getByTestId("class-1"));

    await waitFor(() => expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("355"));
  });

  it("should match selected class to 3D visualisation modal page", async () => {
    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    const modalButton = await screen.findByText(/Open 3D Visualisation/i);

    fireEvent.click(modalButton);

    // Molstar + Suspense is a hefty combination
    await screen.findByText("No Valid Volume File", {}, { timeout: 4000 });

    await waitFor(async () => expect((await screen.findAllByLabelText("Total Pages"))[1]).toHaveTextContent("2"));
    fireEvent.click((await screen.findAllByLabelText("Next Page"))[1]);
    await waitFor(() => expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("355"));
  });
});
