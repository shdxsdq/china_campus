import Link from "next/link";

const createPageHref = (basePath: string, page: number) =>
  page <= 1 ? basePath : `${basePath}?page=${page}`;

export function PaginationNav({
  basePath,
  currentPage,
  totalPages,
  totalItems,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-block">
      <p className="pagination-summary">
        共 {totalItems} 条，当前第 {currentPage} / {totalPages} 页
      </p>
      <nav className="pagination-nav" aria-label="分页导航">
        {currentPage > 1 ? (
          <Link className="pagination-control" href={createPageHref(basePath, currentPage - 1)}>
            上一页
          </Link>
        ) : (
          <span className="pagination-control is-disabled">上一页</span>
        )}

        <div className="pagination-pages">
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;

            return page === currentPage ? (
              <span key={page} className="pagination-page is-current" aria-current="page">
                {page}
              </span>
            ) : (
              <Link key={page} className="pagination-page" href={createPageHref(basePath, page)}>
                {page}
              </Link>
            );
          })}
        </div>

        {currentPage < totalPages ? (
          <Link className="pagination-control" href={createPageHref(basePath, currentPage + 1)}>
            下一页
          </Link>
        ) : (
          <span className="pagination-control is-disabled">下一页</span>
        )}
      </nav>
    </div>
  );
}
