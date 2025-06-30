import { EMSlice } from "@shared";

export const exampleSlice: EMSlice = {
    id: 'TEST',
    name: 'test',
    elements: [
        {
            id: 'event',
            type: 'event',
            name: 'Event'
        },
        {
            id: 'command',
            type: 'command',
            name: 'Command'
        },
        {
            id: 'screen',
            type: 'screen',
            name: 'Screen'
        },
        {
            id: 'process',
            type: 'process',
            name: 'Process'
        },
        {
            id: 'readmodel',
            type: 'readmodel',
            name: 'ReadModel'
        },
    ]
};

export const exampleSlices: EMSlice[] = [
    exampleSlice
];
