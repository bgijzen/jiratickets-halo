interface RequestState {
    req: {
      url: string;
      method?: string;
      headers?: Record<string, string>;
      body?: any;
    };
    res?: {
      headers: Record<string, string[]>;
      status: number;
      body?: any;
    };
  }
  