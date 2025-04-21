import { PPTFailureResult, PPTErrorCodes } from "./types";

// safely handles circular references
export const safeStringify = (obj: any, indent = 2) => {
    const cache: string[] = [];
    const retVal = JSON.stringify(
        obj,
        (key, value) =>
            typeof value === "object" && value !== null
                ? cache.includes(value)
                    ? `**circular(${key}:${value})**`   // Duplicate reference found, replace with marker
                    : cache.push(value) && value        // Store value in our collection
                : value,
        indent
    );
    return retVal;
};

// There are 7 primitive data types:
// string
// number
// bigint
// boolean
// undefined
// symbol
// null


// TODO: test - and make complete ...
export function getType(a: any): string {
    if (isNull(a)) return 'null';
    if (isArray(a)) return 'array';
    if (isUndefined(a)) return 'undefined';
    return typeof a;
}

export function isNull(a: any): boolean {
    return a === null;
}

export function isUndefined(a: any): boolean {
    return a === undefined;
}

export function isArray(a: any): boolean {
    return Array.isArray(a);
}

export function isString(a: any): boolean {
    return typeof a === 'string';
}

export function first(a: any): any {
    return a[0];
}

export function nth(a: any, n: number): any {
    return a[n];
}

export function last(a: any): any {
    return (isArray(a) || isString(a)) ? a[a.length - 1] : undefined
}

export function createFailureResult(code: string, message: string): PPTFailureResult {
    return {
        failure: [
            {
                code,
                message
            }
        ]
    };
}

export function createFailureIncorrect(message: string): PPTFailureResult {
    return createFailureResult(PPTErrorCodes.Incorrect, message);
}
