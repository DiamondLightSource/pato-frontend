import '@testing-library/jest-dom'

import server from "./src/mocks/server"
import "whatwg-fetch";

process.env.REACT_APP_API_ENDPOINT = "http://localhost/";

beforeEach(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

jest.mock('react-chartjs-2', () => ({
    Scatter: () => null
  }));
