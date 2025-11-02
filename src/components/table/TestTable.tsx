import React, { useState, useEffect } from "react";

const TestTable: React.FC = () => {
  const [data] = useState([
    { id: 1, name: "علی" },
    { id: 2, name: "رضا" },
    { id: 3, name: "حسن" },
  ]);

  const [selected, setSelected] = useState<Set<number>>(new Set());

  // دیباگ: هر بار که انتخاب عوض شد، نشون بده
  useEffect(() => {
    console.log("انتخاب‌شده‌ها (ایندکس):", Array.from(selected));
  }, [selected]);

  const Checkbox = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{
        width: "16px",
        height: "16px",
        cursor: "pointer",
        accentColor: "#007bff",
      }}
    />
  );

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h3>تست چک‌باکس — باید کار کنه!</h3>
      <table style={{ borderCollapse: "collapse", width: "300وارث" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              <Checkbox
                checked={selected.size === data.length && data.length > 0}
                onChange={() => {
                  setSelected((prev) =>
                    prev.size === data.length
                      ? new Set()
                      : new Set(data.map((_, i) => i))
                  );
                }}
              />
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>نام</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <Checkbox
                  checked={selected.has(rowIndex)}
                  onChange={() => {
                    console.log("کلیک روی ردیف:", rowIndex);
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(rowIndex)) {
                        next.delete(rowIndex);
                      } else {
                        next.add(rowIndex);
                      }
                      return next;
                    });
                  }}
                />
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {row.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <p>تعداد انتخاب‌شده: {selected.size}</p>
        <p>ایندکس‌ها: {Array.from(selected).join(", ")}</p>
      </div>
    </div>
  );
};

export default TestTable;
