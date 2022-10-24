interface RequestConfig {
    method: string
    headers: Record<string, any>
    body?: string
    [k: string]: any
  }
  
  export async function client (endpoint: string, customConfig: Record<any, any> = {}, body?: Record<any, any>): Promise<never | Record<string, any>> {
    const headers = { 'Content-Type': 'application/json' }

    const config: RequestConfig = {
      method: (body != null) ? 'POST' : 'GET',
      ...customConfig,
      headers: {
        ...headers,
        ...customConfig.headers
      },
      body: undefined
    }
  
    if (body != null) {
      config.body = JSON.stringify(body)
    }
  
    let data
    try {
      const response = await window.fetch("http://127.0.0.1:8000/"+endpoint, config)
      data = await response.json()
      if (response.ok) {
        return {
          status: response.status,
          data,
          headers: response.headers,
          url: response.url
        }
      }
      throw new Error(response.statusText)
    } catch (err: any) {
      return await Promise.reject(data)
    }
  }
  
  client.get = async function (endpoint: string, customConfig = {}) {
    const resp = await client(endpoint, customConfig = { ...customConfig, method: 'GET' })
    return resp
  }
  
  client.post = async function (endpoint: string, body: Record<any, any>, customConfig = {}) {
    const resp = await client(endpoint, customConfig, body)
    return resp
  }
  
  client.delete = async function (endpoint: string, customConfig = {}) {
    const resp = await client(endpoint, customConfig = { ...customConfig, method: 'DELETE' })
    return resp
  }
  