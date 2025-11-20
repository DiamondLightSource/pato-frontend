import { SliceViewer } from "components/tomogram/SliceViewer";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApngProps } from "@diamondlightsource/ui-components";

vi.mock("@diamondlightsource/ui-components", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    APNGViewer: ({ caption }: ApngProps) => <p>{caption}</p>,
  };
});

describe("Tomogram Slice Viewer", () => {
  it("should display tomogram slice", async () => {
    render(
      <SliceViewer
        onClose={() => {}}
        total={10}
        page={1}
        onPageChange={() => {}}
        movieType='denoised'
        tomogramId={1}
        isOpen={true}
      />
    );

    await screen.findByText("Denoised");
    expect(screen.getByText("Not Denoised")).toBeInTheDocument();
  });

  it("should not display if 'isOpen' is set to false", async () => {
    render(
      <SliceViewer
        onClose={() => {}}
        total={10}
        page={1}
        onPageChange={() => {}}
        movieType='denoised'
        tomogramId={1}
        isOpen={false}
      />
    );

    expect(screen.queryByText("Movie")).not.toBeInTheDocument();
  });

  it("should fire event if modal is open and next page is clicked", async () => {
    const pageChangeCallback = vi.fn();
    render(
      <SliceViewer
        onClose={() => {}}
        total={10}
        page={1}
        onPageChange={pageChangeCallback}
        movieType='alignment'
        tomogramId={1}
        isOpen={true}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /next page/i }));

    await waitFor(() => expect(pageChangeCallback).toHaveBeenCalledWith(2));
  });

  it("should display alignment image if movie type is 'alignment'", async () => {
    const pageChangeCallback = vi.fn();
    render(
      <SliceViewer
        onClose={() => {}}
        total={10}
        page={1}
        onPageChange={pageChangeCallback}
        movieType='alignment'
        tomogramId={1}
        isOpen={true}
      />
    );

    await screen.findByText("Alignment");
    expect(screen.getByText("Stack")).toBeInTheDocument();
  });
});
