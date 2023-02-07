import { client } from "../api/client";

const getUser = async () => {
  const url = window.location.href;
  const splitUrl = url.split("access_token=");

  if (splitUrl.length === 2) {
    sessionStorage.setItem("token", splitUrl[1].split("&token_type")[0].toString());
    window.history.replaceState({}, document.title, window.location.href.split("#")[0]);
  }

  const user = await client.get("user");

  if (user.status === 200) {
    return { fedid: user.data.fedid, name: user.data.givenName };
  }

  return null;
};

export { getUser };
