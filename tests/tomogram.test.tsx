import Tomogram from "../src/components/tomogram";
import React from "react";
import { server, renderWithProviders } from "../src/utils/test-utils";
import { screen } from "@testing-library/react";
import { Accordion } from "@chakra-ui/react";

beforeAll(() => server.listen());

describe("Collection", () => {
  it("should display tomogram ID correctly", () => {
    renderWithProviders(
      <Accordion>
        <Tomogram tomogram={{ tomogramId: 1, info: [] }} />
      </Accordion>
    );

    expect(screen.getByText("Tomogram 1")).toBeInTheDocument();
  });

  it("should display tomogram info", () => {
    renderWithProviders(
      <Accordion>
        <Tomogram tomogram={{ tomogramId: 1, info: [{ label: "testLabel", value: "testValue" }] }} />
      </Accordion>
    );

    expect(screen.getByText("testLabel:")).toBeInTheDocument();
    expect(screen.getByText("testValue")).toBeInTheDocument();
  });
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
