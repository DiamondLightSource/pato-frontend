import { fireEvent, screen } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import { SessionPage } from "./Session";


const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Session Page", () => {
  it("should render session metadata headers", async () => {
    renderWithRoute(
      <SessionPage/>,
      () => ({ items: [], session: {microscopeName: "Krios I", startDate: "startDateValue", endDate: "endDateValue"} })
    );

    await screen.findByText(/krios i/i)
    expect(screen.getByText(/startDateValue/i)).toBeInTheDocument()
    expect(screen.getByText(/endDateValue/i)).toBeInTheDocument()
  });

  it("should navigate to the clicked group's path when table row clicked", async () => {
    renderWithRoute(
      <SessionPage/>,
      () => ({ items: [{experimentTypeName: "Tomogram", dataCollectionGroupId: 1}], session: {microscopeName: "Krios I", startDate: "startDateValue", endDate: "endDateValue"} })
    );

    const row = await screen.findByText(/tomogram/i);

    fireEvent.click(row)

    expect(mockNavigate).toHaveBeenCalledWith("groups/1/tomograms/1", {"relative": "path"})
  });
});
