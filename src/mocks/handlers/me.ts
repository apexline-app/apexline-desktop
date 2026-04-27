import { http, HttpResponse } from 'msw';

import { errorResponse, successResponse } from '@/mocks/envelope';
import { mockUser } from '@/mocks/fixtures/user';

export const meHandlers = [
  http.get('/api/v1/me', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
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
