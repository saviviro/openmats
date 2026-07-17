export const EVENTS_PER_PAGE = 20;

export type PaginationState = {
  page: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  firstItem: number;
  lastItem: number;
};

export function getPaginationState(
  totalItems: number,
  requestedPage: number,
  pageSize = EVENTS_PER_PAGE,
): PaginationState {
  if (!Number.isInteger(totalItems) || totalItems < 0) {
    throw new RangeError("totalItems must be a non-negative integer");
  }

  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new RangeError("pageSize must be a positive integer");
  }

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages === 0) {
    return {
      page: 0,
      totalPages: 0,
      startIndex: 0,
      endIndex: 0,
      firstItem: 0,
      lastItem: 0,
    };
  }

  const page = Math.min(
    Math.max(Math.trunc(requestedPage) || 1, 1),
    totalPages,
  );
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return {
    page,
    totalPages,
    startIndex,
    endIndex,
    firstItem: startIndex + 1,
    lastItem: endIndex,
  };
}
