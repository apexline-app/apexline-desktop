import { http, HttpResponse } from 'msw';

import { errorResponse, successResponse } from '@/mocks/envelope';
import { mockUser } from '@/mocks/fixtures/user';

type SignUpBody = {
  user?: { email?: string; password?: string; nickname?: string };
};

export const usersHandlers = [
  http.post('*/api/v1/users', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as SignUpBody | null;
    const payload = body?.user;

    if (!payload?.email || !payload?.password || !payload?.nickname) {
      return HttpResponse.json(
        errorResponse({
          message: 'Missing fields.',
          code: 422,
          reason: 'validation_error',
          errors: {
            ...(payload?.email ? {} : { email: ["can't be blank"] }),
            ...(payload?.password ? {} : { password: ["can't be blank"] }),
            ...(payload?.nickname ? {} : { nickname: ["can't be blank"] }),
          },
        }),
        { status: 422 },
      );
    }

    return HttpResponse.json(
      successResponse({
        ...mockUser,
        email: payload.email,
        nickname: payload.nickname,
      }),
      { status: 201 },
    );
  }),
];
