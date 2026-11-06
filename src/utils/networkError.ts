export function isNetworkError(error: unknown): boolean {
    const message =
        typeof error === 'object' && error !== null && 'message' in error
            ? error.message
            : error;

    return (
        typeof message === 'string' &&
        /Network request failed|Failed to fetch|fetch failed/i.test(message)
    );
}