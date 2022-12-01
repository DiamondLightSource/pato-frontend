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

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
    useParams: () => ({
      collectionIndex: '5',
      groupId: '2000',
      propId: "cm-31111",
      visitId: "5000"
    }),
  }));