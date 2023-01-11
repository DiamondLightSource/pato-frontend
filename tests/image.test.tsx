import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../src/utils/test-utils";
import Image from "../src/components/image";
import React from "react";

describe("Image", () => {
  it("should render image title", () => {
    renderWithProviders(<Image title='Image Title' src='' />);
    expect(screen.getByText("Image Title")).toBeInTheDocument();
  });

  it("should open dialog when image is clicked", () => {
    renderWithProviders(<Image title='Image Title' src='' />);
    const imageThumbnail = screen.getByRole("img");

    fireEvent.click(imageThumbnail);

    expect(screen.getByTestId("zoomed-out-image")).toBeInTheDocument();
  });

  it("should display zoomed in image when dialog image is clicked", () => {
    renderWithProviders(<Image title='Image Title' src='' />);
    const imageThumbnail = screen.getByRole("img");

    fireEvent.click(imageThumbnail);
    const dialogImage = screen.getByTestId("zoomed-out-image");
    fireEvent.click(dialogImage);

    expect(screen.getByTestId("zoomed-in-image")).toBeInTheDocument();
  });

  it("should fire callback when clicked", async () => {
    const onClick = jest.fn();
    renderWithProviders(<Image title='Image Title' src='' showModal={false} onClick={onClick} />);

    const title = screen.getByRole("heading", { name: "Image Title" });
    fireEvent.click(title);

    await waitFor(() => {
      expect(onClick).toBeCalled();
    });
  });
});
