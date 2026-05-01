import type {
  ErrorMeta,
  ErrorResponse,
  StandardResponse,
  ValidationErrorMeta,
  ValidationErrorResponse,
} from '@apexline-app/http-toolkit-js/types';

export type SuccessEnvelope<T> = StandardResponse<T, Record<string, unknown>>;
export type ErrorEnvelope = ErrorResponse;
export type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

export type { ErrorMeta, ValidationErrorMeta, ValidationErrorResponse };

export const successResponse = <T>(
  data: T,
  meta: SuccessEnvelope<T>['_meta'] = null,
): SuccessEnvelope<T> => ({ result: 'success', data, _meta: meta });

export const errorResponse = (
  meta: ErrorMeta | ValidationErrorMeta,
): ErrorResponse => ({ result: 'error', data: null, _meta: meta });
