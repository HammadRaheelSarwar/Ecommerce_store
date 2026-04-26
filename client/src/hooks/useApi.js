import { useState, useCallback } from 'react';
import { apiUrl } from '../lib/api';

const useApi = (url, options = {}, retries = 3, backoff = 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (customUrl = url, customOptions = {}) => {
    setLoading(true);
    setError(null);
    let attempts = 0;
    
    // Merge options dynamically
    const fetchOptions = { ...options, ...customOptions };
    const resolvedUrl = apiUrl(customUrl);

    const attemptFetch = async () => {
      try {
        // Enforce Timeout Controller natively
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000); // 10s default

        const res = await fetch(resolvedUrl, { ...fetchOptions, signal: controller.signal });
        clearTimeout(id);

        let json;
        try {
           json = await res.json();
        } catch(e) {
           throw new Error("Invalid Server Response");
        }

        if (!res.ok) {
          throw new Error(json.message || `HTTP Request Failed with Status: ${res.status}`);
        }
        
        setData(json);
        setLoading(false);
        return json;
      } catch (err) {
        attempts++;
        if (attempts < retries && err.name !== 'AbortError') {
          console.warn(`Network retry ${attempts}/${retries}... waiting ${backoff}ms`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          return attemptFetch();
        } else {
          setError(err.message || 'Fatal Network Timeout');
          setLoading(false);
          throw err;
        }
      }
    };

    return attemptFetch();
  }, [url]);

  return { data, loading, error, execute };
};

export default useApi;
