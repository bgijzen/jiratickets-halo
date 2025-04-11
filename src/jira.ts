import client from './client';
import { get } from 'lodash';
import { format, UrlObject } from 'url';

interface JiraConfig {
  baseUrl: string;
  token: string;
  email: string;
}

interface FetchOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

interface FetchParams {
  host?: string;
  pathname: string;
  query?: Record<string, any>;
}

class Jira {
  private baseUrl: string;
  private token: string;
  private email: string;

  constructor({ baseUrl, token, email }: JiraConfig) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.email = email;
  }

  async getIssue(issueId: string, query: { fields?: string[]; expand?: string[] } = {}): Promise<any> {
    const { fields = [], expand = [] } = query;

    try {
      const res = await this.fetch('getIssue', {
        pathname: `/rest/api/2/issue/${issueId}`,
        query: {
          fields: fields.join(','),
          expand: expand.join(','),
        },
      });

      return res;
    } catch (error: any) {
      if (get(error, 'res.status') === 404) {
        return undefined;
      }

      throw error;
    }
  }
  
  private async fetch(
    apiMethodName: string,
    { host, pathname, query }: FetchParams,
    { method = 'GET', body, headers = {} }: FetchOptions = {}
  ): Promise<any> {
    const url = format({
      host: host || this.baseUrl,
      pathname,
      query,
    } as UrlObject);

    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (!headers.Authorization) {
      headers.Authorization = `Basic ${Buffer.from(`${this.email}:${this.token}`).toString('base64')}`;
    }

    if (body && headers['Content-Type'] === 'application/json') {
      body = JSON.stringify(body);
    }

    let state: RequestState = {
      req: {
        method,
        headers,
        body,
        url,
      },
    };

    try {
      await client(state);
    } catch (error: any) {
      const fields = {
        originError: error,
        source: 'jira',
      };

      delete state.req.headers;

      throw Object.assign(new Error('Jira API error'), state, fields);
    }

    return state.res!.body;
  }
}

export default Jira;