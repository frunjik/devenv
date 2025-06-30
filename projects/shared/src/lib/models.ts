export type EMElementType = 'event' | 'command' | 'process' | 'screen' | 'readmodel';

export interface EMElement {
    id: string;
    name: string;
    type: EMElementType;
}

export interface EMSlice {
    id: string;
    name: string;
    elements: EMElement[];
}
