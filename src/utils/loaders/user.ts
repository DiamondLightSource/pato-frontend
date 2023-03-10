import { client } from "utils/api/client";

const getUser = async () => {
  const url = window.location.href;
  const splitUrl = url.split("access_token=");

  if (splitUrl.length === 2) {
    sessionStorage.setItem("token", splitUrl[1].split("&token_type")[0].toString());
    window.history.replaceState({}, document.title, window.location.href.split("#")[0]);
  }

  try {
    const user = await client.get("user");
    return user.status === 200 ? { fedid: user.data.fedid, name: user.data.givenName } : null;
  } catch (NetworkError) {
    return null;
  }
};

export { getUser };
