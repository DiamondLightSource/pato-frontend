import Tomogram from "../src/components/tomogram";
import React from "react";
import { server, renderWithProviders } from "../src/utils/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { Accordion } from "@chakra-ui/react";

beforeAll(() => server.listen());

describe("Tomogram", () => {
  window.URL.createObjectURL = jest.fn();

  it("should display tomogram title (comment) correctly", () => {
    renderWithProviders(
      <Accordion>
        <Tomogram collection={{ info: [], comments: "Tomogram 1" }} tomogram={{ tomogramId: 1, info: [] }} />
      </Accordion>
    );

    expect(screen.getByText("Tomogram 1")).toBeInTheDocument();
  });

  it("should display placeholder title when no title is provided", () => {
    renderWithProviders(
      <Accordion>
        <Tomogram collection={{ info: [], comments: null }} tomogram={{ tomogramId: 1, info: [] }} />
      </Accordion>
    );

    expect(screen.getByText("No Title Provided")).toBeInTheDocument();
  });

  it("should display tomogram info", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram
          collection={{ info: [], comments: "" }}
          tomogram={{ tomogramId: 1, info: [{ label: "testLabel", value: "testValue" }] }}
        />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByText("testLabel:")).toBeInTheDocument();
    });

    expect(screen.getByText("testValue")).toBeInTheDocument();
  });

  it("should display collection info", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram
          collection={{ info: [{ label: "collectionLabel", value: "collectionValue" }], comments: "" }}
          tomogram={{ tomogramId: 1, info: [] }}
        />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByText("collectionLabel:")).toBeInTheDocument();
    });

    expect(screen.getByText("collectionValue")).toBeInTheDocument();
  });

  it("should display astigmatism/defocus/resolution data when done loading", async () => {
    renderWithProviders(
      <Accordion>
        <Tomogram
          collection={{ info: [], comments: "" }}
          tomogram={{ tomogramId: 3, info: [{ label: "testLabel", value: "testValue" }] }}
        />
      </Accordion>
    );

    await waitFor(() => {
      expect(screen.getByText("Defocus")).toBeInTheDocument();
    });
  });
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
