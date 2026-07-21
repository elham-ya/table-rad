import React, { useState, useRef, useLayoutEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { ActionItem, ButtonActionProps } from "../../types/index";
import { Button } from "reactstrap";
import styles from "./button.module.scss";

const ActionRenderer: React.FC<ButtonActionProps> = ({
  row,
  actions,
  strings,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const rafRef = useRef<number | null>(null);

  const toggle = () => setDropdownOpen((prev) => !prev);
  const close = useCallback(() => setDropdownOpen(false), []);

  const calculatePosition = useCallback(() => {
    const btn = toggleRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth || 180;
    const menuHeight = menuRef.current?.offsetHeight || 0;
    const spaceBelow = window.innerHeight - rect.bottom;

    let left = rect.right - menuWidth;
    if (left < 8) left = rect.left;

    const openAbove =
      spaceBelow < (menuHeight || 150) && rect.top > (menuHeight || 150);
    const top = openAbove ? rect.top - (menuHeight || 0) - 4 : rect.bottom + 4;

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
    if (!dropdownOpen) return;

    calculatePosition();

    // فقط کلیک باعث بسته شدن میشه: بیرون از منو، روی toggle خودش، یا روی toggle هر دراپ‌داون دیگه
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideMenu = menuRef.current?.contains(target);
      const clickedOnOwnToggle = toggleRef.current?.contains(target);

      if (!clickedInsideMenu && !clickedOnOwnToggle) {
        close();
      }
      // نکته: کلیک روی toggle خودش عمداً از close() مستثنی شده،
      // چون آنکلیک آن، toggle() را صدا میزند و خودش state را برعکس میکند
    };

    // فقط برای دنبال کردن موقعیت دکمه هنگام اسکرول — بدون بستن دراپ‌داون
    window.addEventListener("scroll", scheduleReposition, true);
    window.addEventListener("resize", scheduleReposition);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", scheduleReposition, true);
      window.removeEventListener("resize", scheduleReposition);
      document.removeEventListener("mousedown", handleClickOutside);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dropdownOpen, calculatePosition, scheduleReposition, close]);

  const renderIcon = (icon: string | React.ReactNode) => {
    if (!icon) {
      return <i className="fas fa-bars" style={{ width: "20px" }} />;
    }
    if (typeof icon === "string") {
      return <i className={icon} style={{ width: "20px" }} />;
    }
    return (
      <span style={{ display: "inline-flex", width: "20px" }}>{icon}</span>
    );
  };

  const handleActionClick = (action: ActionItem) => {
    if (!action) return;
    setDropdownOpen(false);
    if (action.onClick) {
      action.onClick(row);
    }
    if (action.href) {
      if (action.target === "_blank") {
        window.open(action.href, "_blank");
      } else {
        window.location.href = action.href;
      }
    }
  };

  const actionItems = typeof actions === "function" ? actions(row) : actions;
  if (!actionItems || !Array.isArray(actionItems) || actionItems.length === 0)
    return null;

  let finalActions = actionItems.filter((item) => item.visible !== false);
  if (finalActions.length === 0) return null;

  const firstAction = finalActions[0];
  const dropdownActions = finalActions.slice(1);

  return (
    <div className={styles.action_button_wrapper}>
      <Button
        className={`border-0 bg-transparent p-0 shadow-none d-flex align-items-center gap-2 ${styles.firstBtn}`}
        onClick={() => handleActionClick(firstAction)}
        disabled={firstAction.disable}
      >
        {renderIcon(firstAction.icon)}
        <span>{firstAction.title}</span>
      </Button>

      {dropdownActions.length > 0 && (
        <>
          <button
            ref={toggleRef}
            type="button"
            onClick={toggle}
            className={`p-0 border-0 bg-transparent shadow-none ${styles.action_dropdown_wrapper}`}
            style={{ boxShadow: "none" }}
          >
            <i className="fas fa-bars" />
          </button>

          {dropdownOpen &&
            ReactDOM.createPortal(
              <div
                ref={menuRef}
                className={`dropdown-menu show ${styles.portalDropdownMenu}`}
                style={{
                  borderRadius: "8px",
                  textAlign: "right",
                  ...menuStyle,
                }}
              >
                <div className={`${styles.dropdown_header} border-b`}>
                  عملیات
                </div>
                {dropdownActions.map((item, index) => (
                  <React.Fragment key={item.uniqueId || index}>
                    <button
                      type="button"
                      className={`${styles.dropdownItem} ${item.className || ""}`}
                      onClick={() => handleActionClick(item)}
                      disabled={item.disable}
                    >
                      {renderIcon(item.icon)}
                      <span>{item.title}</span>
                    </button>
                    <div
                      className={`${styles.dropdown_divider_line} dropdown-divider`}
                    />
                  </React.Fragment>
                ))}
              </div>,
              document.body,
            )}
        </>
      )}
    </div>
  );
};

export default ActionRenderer;
