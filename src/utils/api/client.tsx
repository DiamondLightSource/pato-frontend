import { createStandaloneToast } from "@chakra-ui/toast";
import { baseToast } from "../../styles/components";
const { toast } = createStandaloneToast();

interface RequestConfig {
  method: string;
  headers: Record<string, any>;
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
  let target = process.env.REACT_APP_API_ENDPOINT + endpoint;

  const response = await fetch(target, config);

  switch (response.headers.get("content-type")) {
    case "image/png":
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
    window.location.href = `${process.env.REACT_APP_API_ENDPOINT}authorise?redirect_uri=${encodeURIComponent(
      window.location.href
    )}`;
  }

  return resp;
};

client.get = async (endpoint: string, customConfig = {}) => {
  let resp: Response = { status: 0, data: {}, headers: {}, url: "" };
  try {
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
