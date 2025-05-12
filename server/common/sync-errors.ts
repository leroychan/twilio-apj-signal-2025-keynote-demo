export function isSyncNotFound(error: any) {
  return isSyncMapNotFound(error) || isSyncMapItemNotFound(error);
}

export function isSyncMapNotFound(error: any) {
  return (
    typeof error === "object" &&
    "status" in error &&
    "code" in error &&
    error.status === 404 &&
    error.code === 20404
  );
}

export function isSyncMapItemNotFound(error: any) {
  return (
    typeof error === "object" &&
    "status" in error &&
    "code" in error &&
    error.status === 404 &&
    error.code === 54201
  );
}

export function isSyncRateLimitError(error: any) {
  return (
    typeof error === "object" &&
    "status" in error &&
    "code" in error &&
    error.status === 429 &&
    error.code === 54009
  );
}

export function isSyncItemAlreadyCreated(error: any) {
  return (
    typeof error === "object" &&
    "status" in error &&
    "code" in error &&
    error.status === 409 &&
    error.code === 54208
  );
}
