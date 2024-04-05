import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import Calendar from "routes/Calendar";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Calendar", () => {
  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(new Date("2023-01-01"));
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should load current month by default", async () => {
    renderWithProviders(<Calendar />);
    screen.getByRole("heading", { name: /january 2023/i });
  });

  it("should display sessions in calendar days correctly", async () => {
    renderWithProviders(<Calendar />);

    await screen.findByText(/m01/i);
    expect(screen.getByText(/\(cm31111-1\)/i)).toBeInTheDocument();
  });

  it("should update query date when month changes", () => {
    const fetchSpy = vi.spyOn(global, "fetch");

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

    const eventLink = (await screen.findByTestId("event-m01")).parentElement!;

    fireEvent.click(eventLink);
    expect(mockNavigate).toHaveBeenCalledWith("/proposals/cm31111/sessions/1");
  });
});
