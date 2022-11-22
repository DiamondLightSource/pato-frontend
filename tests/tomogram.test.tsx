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

  it("should display astigmatism/defocus/resolution data when done loading", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram tomogram={{ tomogramId: 3, info: [{ label: "testLabel", value: "testValue" }] }} />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByText("Defocus")).toBeInTheDocument();
    });
  });
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
