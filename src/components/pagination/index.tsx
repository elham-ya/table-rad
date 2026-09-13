import React, { useState, useMemo, useEffect } from "react";
import styles from "./Pagination.module.scss";

/* ==========================================================================
   ۰) ابزار کمکی: نمایش اعداد با رقم‌های فارسی
   ========================================================================== */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianDigits(value: number | string): string {
  return String(value).replace(
    /[0-9]/g,
    (digit) => PERSIAN_DIGITS[Number(digit)],
  );
}

function fromPersianDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (digit) =>
    String(PERSIAN_DIGITS.indexOf(digit)),
  );
}

/* ==========================================================================
   ۱) منطق اصلی صفحه‌بندی (Logic لایه) — کاملاً مستقل از ظاهر
   ========================================================================== */

const DOTS = "DOTS" as const;
type PageItem = number | typeof DOTS;

function createRange(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => start + index);
}

interface UsePaginationArgs {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  /** تعداد صفحات همسایه در هر سمتِ صفحه‌ی فعلی */
  siblingCount?: number;
}

interface UsePaginationResult {
  totalPages: number;
  pageItems: PageItem[];
  isFirstPage: boolean;
  isLastPage: boolean;
}

function usePagination({
  totalItems,
  pageSize,
  currentPage,
  siblingCount = 1,
}: UsePaginationArgs): UsePaginationResult {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const pageItems = useMemo<PageItem[]>(() => {
    const totalVisible = siblingCount * 2 + 5;

    if (totalVisible >= totalPages) {
      return createRange(1, totalPages);
    }

    const leftSiblingIndex = Math.max(safeCurrentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      safeCurrentPage + siblingCount,
      totalPages,
    );

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftRange = createRange(1, 3 + siblingCount * 2);
      return [...leftRange, DOTS, totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = createRange(
        totalPages - (3 + siblingCount * 2) + 1,
        totalPages,
      );
      return [1, DOTS, ...rightRange];
    }

    const middleRange = createRange(leftSiblingIndex, rightSiblingIndex);
    return [1, DOTS, ...middleRange, DOTS, totalPages];
  }, [totalPages, safeCurrentPage, siblingCount]);

  return {
    totalPages,
    pageItems,
    isFirstPage: safeCurrentPage === 1,
    isLastPage: safeCurrentPage === totalPages,
  };
}

/* ==========================================================================
   ۲) کارتِ دکمه‌های صفحه‌بندی (اول/قبل/شماره‌صفحه‌ها/بعد/آخر)

   نکته‌ی جهت: چون متن راست‌به‌چپ است، «جلو رفتن» به‌سمت چپ است؛ برای همین
   دکمه‌ی «بعد» از « ‹ » و دکمه‌ی «قبل» از « › » استفاده می‌کند.
   ========================================================================== */

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const { totalPages, pageItems, isFirstPage, isLastPage } = usePagination({
    totalItems,
    pageSize,
    currentPage,
    siblingCount,
  });

  // اگر با تغییر تعداد آیتم‌ها صفحه‌ی فعلی از سقف فراتر رفت، اصلاحش کن
  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  const goToPage = (page: number) => {
    onPageChange(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <div className={styles.pgNav}>
      <button
        type="button"
        aria-label="اولین صفحه"
        onClick={() => goToPage(1)}
        disabled={isFirstPage}
        className={styles.pgNavButton}
      >
        <span aria-hidden>«</span>
      </button>
      <button
        type="button"
        aria-label="صفحه‌ی قبل"
        onClick={() => goToPage(currentPage - 1)}
        disabled={isFirstPage}
        className={styles.pgNavButton}
      >
        <span aria-hidden>‹</span>
      </button>

      <span className={styles.pgNavDivider} aria-hidden />

      <ul className={styles.pgNavList}>
        {pageItems.map((item, index) =>
          item === DOTS ? (
            <li key={`dots-${index}`} className={styles.pgNavDots} aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-current={item === currentPage ? "page" : undefined}
                onClick={() => goToPage(item)}
                className={`${styles.pgNavPage} ${item === currentPage ? styles.pgNavPageActive : ""}`}
              >
                {toPersianDigits(item)}
              </button>
            </li>
          ),
        )}
      </ul>

      <span className={styles.pgNavDivider} aria-hidden />

      <button
        type="button"
        aria-label="صفحه‌ی بعد"
        onClick={() => goToPage(currentPage + 1)}
        disabled={isLastPage}
        className={styles.pgNavButton}
      >
        <span aria-hidden>›</span>
      </button>
      <button
        type="button"
        aria-label="آخرین صفحه"
        onClick={() => goToPage(totalPages)}
        disabled={isLastPage}
        className={styles.pgNavButton}
      >
        <span aria-hidden>»</span>
      </button>
    </div>
  );
}

/* ==========================================================================
   ۳) برو‌به‌صفحه (Go to page)
   ========================================================================== */

interface GoToPageProps {
  currentPage: number;
  totalPages: number;
  onGo: (page: number) => void;
}

function GoToPage({ currentPage, totalPages, onGo }: GoToPageProps) {
  const [value, setValue] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(fromPersianDigits(value));
    if (Number.isFinite(parsed) && parsed >= 1) {
      onGo(Math.min(Math.max(Math.trunc(parsed), 1), totalPages));
    }
    setValue("");
  };

  return (
    <div className={styles.pgGoto}>
      <span className={styles.pgGotoLabel}>برو به صفحه</span>
      <form onSubmit={submit} className={styles.pgGotoForm}>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) =>
            setValue(event.target.value.replace(/[^0-9۰-۹]/g, ""))
          }
          placeholder={toPersianDigits(currentPage)}
          aria-label="شماره‌ی صفحه"
          className={styles.pgGotoInput}
        />
        <button type="submit" aria-label="برو" className={styles.pgGotoSubmit}>
          <span aria-hidden>›</span>
        </button>
      </form>
    </div>
  );
}

/* ==========================================================================
   ۴) انتخاب تعداد آیتم در هر صفحه
   ========================================================================== */

interface PageSizeSelectProps {
  value: number;
  options: number[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

function PageSizeSelect({ value, options, onChange }: PageSizeSelectProps) {
  return (
    <div className={styles.pgSize}>
      <select
        value={value}
        onChange={onChange}
        aria-label="تعداد آیتم در هر صفحه"
        className={styles.pgSizeField}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            نمایش {toPersianDigits(option)} تایی
          </option>
        ))}
      </select>
      <span className={styles.pgSizeIcon} aria-hidden>
        ⌄
      </span>
    </div>
  );
}

/* ==========================================================================
   ۵) نوار کامل صفحه‌بندی: تعداد کل + انتخاب تعداد + صفحه‌بندی + برو‌به‌صفحه
   این تنها کامپوننتی است که باید در پروژه‌ی خودتان ایمپورت کنید.
   ========================================================================== */

export interface PaginationToolbarProps {
  /** تعداد کل ردیف‌ها/رکوردها */
  totalItems: number;
  /** صفحه‌ی فعلی (کنترل‌شده از بیرون) */
  pageNumber: number;
  /** تعداد ردیف در هر صفحه (کنترل‌شده از بیرون) */
  size: number;
  /** هر بار که صفحه تغییر کند صدا زده می‌شود */
  onPageChange: (pageNumber: number) => void;
  /** هر بار که تعداد ردیفِ هر صفحه تغییر کند صدا زده می‌شود (خودِ event دراپ‌داون) */
  onSizeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  /** گزینه‌های قابل انتخاب برای تعداد ردیف در هر صفحه */
  pageSizeOptions?: number[];
  /** نمایش متنِ «تعداد کل نتایج» */
  showTotal?: boolean;
  /** نمایش دراپ‌داونِ تغییرِ تعداد ردیف در هر صفحه */
  showSizeChanger?: boolean;
  siblingCount?: number;
}

export function PaginationToolbar({
  totalItems,
  pageNumber,
  size,
  onPageChange,
  onSizeChange,
  pageSizeOptions = [10, 20, 25, 30, 40, 50],
  showTotal = true,
  showSizeChanger = true,
  siblingCount = 1,
}: PaginationToolbarProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / size));

  return (
    <div className={styles.pgToolbar}>
      {showTotal ? (
        <span className={styles.pgToolbarTotal}>
          تعداد کل نتایج: {toPersianDigits(totalItems)}
        </span>
      ) : (
        <span />
      )}

      <div className={styles.pgToolbarControls}>
        {showSizeChanger && (
          <PageSizeSelect
            value={size}
            options={pageSizeOptions}
            onChange={onSizeChange}
          />
        )}

        <Pagination
          currentPage={pageNumber}
          totalItems={totalItems}
          pageSize={size}
          onPageChange={onPageChange}
          siblingCount={siblingCount}
        />
      </div>
      <GoToPage
        currentPage={pageNumber}
        totalPages={totalPages}
        onGo={onPageChange}
      />
    </div>
  );
}

/* ==========================================================================
   ۶) نمونه‌ی استفاده (Demo) — یک فهرست ساده از رکوردها
   ========================================================================== */

interface Record {
  id: number;
  name: string;
  role: string;
}

function buildSampleData(count: number): Record[] {
  const roles = [
    "توسعه‌دهنده",
    "طراح",
    "تحلیل‌گر داده",
    "مدیر محصول",
    "پشتیبانی",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `کاربر شماره ${toPersianDigits(i + 1)}`,
    role: roles[i % roles.length],
  }));
}

const ALL_RECORDS = buildSampleData(137);
const PAGE_SIZE_OPTIONS = [10, 20, 25, 30, 40, 50];
const DEFAULT_SIZE = 10;

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [size, setSize] = useState(DEFAULT_SIZE);

  const visibleRecords = useMemo(() => {
    const start = (currentPage - 1) * size;
    return ALL_RECORDS.slice(start, start + size);
  }, [currentPage, size]);

  // این‌جا محلی است که می‌توانید به رویداد تغییر صفحه دسترسی داشته باشید
  const handlePageChange = (page: number) => {
    console.log("onPageChange ->", page);
    setCurrentPage(page);
  };

  // این‌جا محلی است که می‌توانید به رویداد تغییر تعداد ردیف دسترسی داشته باشید
  // توجه: ورودی این تابع خودِ event دراپ‌داون است، نه عدد آماده
  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("onSizeChange event ->", event);
    const newSize = Number(event.target.value);
    setSize(newSize);
    setCurrentPage(1);
  };

  const rangeStart = (currentPage - 1) * size + 1;
  const rangeEnd = Math.min(currentPage * size, ALL_RECORDS.length);

  return (
    <div className={styles.pgDemo}>
      <div className={styles.pgDemoContainer}>
        <h1 className={styles.pgDemoTitle}>فهرست کاربران</h1>

        <div className={styles.pgDemoCard}>
          <ul className={styles.pgDemoList}>
            {visibleRecords.map((record) => (
              <li key={record.id} className={styles.pgDemoItem}>
                <div>
                  <p className={styles.pgDemoName}>{record.name}</p>
                  <p className={styles.pgDemoRole}>{record.role}</p>
                </div>
                <span className={styles.pgDemoId}>
                  #{toPersianDigits(record.id)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.pgDemoSummary}>
          نمایش {toPersianDigits(rangeStart)} تا {toPersianDigits(rangeEnd)} از
          مجموع {toPersianDigits(ALL_RECORDS.length)} رکورد
        </p>

        <div className={styles.pgDemoFooter}>
          <PaginationToolbar
            totalItems={ALL_RECORDS.length}
            pageNumber={currentPage}
            size={size}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={handlePageChange}
            onSizeChange={handleSizeChange}
            showTotal
            showSizeChanger
          />
        </div>
      </div>
    </div>
  );
}
