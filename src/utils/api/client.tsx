import { createStandaloneToast } from "@chakra-ui/toast";
import { setLoading } from "features/uiSlice";
import { store } from "store/store";
import { baseToast } from "styles/components";
const { toast } = createStandaloneToast();

const controller = new AbortController();
const timeoutFetch = setTimeout(() => controller.abort(), 3000);
let timer: ReturnType<typeof setTimeout>;

const defaultSettings: Partial<RequestConfig> = {
  credentials: process.env.NODE_ENV === "development" ? "include" : "same-origin",
};

interface RequestConfig {
  method: string;
  headers: Record<string, string>;
  body?: string | FormData;
  [k: string]: any;
}

export interface Response {
  status: number;
  data: any;
  headers: Record<string, any>;
  url: string;
}

const getPrefix = (prefix: string = "/api/") => {
  if (prefix.substring(0, 1) === "/") {
    return window.location.origin + prefix;
  }

  return prefix;
};

export const client = async (
  endpoint: string,
  customConfig: Record<any, any> = {},
  body?: Record<any, any> | FormData,
  prefix = getPrefix(process.env.REACT_APP_API_ENDPOINT)
): Promise<never | Response> => {
  const config: RequestConfig = {
    method: body != null ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...customConfig.headers,
    },
    signal: controller.signal,
    body: undefined,
    ...defaultSettings,
  };

  if (body != null) {
    if (!(body instanceof FormData)) {
      config.body = JSON.stringify(body);
      config.headers = { ...config.headers, "Accept": "application/json", "Content-Type": "application/json" };
    } else {
      config.body = body;
    }
  }

  let data;

  try {
    store.dispatch(setLoading(true));
    clearTimeout(timer); // Debounces loading state
    const response = await fetch(prefix + endpoint, config);
    clearTimeout(timeoutFetch);

    switch (response.headers.get("content-type")) {
      case "application/marc":
        data = await response.arrayBuffer();
        break;
      case "text/plain; charset=utf-8":
        data = await response.arrayBuffer();
        break;
      case "image/png":
        data = await response.arrayBuffer();
        break;
      case "image/jpeg":
        data = await response.blob();
        break;
      case "application/json":
        data = await response.json();
        break;
      default:
        data = response;
        break;
    }

    return {
      status: response.status,
      data,
      headers: response.headers,
      url: response.url,
    };
  } catch (err) {
    if (!toast.isActive("main-toast")) {
      toast({
        ...baseToast,
        title: "An error has occurred while fetching data, please try again later.",
        status: "error",
      });
    }

    throw err;
  } finally {
    timer = setTimeout(() => store.dispatch(setLoading(false)), 200);
  }
};

client.safeGet = async (endpoint: string, customConfig = {}) => {
  const resp = await client.get(endpoint, customConfig);

  if (resp.status === 401 && !window.location.href.includes("code=")) {
    const url = encodeURIComponent(window.location.href);
    window.location.href = `${getPrefix(
      process.env.REACT_APP_AUTH_ENDPOINT
    )}authorise?redirect_uri=${url}&responseType=code`;
  }

  return resp;
};

client.get = async (endpoint: string, customConfig = {}) => {
  return await client(
    endpoint,
    (customConfig = {
      ...customConfig,
    })
  );
};

client.authGet = async (endpoint: string, customConfig = {}) => {
  return await client(
    endpoint,
    (customConfig = {
      ...customConfig,
    }),
    undefined,
    getPrefix(process.env.REACT_APP_AUTH_ENDPOINT)
  );
};

client.post = async (endpoint: string, body: Record<any, any> | FormData, customConfig = {}) => {
  return await client(endpoint, { ...customConfig }, body);
};

export const prependApiUrl = (url: string) => `${getPrefix(process.env.REACT_APP_API_ENDPOINT)}${url}`;
