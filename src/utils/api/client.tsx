interface RequestConfig {
  method: string;
  headers: Record<string, any>;
  body?: string | FormData;
  [k: string]: any;
}

export async function client(
  endpoint: string,
  customConfig: Record<any, any> = {},
  body?: Record<any,any> | FormData
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
      config.body = body
    }
    
  }

  let data;
  const target = "http://127.0.0.1:8000/" + endpoint;
  try {
    const response = await fetch(target, config);
    data = await response.json();
    if (response.ok) {
      return {
        status: response.status,
        data,
        headers: response.headers,
        url: response.url,
      };
    }
    console.error(`Error while fetching response for ${target}:`, config, body, response);
    return await Promise.reject(data);
  } catch (err: any) {
    return await Promise.reject(data);
  }
}

client.get = async function (endpoint: string, customConfig = {}) {
  const resp = await client(
    endpoint,
    (customConfig = {
      ...customConfig,
      headers: { Authorization: `Bearer ${window.sessionStorage.getItem("token")}` },
      method: "GET",
    })
  );
  return resp;
};

client.post = async function (endpoint: string, body: Record<any, any> | FormData, customConfig = {}) {
  const resp = await client(endpoint, customConfig, body);
  return resp;
};

client.delete = async function (endpoint: string, customConfig = {}) {
  const resp = await client(endpoint, (customConfig = { ...customConfig, method: "DELETE" }));
  return resp;
};
