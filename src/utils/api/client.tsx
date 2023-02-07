import { createStandaloneToast } from "@chakra-ui/toast";
import { setLoading } from "../../features/uiSlice";
import { store } from "../../store/store";
import { baseToast } from "../../styles/components";
const { toast } = createStandaloneToast();

const controller = new AbortController();
const timeoutFetch = setTimeout(() => controller.abort(), 3000);
let timer: ReturnType<typeof setTimeout>;

interface RequestConfig {
  method: string;
  headers: Record<string, string>;
  body?: string | FormData;
  [k: string]: any;
}

interface Response {
  status: number;
  data: any;
  headers: Record<string, any>;
  url: string;
}

export async function client(
  endpoint: string,
  customConfig: Record<any, any> = {},
  body?: Record<any, any> | FormData
): Promise<never | Response> {
  const config: RequestConfig = {
    method: body != null ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...customConfig.headers,
    },
    signal: controller.signal,
    body: undefined,
  };

  if (body != null) {
    if (!(body instanceof FormData)) {
      config.body = JSON.stringify(body);
    } else {
      config.body = body;
    }
  }

  let data;
  let target =
    (endpoint === "user" ? process.env.REACT_APP_AUTH_ENDPOINT : process.env.REACT_APP_API_ENDPOINT) + endpoint;

  const response = await fetch(target, config);
  clearTimeout(timeoutFetch);

  switch (response.headers.get("content-type")) {
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
      data = null;
      break;
  }

  return {
    status: response.status,
    data,
    headers: response.headers,
    url: response.url,
  };
}

client.safe_get = async (endpoint: string, customConfig = {}) => {
  const resp = await client.get(endpoint, customConfig);

  if (resp.status === 401) {
    const url = encodeURIComponent(window.location.href);
    window.location.href = `${process.env.REACT_APP_AUTH_ENDPOINT}authorise?redirect_uri=${url}`;
  }

  return resp;
};

client.get = async (endpoint: string, customConfig = {}) => {
  let resp: Response = { status: 0, data: {}, headers: {}, url: "" };
  try {
    store.dispatch(setLoading(true));
    clearTimeout(timer); // Debounces loading state
    resp = await client(
      endpoint,
      (customConfig = {
        ...customConfig,
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        method: "GET",
      })
    );
  } catch (err) {
    if (!toast.isActive("main-toast")) {
      toast({
        ...baseToast,
        title: "An error has occurred while fetching data, please try again later.",
        status: "error",
      });
    }

    console.error(endpoint, customConfig, err);
  } finally {
    timer = setTimeout(() => store.dispatch(setLoading(false)), 200);
  }
  return resp;
};

client.post = async (endpoint: string, body: Record<any, any> | FormData, customConfig = {}) => {
  const resp = await client(endpoint, customConfig, body);
  return resp;
};

client.delete = async (endpoint: string, customConfig = {}) => {
  const resp = await client(endpoint, (customConfig = { ...customConfig, method: "DELETE" }));
  return resp;
};
