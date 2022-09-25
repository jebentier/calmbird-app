const BASE_URL = 'http://localhost:3000/mobile';

const authedFetch = async (path, { token, setError, setLoading }, options = {}) => {
  setLoading(true);
  try {
    const response = await fetch(`${BASE_URL}/${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }

};

export { authedFetch, BASE_URL };
