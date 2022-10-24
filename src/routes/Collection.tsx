import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Divider, Grid, GridItem, Heading } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Scatter from "../components/scatter"
import { client } from "../utils/api/client"

const getData = async (collectionId: string) => {
    const response = await client.get(`drift/${collectionId}`)
    return response.data.map((drift: any) => {
        return { x: drift.deltaX, y: drift.deltaY }
    })
}

const Collection = () => {
    const params = useParams()
    const [data, setData] = useState([])

    useEffect(() => {
        getData(params.collectionId || "").then(apiData => {
            setData(apiData)
        }
        )
    }, [params.collectionId]);

    return (
        <Box>
            <Heading>Data Collection {params.collectionId} for {params.propId}-{params.visitId}</Heading>
            <Divider />
            <Accordion allowMultiple>
                <AccordionItem>
                    <h2>
                        <AccordionButton bg="diamond.100">
                            <Box flex='1' textAlign='left'>
                                Processing Job
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel>
                        <Heading size="md">Summary</Heading>
                        <Divider />
                        <Grid p={2} templateColumns='repeat(3, 1fr)' gap={6}>
                            <GridItem>
                                <Scatter title="Astigmatism" scatterData={data} />
                            </GridItem>
                            <GridItem>
                                <Scatter title="Estimated Defocus" scatterData={data} />
                            </GridItem>
                            <GridItem>
                                <Scatter title="Estimated Resolution" scatterData={data} />
                            </GridItem>
                        </Grid>
                        <Heading size="md">Motion Correction/CTF</Heading>
                        <Divider />
                        <Box>
                            <Grid p={2} templateColumns='repeat(4, 1fr)' gap={6}>
                                <GridItem>
                                </GridItem>
                                <GridItem>
                                </GridItem>
                                <GridItem>
                                </GridItem>
                                <GridItem>
                                    <Scatter title="Drift" scatterData={data} />
                                </GridItem>
                            </Grid>
                        </Box>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </Box>
    )
}

export default Collection
