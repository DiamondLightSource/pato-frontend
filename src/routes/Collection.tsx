import { Accordion, Divider, Heading, Box } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { client } from "../utils/api/client";
import { useAppDispatch } from "../store/hooks";
import { setLoading } from "../features/uiSlice";
import Tomogram from "../components/tomogram";
import { parseData } from "../utils/generic";

const Collection = () => {
  const params = useParams();
  const [tomograms, setTomograms] = useState<Record<string, any>>([]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const getData = useCallback(
    async (endpoint: string): Promise<Record<string, any>> => {
      let data = {};
      dispatch(setLoading(true));
      try {
        const response = await client.get(endpoint);
        data = response.data;
      } catch (response: any) {
        if (response.redirect) {
          navigate(response.redirect, { state: { redirect: true } });
        }
      }

      dispatch(setLoading(false));
      return data;
    },
    [dispatch, navigate]
  );

  useEffect(() => {
    document.title = `eBIC » Collections » ${params.collectionId}`;
    getData(`tomograms/${params.collectionId}`).then((response) => {
      setTomograms(response.items.map((info: Record<string, any>) => parseData(info, ["tomogramId"])));
    });
  }, [params.collectionId, getData]);

  return (
    <Box>
      <Heading>
        Data Collection {params.collectionId} for {params.propId}-{params.visitId}
      </Heading>
      <Divider />
      <Accordion defaultIndex={0} onChange={(e) => console.log(e)}>
        {tomograms.map((tomogram: Record<string, any>) => (
          <Tomogram tomogram={tomogram} key={tomogram.tomogramId} />
        ))}
      </Accordion>
    </Box>
  );
};

export default Collection;
