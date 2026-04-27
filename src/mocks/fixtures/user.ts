export type MockUser = {
  id: string;
  email: string;
  nickname: string;
  iracing_customer_id: number | null;
  timezone: string;
  units: 'metric' | 'imperial';
  created_at: string;
};

export const mockUser: MockUser = {
  id: 'user_test_001',
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
} as const;
