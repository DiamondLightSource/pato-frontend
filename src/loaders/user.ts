import { AuthState } from "diamond-components";
import { client } from "utils/api/client";

const getUser = async () => {
  let user: AuthState | null = null;

  const newUrl = new URL(window.location.href);
  const code = newUrl.searchParams.get("code");

  if (code) {
    newUrl.searchParams.delete("code");

    await client.authGet(`token?redirect_uri=${encodeURIComponent(newUrl.href)}&code=${code}`);
    window.location.replace(newUrl.href);
  }

  try {
    const response = await client.authGet("user");
    return response.status === 200
      ? { fedid: response.data.fedid, name: response.data.givenName }
      : null;
  } catch (NetworkError) {
    return user;
  }
};

export { getUser };
