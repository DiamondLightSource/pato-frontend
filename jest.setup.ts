import '@testing-library/jest-dom'

import { server } from "./src/mocks/server"
import "whatwg-fetch";

process.env.REACT_APP_API_ENDPOINT = "http://localhost/";

beforeEach(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())


class ResizeObserver {
    observe() {
    }
    unobserve() {
    }
    disconnect() {
    }
}

global.ResizeObserver = ResizeObserver
global.structuredClone = (val: Record<string, any>) => JSON.parse(JSON.stringify(val))
jest.mock('./src/store/store')