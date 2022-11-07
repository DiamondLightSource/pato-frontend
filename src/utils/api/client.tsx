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
  const target = "http://127.0.0.1:8000/" + endpoint;
  try {
    const response = await fetch(target, config);
    if (response.headers.get("content-type") === "image/png") {
      data = await response.blob();
    } else {
      data = await response.json();
    }
    if (response.ok) {
      return {
        status: response.status,
        data,
        headers: response.headers,
        url: response.url,
      };
    }

    if (response.status !== 500) {
      if (!toast.isActive("main-toast")) {
        toast({
          ...baseToast,
          title: data.detail,
          status: "error",
        });
      }

      if (response.status === 401) {
        data.redirect = "/login";
      }
    }
    return await Promise.reject({ ...data });
  } catch (err: any) {
    if (!toast.isActive("main-toast")) {
      toast({
        ...baseToast,
        title: "An error has occurred while fetching data, please try again later.",
        status: "error",
      });
    }

    console.error(target, config, data);
    return await Promise.reject({ ...data });
  }
}

client.get = async (endpoint: string, customConfig = {}, privateEndpoint = false) => {
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
