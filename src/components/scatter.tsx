import {
    Box,
    Heading,
} from '@chakra-ui/react'
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

import { FunctionComponent, useEffect, useState } from 'react'

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ScatterProp {
    title: string,
    scatterData: { x: number, y: number }[]
}

const preloadedData = {
    datasets: [
        {
            data: [{ x: 1, y: 1 }],
            backgroundColor: 'rgba(255, 99, 132, 1)',
        },
    ],
};

const options = {
    plugins: { legend: { display: false }, }
}

const ScatterWrapper: FunctionComponent<ScatterProp> = ({ title, scatterData }): JSX.Element => {
    const [data, setData] = useState(preloadedData)

    useEffect(() => {
        setData({
            datasets: [{
                data: scatterData,
                backgroundColor: 'rgba(255, 99, 132, 1)',
            },]
        })
    }, [scatterData])

    return (
        <Box p={4} borderWidth='1px' borderRadius='lg'>
            <Heading size='sm' >{title}</Heading>
            <Scatter data={data} options={options} />
        </Box>
    )
}

export default ScatterWrapper
