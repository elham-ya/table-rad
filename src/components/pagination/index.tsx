import React from "react";
import {
  Pagination as RSPagination,
  PaginationItem,
  PaginationLink,
  Row,
  Col,
  Input,
  Label,
} from "reactstrap";
import { TablePaginationProps } from "../../types/index";
import styles from "./pagination.module.scss";
// import { ChevronLeft, ChevronRight } from 'react-feather'; // اختیاری: آیکون زیبا

const TablePagination: React.FC<TablePaginationProps> = ({
  totalCount = 0,
  pageNumber = 1,
  size = 10,
  onPageChange,
  onSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showSizeChanger = true,
  showTotal = true,
  className = "",
}) => {
  const totalPages = Math.ceil(totalCount / size) || 1;
  const currentPage = Math.max(1, Math.min(pageNumber, totalPages));

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * size + 1;
  const endItem = Math.min(currentPage * size, totalCount);

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    onSizeChange?.(newSize);
    // اختیاری: برو به صفحه ۱ وقتی سایز عوض میشه
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  // تولید آرایه صفحات برای نمایش (مثل 1,2,3,...,10)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        // pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        // pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        // pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        // pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`table-pagination ${className} ${styles.table_wrapper}`}>
      <Row className="align-items-center justify-content-between py-2">
        {/* نمایش تعداد کل و بازه */}
        {showTotal && (
          <Col md="4" className="mb-2 mb-md-0 text-right">
            <span className="text-muted small">
              تعداد کل نتایج: {totalCount.toLocaleString("fa-IR")}
            </span>
          </Col>
        )}
        {/* صفحه‌بندی اصلی */}
        <Col md={showSizeChanger ? "4" : "8"} className="text-center">
          <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap py-2">
            {/* دراپ‌داون تعداد آیتم در صفحه - دقیقاً کنار دکمه اولین صفحه */}
            {showSizeChanger && (
              <div className="d-flex align-items-center">
                <Input
                  type="select"
                  value={size}
                  onChange={handleSizeChange}
                  bsSize="sm"
                  className={styles.goToPage}
                  style={{
                    width: "100px",
                    height: "38px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    backgroundColor: "#fff",
                  }}
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} تایی
                    </option>
                  ))}
                </Input>
              </div>
            )}
            <RSPagination
              className={`justify-content-center mb-0 ${styles.customPagination}`}
              size="sm"
            >
              {/* اولین صفحه - دکمه جدید */}
              <PaginationItem
                disabled={currentPage === 1}
                className={styles.li_item}
              >
                <PaginationLink
                  first
                  onClick={() => handlePageClick(1)}
                  className={styles.btn_li_item}
                >
                  «
                </PaginationLink>
              </PaginationItem>

              {/* قبلی */}
              <PaginationItem
                disabled={currentPage === 1}
                className={styles.li_item}
              >
                <PaginationLink
                  previous
                  onClick={() => handlePageClick(currentPage - 1)}
                  className={styles.btn_li_item}
                >
                  ‹
                </PaginationLink>
              </PaginationItem>

              {/* شماره صفحات */}
              {getPageNumbers().map((page, index) => (
                <PaginationItem
                  key={page}
                  active={page === currentPage}
                  className={styles.li_item}
                >
                  <PaginationLink
                    onClick={() => handlePageClick(page as number)}
                    className={styles.btn_li_item}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* بعدی */}
              <PaginationItem
                disabled={currentPage === totalPages}
                className={styles.li_item}
              >
                <PaginationLink
                  next
                  onClick={() => handlePageClick(currentPage + 1)}
                  className={styles.btn_li_item}
                >
                  ›
                </PaginationLink>
              </PaginationItem>

              {/* آخرین صفحه  */}
              <PaginationItem
                disabled={currentPage === totalPages}
                className={styles.li_item}
              >
                <PaginationLink
                  last
                  onClick={() => handlePageClick(totalPages)}
                  className={styles.btn_li_item}
                >
                  »
                </PaginationLink>
              </PaginationItem>
            </RSPagination>
          </div>
        </Col>

        {/* تغییر سایز صفحه */}

        <Col md="4" className="text-md-end">
          <div className="d-flex align-items-center justify-content-end gap-2">
            <Label for="pageSize" className="mb-0 small text-muted ml-2">
              برو به صفحه
            </Label>
            <Input
              type="select"
              id="pageSize"
              value={size}
              onChange={handleSizeChange}
              style={{ width: "auto", display: "inline-block" }}
              bsSize="sm"
              className={styles.goToPage}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Input>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default TablePagination;
