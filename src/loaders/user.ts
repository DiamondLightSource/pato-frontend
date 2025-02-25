import { AuthState } from "@diamondlightsource/ui-components";
import { client, redirectToAuth } from "utils/api/client";

export interface UserWithEmail extends AuthState {
  email?: string;
}

const getUser = async (redirectOnFail: boolean = false) => {
  let user: UserWithEmail | null = null;

  const newUrl = new URL(window.location.href);
  const code = newUrl.searchParams.get("code");

  if (code) {
    newUrl.searchParams.delete("code");

    await client.authGet(`token?redirect_uri=${encodeURIComponent(newUrl.href)}&code=${code}`);
    window.location.replace(newUrl.href);
  }

  try {
    const response = await client.authGet("user");
    if (response.status === 200) {
      return {
        fedid: response.data.fedid,
        name: response.data.givenName,
        email: response.data.email,
      };
    } else if (!redirectOnFail) {
      return null;
    }
    redirectToAuth();
    return {};
  } catch (NetworkError) {
    return user;
  }
};

export { getUser };
