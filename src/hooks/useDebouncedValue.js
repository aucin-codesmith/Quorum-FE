import { useEffect, useState } from "react";

// Delays a fast-changing value (e.g. a search box) so it does not fire a request per keystroke.
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
