import React, { useEffect, useState } from "react";
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
import GotoPageIcon from "../../assets/icons/ItemArrow.svg";

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


  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("e handleSizeChange:", e);
    const newSize = Number(e.target.value);
    onSizeChange?.(newSize);
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(totalPages);
      }
    }
    return pages;
  };

  useEffect(() => {
    setValue(String(""));
  }, [currentPage]);

  const [value, setValue] = useState(String(currentPage));

  const handleGoToPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("e handleGoToPageChange:", e.target.value);
    onPageChange(Number(e.target.value));
    setValue(e.target.value);
  };
  const submit = () => {
    const n = parseInt(value.trim(), 10);
    if (Number.isNaN(n)) return; // ignore invalid input
    const page = Math.max(1, Math.min(totalPages || 1, n));
    if (page !== currentPage && typeof onPageChange === "function") {
      onPageChange(page);
    } else {
      // keep input normalized to a valid page
      setValue(String(page));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit();
    }
  };

  return (
    <div className={`table-pagination ${className} ${styles.table_wrapper}`}>
      <Row className="align-items-center justify-content-between py-2">
        {showTotal && (
          <Col md="4" className="mb-2 mb-md-0 text-right">
            <span className="text-muted small">
              تعداد کل نتایج: {totalCount.toLocaleString("fa-IR")}
            </span>
          </Col>
        )}
        <Col md={showSizeChanger ? "4" : "8"} className="text-center">
          <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap py-2">
            {showSizeChanger && (
              <div
                className={`d-inline-flex align-items-center ${styles.sizeChangerContainer}`}
              >
                <Input
                  type="select"
                  value={size}
                  onChange={handleSizeChange}
                  className={styles.selectSizeOption}
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      نمایش {option} تایی
                    </option>
                  ))}
                </Input>
              </div>
            )}
            <RSPagination
              className={`justify-content-center mb-0 ${styles.customPagination}`}
              size="sm"
            >
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
              {getPageNumbers().map((page) => (
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
        <Col md="4" className="text-md-end">
          <div
            className={`d-flex align-items-center justify-content-end gap-2 ${styles.goToPageContainer}`}
          >
            <Label for="pageSize" className="mb-0 small text-muted ml-2">
              برو به صفحه
            </Label>
            <Input
              type="text"
              id="pageSize"
              value={pageNumber}
              onChange={handleGoToPageChange}
              onKeyDown={onKeyDown}
              className={styles.goToPage}
            ></Input>
            <button
              type="button"
              onClick={submit}
              aria-label="Go to page"
              className={styles.go_to_Page_btn}
            >
              <img src={GotoPageIcon} />
            </button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default TablePagination;
