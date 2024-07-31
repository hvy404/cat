import { useEffect, useState } from "react";

/**
 * Custom hook for managing a value in local storage.
 *
 * @template T - The type of the value to be stored in local storage.
 * @param {string} key - The key used to identify the value in local storage.
 * @param {T} initialValue - The initial value to be stored in local storage.
 * @returns {[T, (value: T) => void]} - A tuple containing the stored value and a function to update the value.
 */
const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  // eslint-disable-next-line no-unused-vars
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    // Retrieve from localStorage
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, [key]);

  const setValue = (value: T) => {
    // Save state
    setStoredValue(value);
    // Save to localStorage
    window.localStorage.setItem(key, JSON.stringify(value));
  };
  return [storedValue, setValue];
};

export default useLocalStorage;
