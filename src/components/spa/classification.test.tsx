import { Classification } from "./classification";
import { renderWithProviders } from "../../utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";

describe("2D Classification", () => {
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

  it("should display message when no classification data is available", async () => {
    renderWithProviders(<Classification autoProcId={2} />);

    await screen.findByText("No Classification Data Found");
  });

  it("should display visualisation button for 3D", async () => {
    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    await screen.findByText("Open 3D Visualisation");
  });

  it("should update information when new class is selected (3d)", async () => {
    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("155");
    });

    fireEvent.click(screen.getByTestId("class-1"));

    await waitFor(() => expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("355"));
  });

  it("should open Molstar viewer dialog when button is clicked", async () => {
    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("155");
    });

    fireEvent.click(screen.getByText(/Open 3D Visualisation/i));

    await screen.findByText("No Valid Volume File");
  });
});
