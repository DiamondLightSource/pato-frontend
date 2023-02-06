import { Dispatch, SetStateAction } from "react";
import { client } from "./client";

const setImage = (endpoint: string, setState: Dispatch<SetStateAction<string | undefined>>) => {
  setState(undefined);
  client.safe_get(endpoint).then((response) => {
    if (response.status === 200) {
      setState(URL.createObjectURL(response.data));
    } else {
      setState("");
    }
  });
};

export { setImage };
