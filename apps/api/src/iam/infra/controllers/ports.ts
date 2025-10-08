export interface HttpRequest {
    params?: any
    query?: any
    body?: any
}

export interface HttpResponse {
    statusCode: number
    body?: any,
}