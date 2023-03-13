import { Dispatch, SetStateAction } from "react";
import { BarStats } from "schema/interfaces";
import { client } from "utils/api/client";

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

const setHistogram = (
  endpoint: string,
  setState: Dispatch<SetStateAction<BarStats[] | null | undefined>>,
  div: number = 1
) => {
  client.safe_get(endpoint).then((response) => {
    if (response.status === 200 && response.data.items) {
      const histogram: BarStats[] = [];
      for (const bin of response.data.items) {
        const label = isNaN(bin.x) ? `${bin.x.charAt(0)}${parseFloat(bin.x.substring(1)) / div}` : bin.x / div;
        histogram.push({
          label: label.toString(),
          y: bin.y,
        });
      }

      setState(histogram);
    } else {
      setState(null);
    }
  });
};

const downloadBuffer = (buffer: ArrayBuffer, contentType: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([buffer], { type: contentType }));
  a.download = "volume.mrc";
  a.click();
  a.remove();
};

export { setImage, setHistogram, downloadBuffer };
