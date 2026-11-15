import React, { useState, useRef, useLayoutEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { BulkActionItem } from "../../types/index";
import styles from "./bulkActions.module.scss";

export interface BulkActionsProps {
  /** لیست اکشن‌ها — از قبل با visible فیلتر شده‌اند */
  actions: BulkActionItem[];
  /** وقتی هیچ ردیفی در صفحه‌ی فعلی انتخاب نشده، دکمه غیرفعال است */
  disabled?: boolean;
  /** پس از بستن منو، با آیتم کلیک‌شده صدا زده می‌شود */
  onActionClick: (action: BulkActionItem) => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  actions,
  disabled = false,
  onActionClick,
}) => {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const rafRef = useRef<number | null>(null);

  const toggle = () => setOpen((prev) => !prev);
  const close = useCallback(() => setOpen(false), []);

  // موقعیت‌یابی منو: همان منطق اصلاح‌شده‌ی دراپ‌داون عملیات
  // (تصمیم بالا/پایین بر اساس فضای موجود + مهار در viewport)
  const calculatePosition = useCallback(() => {
    const btn = toggleRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();

    const GAP = 4; // فاصله‌ی منو از دکمه
    const EDGE = 8; // حداقل فاصله‌ی امن از لبه‌های viewport

    const menuWidth = menuRef.current?.offsetWidth || 180;
    const menuHeight = menuRef.current?.offsetHeight || 0;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const fitsBelow = spaceBelow >= menuHeight + GAP;
    const fitsAbove = spaceAbove >= menuHeight + GAP;
    const openAbove = !fitsBelow && fitsAbove;

    let top = openAbove ? rect.top - menuHeight - GAP : rect.bottom + GAP;

    // مهار عمودی در viewport (بدون اسکرول داخلی)
    const maxTop = window.innerHeight - menuHeight - EDGE;
    if (maxTop >= EDGE) {
      top = Math.max(EDGE, Math.min(top, maxTop));
    }

    // افقی: تراز لبه‌ی راست منو با لبه‌ی راست دکمه (RTL) + مهار در viewport
    let left = rect.right - menuWidth;
    const maxLeft = window.innerWidth - menuWidth - EDGE;
    if (maxLeft >= EDGE) {
      left = Math.max(EDGE, Math.min(left, maxLeft));
    } else {
      left = EDGE;
    }

    setMenuStyle({
      position: "fixed",
      top,
      left,
      zIndex: 1050,
      minWidth: rect.width < 150 ? 170 : rect.width,
    });
  }, []);

  const scheduleReposition = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(calculatePosition);
  }, [calculatePosition]);

  useLayoutEffect(() => {
    if (!open) return;
    calculatePosition();
    // پاس دوم بعد از اولین paint: ارتفاع واقعی منو اندازه‌گیری شود
    scheduleReposition();

    // بستن فقط با کلیک بیرون از منو و بیرون از دکمه‌ی اصلی
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideMenu = menuRef.current?.contains(target);
      const clickedOnOwnToggle = toggleRef.current?.contains(target);
      if (!clickedInsideMenu && !clickedOnOwnToggle) {
        close();
      }
    };

    // دنبال‌کردن دکمه هنگام اسکرول/resize — بدون بستن منو
    window.addEventListener("scroll", scheduleReposition, true);
    window.addEventListener("resize", scheduleReposition);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", scheduleReposition, true);
      window.removeEventListener("resize", scheduleReposition);
      document.removeEventListener("mousedown", handleClickOutside);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, calculatePosition, scheduleReposition, close]);

  // کلیک روی آیتم: اول منو بسته می‌شود، بعد اطلاع به جدول
  const handleItemClick = (action: BulkActionItem) => {
    setOpen(false);
    onActionClick(action);
  };

  const renderIcon = (icon: string | React.ReactNode) => {
    if (typeof icon === "string") {
      return <i className={icon} style={{ width: "20px" }} />;
    }
    return (
      <span style={{ display: "inline-flex", width: "20px" }}>{icon}</span>
    );
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        className={`${styles.bulk_toggle_btn} ${
          open ? styles.bulk_toggle_open : ""
        }`}
      >
        <span>عملیات دسته‌ای</span>
        <i className="fas fa-chevron-down" aria-hidden="true" />
      </button>
      {open &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            className={`dropdown-menu show ${styles.portalBulkMenu}`}
            style={{ borderRadius: "12px", textAlign: "right", ...menuStyle }}
          >
            {actions.map((item, index) => (
              <button
                key={item.uniqueId || index}
                type="button"
                className={`${styles.bulkItem} ${item.className || ""}`}
                onClick={() => handleItemClick(item)}
              >
                {item.icon ? renderIcon(item.icon) : null}
                <span>{item.title}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};

export default BulkActions;
