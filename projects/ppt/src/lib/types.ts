export type PPTString = string;
export type PPTNumber = number;

// try freeze ???
export const PPTErrorCodes = Object.freeze({
    Unavailable:    'Unavailable',
    Interrupted:    'Interrupted',
    Incorrect:      'Incorrect',
    Forbidden:      'Forbidden',
    Unsupported:    'Unsupported',
    NotFound:       'NotFound',
    Conflict:       'Conflict',
    Fault:          'Fault',
    Busy:           'Busy',
});

export interface PPTError {
    code?: string;
    message: string;
}


// response - or generic ... maybe command ??
export interface PPTResult<T> {
    success?: T;
    failure?: PPTError[];
}

export type PPTFailureResult = PPTResult<undefined>;
