export type MockUser = {
  pid: string;
  email: string;
  nickname: string;
  iracing_customer_id: number | null;
  timezone: string;
  units: 'metric' | 'imperial';
  created_at: string;
};

export const mockUser: MockUser = {
  pid: 'usr_test_001',
  email: 'daniel@apexline.test',
  nickname: 'daniel',
  iracing_customer_id: null,
  timezone: 'Europe/Warsaw',
  units: 'metric',
  created_at: '2026-04-26T10:00:00Z',
};

export const MOCK_TOKENS = {
  access_token: 'mock.jwt.access',
  refresh_token: 'mock.jwt.refresh',
  expires_in: 3600,
  token_type: 'Bearer',
} as const;
