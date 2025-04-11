import fetch, { Response } from 'node-fetch';

type ClientFunction = (state: RequestState, apiMethod?: string) => Promise<RequestState>;

const client = (state: RequestState): ClientFunction => async (state) => {
  // Perform the HTTP request using fetch
  const response: Response = await fetch(state.req.url, state.req);

  // Populate the response state
  state.res = {
    headers: response.headers.raw(),
    status: response.status,
  };

  // Read the response body as text
  state.res.body = await response.text();

  // Check if the response is JSON and parse it
  const isJSON = (response.headers.get('content-type') || '').includes('application/json');
  if (isJSON && state.res.body) {
    state.res.body = JSON.parse(state.res.body);
  }

  // Throw an error if the response is not OK
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return state;
};

export default client;