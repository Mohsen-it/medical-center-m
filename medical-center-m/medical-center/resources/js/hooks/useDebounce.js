import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(
        () => {
            // Set debouncedValue to value (passed in) after the specified delay
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            // Cancel the timeout if value changes (also on delay change or unmount)
            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay] // Only re-call effect if value or delay changes
    );

    return debouncedValue;
}

export function useDebounceCallback(callback, delay) {
    const [debounceTimer, setDebounceTimer] = useState(null);

    const debouncedCallback = (...args) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const newTimer = setTimeout(() => {
            callback(...args);
        }, delay);

        setDebounceTimer(newTimer);
    };

    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return debouncedCallback;
}