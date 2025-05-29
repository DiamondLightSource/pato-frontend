import { createStandaloneToast } from "@chakra-ui/toast";
import { baseToast } from "@diamondlightsource/ui-components";
const { toast } = createStandaloneToast();

const controller = new AbortController();

const defaultSettings: Partial<RequestConfig> = {
  credentials: process.env.NODE_ENV === "development" ? "include" : "same-origin",
};

interface RequestConfig {
  method: string;
  headers: Record<string, string>;
  body?: string | FormData;
  [k: string]: any;
}

export interface ClientResponse {
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

export const redirectToAuth = () => {
  const url = encodeURIComponent(window.location.href);
  window.location.replace(
    `${getPrefix(window.ENV.AUTH_URL)}authorise?redirect_uri=${url}&responseType=code`
  );
};

export const client = async (
  endpoint: string,
  customConfig: Record<any, any> = {},
  body?: Record<any, any> | FormData,
  prefix = getPrefix(window.ENV.API_URL)
): Promise<never | ClientResponse> => {
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

  if (body !== null) {
    if (!(body instanceof FormData)) {
      config.body = JSON.stringify(body);
      config.headers = {
        ...config.headers,
        Accept: "application/json",
        "Content-Type": "application/json",
      };
    } else {
      config.body = body;
    }
  }

  try {
    const response = await fetch(prefix + endpoint, config);
    const isJson = response.headers.get("content-type") === "application/json";

    return {
      status: response.status,
      data: isJson ? await response.json() : await response.arrayBuffer(),
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
  }
};

client.safeGet = async (endpoint: string, customConfig = {}) => {
  const resp = await client.get(endpoint, customConfig);

  if (resp.status === 401 && !window.location.href.includes("code=")) {
    redirectToAuth();
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
    getPrefix(window.ENV.AUTH_URL)
  );
};

client.post = async (endpoint: string, body: Record<any, any> | FormData, customConfig = {}) => {
  return await client(endpoint, { ...customConfig }, body);
};

client.patch = async (endpoint: string, body: Record<any, any> | FormData, customConfig = {}) => {
  return await client(endpoint, { method: "PATCH", ...customConfig }, body);
};

export const prependApiUrl = (url: string) => `${getPrefix(window.ENV.API_URL)}${url}`;
