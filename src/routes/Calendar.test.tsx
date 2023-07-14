import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import Calendar from "routes/Calendar";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Calendar", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2023-01-01"));
  });

  afterAll(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("should load current month by default", async () => {
    renderWithProviders(<Calendar />);

    await screen.findByText("January 2023");
  });

  it("should display sessions in calendar days correctly", async () => {
    renderWithProviders(<Calendar />);

    await screen.findByText("m01");
    expect(screen.getByText(/\(cm31111-1\)/i)).toBeInTheDocument();
  });

  it("should update query date when month changes", () => {
    const fetchSpy = jest.spyOn(global, "fetch");

    renderWithProviders(<Calendar />);

    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost/sessions?minStartDate=2022-11-27T00:00:00.000Z&maxStartDate=2023-01-08T00:00:00.000Z&search=m&limit=250",
      expect.anything()
    );

    fetchSpy.mockRestore();
  });

  it("should redirect to data collection group when event is clicked", async () => {
    renderWithProviders(<Calendar />);

    // eslint-disable-next-line testing-library/no-node-access
    const eventLink = (await screen.findByTestId("event-m01")).parentElement!;

    fireEvent.click(eventLink);
    expect(mockNavigate).toHaveBeenCalledWith("/proposals/cm31111/sessions/1");
  });
});
