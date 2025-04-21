export interface SuccessResponseBody<T> {
    data: T;
}

export interface FailureResponseBody {
    error: {
        message: string;
    };
}
