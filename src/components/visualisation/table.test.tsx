import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import { Table } from "./table";

describe("GenericListing", () => {
  it("should display message when no data is received", () => {
    renderWithProviders(<Table headers={[{ key: "key1", label: "label1" }]} data={null} />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("should display skeleton when loading", () => {
    renderWithProviders(<Table headers={[{ key: "key1", label: "label1" }]} data={undefined} />);
    expect(screen.queryByText("No data found")).not.toBeInTheDocument();
  });

  it("should render header labels", () => {
    renderWithProviders(
      <Table
        data={[{ key1: "value1", key2: "value2", key3: "value3" }]}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />
    );

    expect(screen.getByText("label1")).toBeInTheDocument();
    expect(screen.getByText("label2")).toBeInTheDocument();
    expect(screen.getByText("label3")).toBeInTheDocument();
  });

  it("should display data", () => {
    renderWithProviders(
      <Table
        data={[{ key1: "value1", key2: "value2", key3: "value3" }]}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
      />
    );

    expect(screen.getByText("value1")).toBeInTheDocument();
    expect(screen.getByText("value2")).toBeInTheDocument();
    expect(screen.getByText("value3")).toBeInTheDocument();
  });

  it("should fire callback when row clicked", () => {
    const callbackMock = jest.fn();
    renderWithProviders(
      <Table
        data={[
          { key1: "value1", key2: "value2", key3: "value3" },
          { key1: "value4", key2: "value5", key3: "value6" },
        ]}
        headers={[
          { key: "key1", label: "label1" },
          { key: "key2", label: "label2" },
          { key: "key3", label: "label3" },
        ]}
        onClick={callbackMock}
      />
    );

    fireEvent.click(screen.getByRole("cell", { name: /value4/i }));
    expect(callbackMock).toBeCalledWith({ key1: "value4", key2: "value5", key3: "value6" }, 1);
  });
});
