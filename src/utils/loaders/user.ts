import { redirect } from "react-router-dom";
import { AuthState } from "schema/interfaces";
import { client } from "utils/api/client";

const getUser = async () => {
  let user: AuthState | null = null;

  try {
    const response = await client.authGet("user");
    return response.status === 200 ? { fedid: response.data.fedid, name: response.data.givenName } : null;
  } catch (NetworkError) {
    return user;
  }
};

export { getUser };
