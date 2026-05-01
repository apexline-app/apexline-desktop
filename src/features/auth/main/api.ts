import {
  type SignUpInput,
  type User,
  UserSchema,
} from '@/features/auth/contracts';
import { API_PATHS } from '@/shared/api/api-paths';
import { getApiClient } from '@/shared/api/http-client';

export const fetchMe = async (accessToken: string): Promise<User> => {
  const [user, error] = await getApiClient().get(API_PATHS.ME, {
    schema: UserSchema,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw new Error(error.reason);
  return user;
};

export const signUpUser = async (input: SignUpInput): Promise<User> => {
  const [user, error] = await getApiClient().post(
    API_PATHS.USERS,
    { user: input },
    { schema: UserSchema },
  );
  if (error) throw new Error(error.reason);
  return user;
};
