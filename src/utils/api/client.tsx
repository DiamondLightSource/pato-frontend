import { createStandaloneToast } from "@chakra-ui/toast";
import { baseToast } from "../../styles/components";
const { toast } = createStandaloneToast();

interface RequestConfig {
  method: string;
  headers: Record<string, any>;
  body?: string | FormData;
  [k: string]: any;
}

export async function client(
  endpoint: string,
  customConfig: Record<any, any> = {},
  body?: Record<any, any> | FormData
): Promise<never | Record<string, any>> {
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
  let response: Response;

  try {
    response = await fetch(target, config);
  } catch {
    if (!toast.isActive("main-toast")) {
      toast({
        ...baseToast,
        title: "An error has occurred while fetching data, please try again later.",
        status: "error",
      });
    }

    console.error(target, config);
    return await Promise.reject();
  }

  if (!response.ok) {
    return await Promise.reject(response.status);
  }

  if (response.headers.get("content-type") === "image/png") {
    data = await response.blob();
  } else {
    data = await response.json();
  }

  return {
    status: response.status,
    data,
    headers: response.headers,
    url: response.url,
  };
}

client.safe_get = async (endpoint: string, customConfig = {}) => {
  try {
    const resp = await client(
      endpoint,
      (customConfig = {
        ...customConfig,
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        method: "GET",
      })
    );

    return resp;
  } catch (status) {
    if (status === 401) {
      window.location.href = `${process.env.REACT_APP_API_ENDPOINT}authorise?redirect_uri=${encodeURIComponent(
        window.location.href
      )}`;
    }

    return await Promise.reject({ detail: "Auth failure" });
  }
};

client.get = async (endpoint: string, customConfig = {}) => {
  const resp = await client(
    endpoint,
    (customConfig = {
      ...customConfig,
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      method: "GET",
    })
  );

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
