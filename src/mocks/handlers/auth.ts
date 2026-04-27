import { http, HttpResponse } from 'msw';

import { errorResponse, successResponse } from '@/mocks/envelope';
import { MOCK_TOKENS, mockUser } from '@/mocks/fixtures/user';

const BASE = '/api/v1/auth';

type LoginBody = { email?: string; password?: string };
type RegisterBody = LoginBody & { nickname?: string };

export const authHandlers = [
  http.post(`${BASE}/login`, async ({ request }) => {
    const body = (await request.json().catch(() => null)) as LoginBody | null;

    if (!body?.email || !body?.password) {
      return HttpResponse.json(
        errorResponse({
          message: 'Email and password are required.',
          code: 422,
          reason: 'validation_error',
          errors: {
            ...(body?.email ? {} : { email: ["can't be blank"] }),
            ...(body?.password ? {} : { password: ["can't be blank"] }),
          },
        }),
        { status: 422 },
      );
    }

    return HttpResponse.json(
      successResponse({ ...MOCK_TOKENS, user: mockUser }),
      { status: 200 },
    );
  }),

  http.post(`${BASE}/register`, async ({ request }) => {
    const body = (await request
      .json()
      .catch(() => null)) as RegisterBody | null;

    if (!body?.email || !body?.password || !body?.nickname) {
      return HttpResponse.json(
        errorResponse({
          message: 'Missing fields.',
          code: 422,
          reason: 'validation_error',
        }),
        { status: 422 },
      );
    }

    return HttpResponse.json(
      successResponse({
        ...MOCK_TOKENS,
        user: { ...mockUser, email: body.email, nickname: body.nickname },
      }),
      { status: 201 },
    );
  }),

  http.post(`${BASE}/refresh`, () =>
    HttpResponse.json(successResponse(MOCK_TOKENS), { status: 200 }),
  ),
];
