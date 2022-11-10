import '@testing-library/jest-dom'

import server from "./src/mocks/server"

beforeEach(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

jest.mock('react-chartjs-2', () => ({
    Scatter: () => null
  }));