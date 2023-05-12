import { processSessionData } from "./sessions";

describe("Session Data", () => {
  it("should get microscope name if available", () => {
    const oldData = [{ startDate: "", endDate: "", beamLineName: "m03" }];
    const data = processSessionData(oldData);
    expect(data[0].microscopeName).toBe("Krios 2 (m03)");
  });

  it("should return actual beamline name if doesn't map to a microscope", () => {
    const oldData = [{ startDate: "", endDate: "", beamLineName: "i03" }];
    const data = processSessionData(oldData);
    expect(data[0].microscopeName).toBe("i03");
  });
});
