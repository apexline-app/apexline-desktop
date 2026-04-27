export type SuccessEnvelope<T> = {
  result: 'success';
  data: T;
  _meta: Record<string, unknown> | null;
};

export type ErrorMeta = {
  message: string | null;
  code: number;
  reason: string;
  errors?: Record<string, string[]>;
};

export type ErrorEnvelope = {
  result: 'error';
  data: null;
  _meta: ErrorMeta;
};

export type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

export function successResponse<T>(
  data: T,
  meta: SuccessEnvelope<T>['_meta'] = null,
): SuccessEnvelope<T> {
  return { result: 'success', data, _meta: meta };
}

export function errorResponse(meta: ErrorMeta): ErrorEnvelope {
  return { result: 'error', data: null, _meta: meta };
}
