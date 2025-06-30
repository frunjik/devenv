import { type EMSlice } from '@shared';

export const slices: EMSlice[] = [
    {
        id: 'SlicesView',
        elements: [
            {
                id: '1',
                name: 'Slice[]',
                type: 'readmodel'
            },
            {
                id: '2',
                name: 'SlicesView',
                type: 'screen'
            },
        ]
    },
    {
        id: 'Agent',
        elements: [
            {
                id: '1',
                name: 'Screen',
                type: 'screen'
            },
            {
                id: '2',
                name: 'Command',
                type: 'command'
            },
        ]
    },
    {
        id: 'Command',
        elements: [
            {
                id: '1',
                name: 'Command',
                type: 'command'
            },
            {
                id: '2',
                name: 'Event',
                type: 'event'
            },
        ]
    },
    {
        id: 'Process',
        elements: [
            {
                id: '1',
                name: 'Event',
                type: 'event'
            },
            {
                id: '2',
                name: 'Process',
                type: 'process'
            },
            {
                id: '3',
                name: 'Event',
                type: 'event'
            },
        ]
    },
    {
        id: 'Query',
        elements: [
            {
                id: '1',
                name: 'Event',
                type: 'event'
            },
            {
                id: '2',
                name: 'ReadModel',
                type: 'readmodel'
            },
        ]
    },
    {
        id: 'View',
        elements: [
            {
                id: '1',
                name: 'ReadModel',
                type: 'readmodel'
            },
            {
                id: '2',
                name: 'Screen',
                type: 'screen'
            },
        ]
    },
    {
        id: 'Projection',
        elements: [
            {
                id: '1',
                name: 'Event',
                type: 'event'
            },
            {
                id: '2',
                name: 'Process',
                type: 'process'
            },
            {
                id: '3',
                name: 'ReadModel',
                type: 'readmodel'
            },
        ]
    },
];
