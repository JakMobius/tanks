
export class APIError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export enum APIGenericErrorType {
    connectionError,
    abortError,
    timeoutError,
    notAllowedError,
    invalidJSON
}

export class APIServerError extends APIError {
    type: string
    message: string
    constructor(type: string, message: string) {
        super(type);
        this.name = 'ApiServerError';
        this.type = type
        this.message = message
    }
}

export class APIGenericError extends APIError {
    type: APIGenericErrorType

    constructor(type: APIGenericErrorType) {
        super(APIGenericErrorType[type]);
        this.name = 'ApiGenericError';
        this.type = type;
    }
}

export class APIHTTPError extends APIError {
    status: number

    constructor(status: number) {
        super("HTTP Error " + status);
        this.name = 'ApiHTTPError';
        this.status = status;
    }
}

type APIRequestInit = RequestInit & {
    timeout?: number
    type?: "json" | "arraybuffer"
}

export const defaultTimeout = 5000

export async function api(input: RequestInfo | URL, init?: APIRequestInit & { type? : "json" }): Promise<any>
export async function api(input: RequestInfo | URL, init?: APIRequestInit & { type : "arraybuffer" }): Promise<ArrayBuffer>
export async function api(input: RequestInfo | URL, init?: APIRequestInit): Promise<any | ArrayBuffer> {
    let timeout = init?.timeout ?? defaultTimeout
    let signal = init?.signal

    if(timeout < Infinity) {
        let timeoutSignal = AbortSignal.timeout(timeout)
        if(signal) signal = AbortSignal.any([signal, timeoutSignal])
        else signal = timeoutSignal
    } 

    const handleTryCatchError = (error: any, response?: Response) => {
        if(response && response.status >= 400) {
            // That would be more informative than anything from below
            throw new APIHTTPError(response.status)
        }
        if(error instanceof SyntaxError) {
            throw new APIGenericError(APIGenericErrorType.invalidJSON)
        }
        if(error instanceof DOMException) {
            if(error.name === "AbortError") {
                throw new APIGenericError(APIGenericErrorType.abortError)
            } else if(error.name === "TimeoutError") {
                throw new APIGenericError(APIGenericErrorType.timeoutError)
            } else if(error.name === "NotAllowedError") {
                throw new APIGenericError(APIGenericErrorType.notAllowedError)
            }
        } else if(error instanceof TypeError) {
            throw new APIGenericError(APIGenericErrorType.connectionError)
        }
    }

    let mode = init?.type ?? "json"

    let response
    try {
        response = await fetch(input, {
            headers: {
                "Content-Type": "application/json",
                "Accept": mode === "json" ? "application/json" : "application/octet-stream"
            },
            ...init,
            signal: signal
        })
    } catch (error) {
        handleTryCatchError(error)
    }

    if(mode === "json") {
        let json
        try {
            json = await response.json()
        } catch (error) {
            handleTryCatchError(error, response)
        }

        if(json.error) {
            throw new APIServerError(json.error, json.message)
        }
        return json
    }

    if(mode === "arraybuffer") {
        let arrayBuffer
        try {
            arrayBuffer = await response.arrayBuffer()
        }
        catch (error) {
            handleTryCatchError(error, response)
        }
        return arrayBuffer
    }
    
    return undefined
}