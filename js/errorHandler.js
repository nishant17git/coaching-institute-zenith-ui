// Global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global error handler:', {
        message: msg,
        url: url,
        line: lineNo,
        column: columnNo,
        error: error
    });
    return false;
};

// Unhandled promise rejection handler
window.onunhandledrejection = function(event) {
    console.error('Unhandled promise rejection:', event.reason);
};

// Utility function for try-catch wrapper
export function safeExecute(fn) {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            console.error('Error in function execution:', error);
            // You can add custom error handling here
            throw error;
        }
    };
}
