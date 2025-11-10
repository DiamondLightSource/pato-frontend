import { AuthState } from "@diamondlightsource/ui-components";
import { client, redirectToAuth } from "utils/api/client";

export interface UserWithEmail extends AuthState {
  email?: string;
}

export const getUser = async (redirectOnFail: boolean = false) => {
  let user: UserWithEmail | null = null;

  const newUrl = new URL(window.location.href);
  const code = newUrl.searchParams.get("code");

  if (code) {
    newUrl.searchParams.delete("code");
    newUrl.searchParams.delete("session_state");
    newUrl.searchParams.delete("iss");

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
    } else if (
      response.status === 401 &&
      window.location.pathname !== "/invalid-user" &&
      response.data.detail === "User is not listed or does not have permission to view content"
    ) {
      window.location.assign("/invalid-user");
      return null;
    } else if (!redirectOnFail) {
      return null;
    }
    redirectToAuth();
    return {};
  } catch (NetworkError) {
    return user;
  }
};
