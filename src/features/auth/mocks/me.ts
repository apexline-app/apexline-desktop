import { http, HttpResponse } from 'msw';

import { mockUser } from '@/features/auth/mocks/fixtures/user';
import { errorResponse, successResponse } from '@/shared/api/envelope';

export const meHandlers = [
  http.get('*/api/v1/me', ({ request }) => {
    const auth = request.headers.get('Authorization');
    const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) {
      return HttpResponse.json(
        errorResponse({
          message: 'Missing access token.',
          code: 401,
          reason: 'unauthorized',
        }),
        { status: 401 },
      );
    }
    return HttpResponse.json(successResponse(mockUser), { status: 200 });
  }),
];
