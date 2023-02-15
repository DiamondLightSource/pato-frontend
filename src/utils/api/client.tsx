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
      config.headers = { ...config.headers, "Accept": "application/json", "Content-Type": "application/json" };
    } else {
      config.body = body;
    }
  }

  let data;
  let target =
    (endpoint === "user" ? process.env.REACT_APP_AUTH_ENDPOINT : process.env.REACT_APP_API_ENDPOINT) + endpoint;

  try {
    store.dispatch(setLoading(true));
    clearTimeout(timer); // Debounces loading state
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
  } catch (err) {
    if (!toast.isActive("main-toast")) {
      toast({
        ...baseToast,
        title: "An error has occurred while fetching data, please try again later.",
        status: "error",
      });
    }

    console.error(err);
    return Promise.reject();
  } finally {
    timer = setTimeout(() => store.dispatch(setLoading(false)), 200);
  }
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
  return await client(
    endpoint,
    (customConfig = {
      ...customConfig,
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      method: "GET",
    })
  );
};

client.post = async (endpoint: string, body: Record<any, any> | FormData, customConfig = {}) => {
  return await client(
    endpoint,
    { ...customConfig, headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } },
    body
  );
};
