import { AuthState } from "schema/interfaces";
import { client } from "utils/api/client";

const getUser = async () => {
  let user: AuthState | null = null;

  const url = encodeURIComponent(window.location.href);
  const splitUrl = window.location.href.split("code=");

  if (splitUrl.length === 2) {
    await client.authGet(`token?redirect_uri=${url}&code=${splitUrl[1]}`);
  }

  try {
    const response = await client.authGet("user");
    return response.status === 200 ? { fedid: response.data.fedid, name: response.data.givenName } : null;
  } catch (NetworkError) {
    return user;
  }
};

export { getUser };
