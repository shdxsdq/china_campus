const DEFAULT_PAGE_SIZE = 10;

const parsePageNumber = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number.parseInt(rawValue ?? "1", 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
};

export const paginateItems = <T>(
  items: T[],
  page: string | string[] | undefined,
  pageSize = DEFAULT_PAGE_SIZE,
) => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(parsePageNumber(page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    items: items.slice(startIndex, startIndex + pageSize),
  };
};

export const POSTS_PER_PAGE = DEFAULT_PAGE_SIZE;
