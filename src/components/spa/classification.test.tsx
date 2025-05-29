import { Classification } from "components/spa/classification";
import { renderWithProviders } from "utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "mocks/server";
import { ReactNode } from "react";

export interface MolstarWrapperProps {
  classId: number;
  autoProcId: number;
  children?: ReactNode;
}

vi.mock("components/molstar/molstar", () => ({
  default: ({ classId, autoProcId, children }: MolstarWrapperProps) => children,
}));

describe("Classification", () => {
  it("should match selected class to 3D visualisation modal page", async () => {
    server.use(
      http.get(
        "http://localhost/autoProc/:autoProcId/classification/:classId/image",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    renderWithProviders(<Classification autoProcId={5} type='3d' />);
    const modalButton = await screen.findByText(/Open 3D Visualisation/i);

    await waitFor(() => expect(modalButton).not.toHaveAttribute("disabled"));

    fireEvent.click(modalButton);
    await waitFor(() => expect(screen.getAllByLabelText("Total Pages").length).toBe(2));

    await waitFor(() => expect(screen.getAllByLabelText("Total Pages")[1]).toHaveTextContent("2"));
    fireEvent.click((await screen.findAllByLabelText("Next Page"))[1]);
    await waitFor(() =>
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("355")
    );
  });

  it("should display first page as default", async () => {
    renderWithProviders(<Classification autoProcId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("155");
    });

    expect(await screen.findByLabelText("Current Page")).toHaveValue("1");
  });

  it("should update information when new class is selected (2d)", async () => {
    renderWithProviders(<Classification autoProcId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("155");
    });

    const newClass = screen.getAllByLabelText("Image Title")[1];
    fireEvent.click(newClass);

    await waitFor(() =>
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("355")
    );
  });

  it("should update query when different sort type is selected", async () => {
    renderWithProviders(<Classification autoProcId={1} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "class" } });

    await waitFor(() => {
      expect(screen.getByLabelText("Class Distribution Value")).toHaveTextContent("999");
    });
  });

  it("should display message when classification data is not available", async () => {
    server.use(
      http.get(
        "http://localhost/autoProc/:procId/classification",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );
    renderWithProviders(<Classification autoProcId={2} />);

    await screen.findByText("No Classes Found");
  });

  it("should disable sorting controls when no data is available", async () => {
    server.use(
      http.get(
        "http://localhost/autoProc/:procId/classification",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );
    renderWithProviders(<Classification autoProcId={2} />);

    await screen.findByText("No Classes Found");
    expect(screen.getByRole("combobox")).toHaveAttribute("disabled");
  });

  it("should display visualisation button for 3D", async () => {
    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    await screen.findByText("Open 3D Visualisation");
  });

  it("should display pagination control when no data is available, albeit disabled", async () => {
    server.use(
      http.get(
        "http://localhost/autoProc/:procId/classification",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /next page/i })).toHaveAttribute("disabled")
    );
  });

  it("should update information when new class is selected (3d)", async () => {
    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    await waitFor(() => {
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("155");
    });

    fireEvent.click(screen.getByTestId("class-1"));

    await waitFor(() =>
      expect(screen.getByLabelText("Batch Number Value")).toHaveTextContent("355")
    );
  });

  it("should filter out unselected classes when option is selected", async () => {
    renderWithProviders(<Classification autoProcId={1} />);

    fireEvent.click(screen.getByRole("checkbox"));

    await screen.findByText("355-1 (1)");
    await waitFor(() => expect(screen.queryByText("155-1 (1)")).not.toBeInTheDocument());
  });

  it("should display angle distribution if type is 3d", async () => {
    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    await screen.findByText("355-1 (1)");
    expect(screen.getByText("Angle Distribution")).toBeInTheDocument();
  });

  it("should display angular efficiency and suggested tilt if type is 3d", async () => {
    renderWithProviders(<Classification autoProcId={1} type='3d' />);

    await screen.findByText("355-1 (1)");
    expect(screen.getByText("Angular Efficiency:")).toBeInTheDocument();
    expect(screen.getByText("Suggested Tilt:")).toBeInTheDocument();
  });

  it("should display classification boxes even if selection status is unknown", async () => {
    server.use(
      http.get(
        "http://localhost/autoProc/:procId/classification",
        () =>
          HttpResponse.json({
            items: [
              {
                particleClassificationId: 2,
                batchNumber: 355,
                classNumber: 1,
                particlesPerClass: 1,
                symmetry: "C1",
                type: "2D",
                selected: null,
              },
            ],
            total: 1,
            limit: 8,
          }),
        { once: true }
      )
    );

    renderWithProviders(<Classification autoProcId={1} />);

    await screen.findByText("355-1 (1)");
  });
});
