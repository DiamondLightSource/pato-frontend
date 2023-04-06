import { AuthState } from "schema/interfaces";
import { client } from "utils/api/client";

const getUser = async () => {
  let user: AuthState | null = null;

  const url = encodeURIComponent(window.location.href);
  const searchParams = new URL(window.location.href).searchParams;
  const code = searchParams.get("code");

  if (code) {
    client.authGet(`token?redirect_uri=${url}&code=${code}`).then(() => {
      searchParams.delete("code");
      window.location.search = searchParams.toString();
    });
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
