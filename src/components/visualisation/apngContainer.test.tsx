import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import APNGContainer from "./apngContainer";

global.URL.createObjectURL = vi.fn(() => "http://localhost/noimage.png");

describe("APNG Container", () => {
  it("should render single APNG child", async () => {
    renderWithProviders(<APNGContainer views={[{ src: "tomograms/1/movie" }]} />);
    await screen.findByText("tomograms/1/movie");
  });

  it("should render multiple APNG children", async () => {
    renderWithProviders(
      <APNGContainer views={[{ src: "tomograms/1/movie" }, { src: "tomograms/1/movie" }]} />
    );
    const apngs = await screen.findAllByText("tomograms/1/movie");

    expect(apngs).toHaveLength(2);
  });

  it("should stop at last frame when playing", async () => {
    renderWithProviders(<APNGContainer views={[{ src: "tomograms/1/movie" }]} />);
    await screen.findByText("tomograms/1/movie");

    const playButton = screen.getByLabelText("Play");
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Current Frame")).toHaveTextContent("3");
    });

    await screen.findByLabelText("Play");
  });

  it("should stop at first frame when playing in reverse", async () => {
    renderWithProviders(<APNGContainer views={[{ src: "tomograms/1/movie" }]} />);
    await screen.findByText("tomograms/1/movie");

    fireEvent.click(screen.getByLabelText("Play"));

    await waitFor(() => {
      expect(screen.getByLabelText("Current Frame")).toHaveTextContent("3");
    });

    fireEvent.click(screen.getByLabelText("Play in Reverse"));
    fireEvent.click(await screen.findByLabelText("Play"));

    await screen.findByLabelText("Pause");
    await screen.findByLabelText("Play");

    await waitFor(() => {
      expect(screen.getByLabelText("Current Frame")).toHaveTextContent("0");
    });
  });

  it("should update button state when paused", async () => {
    renderWithProviders(<APNGContainer views={[{ src: "tomograms/1/movie" }]} />);
    await screen.findByText("tomograms/1/movie");

    fireEvent.click(screen.getByLabelText("Play"));
    fireEvent.click(screen.getByLabelText("Pause"));

    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });

  it("should display correct frame count", async () => {
    renderWithProviders(<APNGContainer views={[{ src: "tomograms/1/movie" }]} />);
    await screen.findByText("tomograms/1/movie");

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemax", "3");
  });

  it("should hide items tagged with hidden", async () => {
    renderWithProviders(
      <APNGContainer
        views={[
          { src: "tomograms/2/movie", caption: "foo", hidden: true },
          { src: "tomograms/1/movie" },
        ]}
      />
    );
    const image = await screen.findByLabelText("foo");

    expect(image).toHaveAttribute("aria-hidden", "true");
  });
});
