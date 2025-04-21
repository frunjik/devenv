export type PPTString = string;
export type PPTNumber = number;

export interface PPTError {
    code?: string;
    message: string;
}

export interface PPTResult<T> {
    success?: T;
    failure?: PPTError[];
}

