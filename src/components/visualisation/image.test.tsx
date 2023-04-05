import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { ImageCard } from "components/visualisation/image";

describe("Image", () => {
  it("should render image title", () => {
    renderWithProviders(<ImageCard title='Image Title' src='' />);
    expect(screen.getByText("Image Title")).toBeInTheDocument();
  });

  it("should open dialog when image is clicked", () => {
    renderWithProviders(<ImageCard title='Image Title' src='' />);
    const imageThumbnail = screen.getByLabelText("Image Title");
    fireEvent.click(imageThumbnail);

    expect(screen.getByTestId("zoomed-out-image")).toBeInTheDocument();
  });

  it("should display zoomed in image when dialog title is clicked", () => {
    renderWithProviders(<ImageCard title='Image Title' src='' />);
    const imageThumbnail = screen.getByLabelText("Image Title");

    fireEvent.click(imageThumbnail);
    const dialogImage = screen.getByTestId("zoomed-out-image");
    fireEvent.click(dialogImage);

    expect(screen.getByTestId("zoomed-in-image")).toBeInTheDocument();
  });

  it("should fire callback when clicked", async () => {
    const onClick = jest.fn();
    renderWithProviders(<ImageCard title='Image Title' src='' showModal={false} onClick={onClick} />);

    const title = screen.getByRole("heading", { name: "Image Title" });
    fireEvent.click(title);

    await waitFor(() => {
      expect(onClick).toBeCalled();
    });
  });

  it("should display skeleton when image source is undefined", async () => {
    const onClick = jest.fn();
    renderWithProviders(<ImageCard title='Image Title' src={undefined} showModal={false} onClick={onClick} />);

    expect(screen.getByTestId("image-loader")).toBeInTheDocument();
  });
});
