import Tomogram from "../src/components/tomogram";
import React from "react";
import { server, renderWithProviders } from "../src/utils/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { Accordion } from "@chakra-ui/react";

beforeAll(() => server.listen());

describe("Tomogram", () => {
  window.URL.createObjectURL = jest.fn();

  it("should display tomogram ID correctly", () => {
    renderWithProviders(
      <Accordion>
        <Tomogram tomogram={{ tomogramId: 1, info: [] }} />
      </Accordion>
    );

    expect(screen.getByText("Tomogram 1")).toBeInTheDocument();
  });

  it("should display tomogram info", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram tomogram={{ tomogramId: 1, info: [{ label: "testLabel", value: "testValue" }] }} />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByText("testLabel:")).toBeInTheDocument();
    });

    expect(screen.getByText("testValue")).toBeInTheDocument();
  });

  it("should display message when no tilt alignment data is present", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram tomogram={{ tomogramId: 2, info: [{ label: "testLabel", value: "testValue" }] }} />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByText("No tilt alignment data available")).toBeInTheDocument();
    });
  });

  it("should display raw image count instead of tilt align. count if there is no tilt align.", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram tomogram={{ tomogramId: 2, info: [{ label: "testLabel", value: "testValue" }] }} />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByText("20")).toBeInTheDocument();
    });
  });

  it("should display comments button when comments are present", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram tomogram={{ tomogramId: 3, info: [{ label: "testLabel", value: "testValue" }] }} />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", {"name": "comment"})).toBeEnabled()
    });
  });
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
