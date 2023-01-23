import { Dispatch, SetStateAction } from "react";
import { client } from "./client";

const setImage = (endpoint: string, setState: Dispatch<SetStateAction<string | undefined>>) => {
  client.safe_get(endpoint).then((response) => {
    if (response.status === 200) {
      setState(URL.createObjectURL(response.data));
    }
  });
};

export { setImage };
