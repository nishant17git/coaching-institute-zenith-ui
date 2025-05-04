import { safeExecute } from './errorHandler.js';

// Example of wrapping a function
const myFunction = safeExecute(function() {
    // Your existing code here
});

// Example of using try-catch
try {
    // Your potentially error-prone code here
} catch (error) {
    console.error('Error occurred:', error);
    // Handle the error appropriately
}
