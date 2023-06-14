import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import APNGViewer from "components/visualisation/apng";
import APNGContainer from "./apngContainer";

global.URL.createObjectURL = jest.fn(() => "http://localhost/noimage.png");

describe("APNG Container", () => {
  it("should render single APNG child", async () => {
    renderWithProviders(
      <APNGContainer>
        <APNGViewer src='tomograms/1/movie' />
      </APNGContainer>
    );
    await screen.findByLabelText("Frame Image");
  });

  it("should render multiple APNG children", async () => {
    renderWithProviders(
      <APNGContainer>
        <APNGViewer src='tomograms/1/movie' />
        <APNGViewer src='tomograms/1/movie' />
      </APNGContainer>
    );
    const apngs = await screen.findAllByLabelText("Frame Image");

    expect(apngs).toHaveLength(2);
  });

  it("should stop at last frame when playing", async () => {
    renderWithProviders(
      <APNGContainer>
        <APNGViewer src='tomograms/1/movie' />
      </APNGContainer>
    );
    await screen.findByLabelText("Frame Image");

    const playButton = screen.getByLabelText("Play");
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Current Frame")).toHaveTextContent("3");
    });

    await screen.findByLabelText("Play");
  });

  it("should stop at first frame when playing in reverse", async () => {
    renderWithProviders(
      <APNGContainer>
        <APNGViewer src='tomograms/1/movie' />
      </APNGContainer>
    );
    await screen.findByLabelText("Frame Image");

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
    renderWithProviders(
      <APNGContainer>
        <APNGViewer src='tomograms/1/movie' />
      </APNGContainer>
    );
    await screen.findByLabelText("Frame Image");

    fireEvent.click(screen.getByLabelText("Play"));
    fireEvent.click(screen.getByLabelText("Pause"));

    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });

  it("should display correct frame count", async () => {
    renderWithProviders(
      <APNGContainer>
        <APNGViewer src='tomograms/1/movie' />
      </APNGContainer>
    );
    await screen.findByLabelText("Frame Image");

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemax", "3");
  });
});
