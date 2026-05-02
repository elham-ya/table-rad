import React from "react";
import { Row, Col, Button, Progress, Badge } from "reactstrap";
import moment from "moment-jalaali";
import { DateTimeProps } from "../../types/index";

const DateTime: React.FC<DateTimeProps> = ({
  value = "",
  format,
  type = "datetime",
}) => {
  // examples of date and time
  // endDateTime: "2026-02-01 18:34:00"
  // endTime: "18:34:00"
  console.log(333, value, type, format);

   const isEmpty = (val: any) => {
    return val === undefined || val === null || val === "";
  };
  
  if (isEmpty(value)) {
    return <></>;
  }
  const isNumeric = (val: any) => {
    return val !== null && val !== "" && !Number.isNaN(Number(val));
  };

  const normalizeTimestamp = (val: any) => {
    console.log("normalizeTimestamp val:", val);

    let ts = Number(val);
    return ts < 1e12 ? ts * 1000 : ts;
  };

  const parseDate = (value: any) => {
    console.log("parseDate val:", value);
    if (!value || value === "undefined") return null;

    if (isNumeric(value)) {
      const normalizedTs = normalizeTimestamp(value);
      console.log("parsing as timestamp:", normalizedTs);
      return moment(normalizedTs);
    }

    const str = String(value).trim();
    const isJalaliFormat = format && format.includes("j");
    const looksLikeJalali = /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(str);

    if (isJalaliFormat || looksLikeJalali) {
      const jalaliFormat = format || "jYYYY/jM/jD";
      console.log("parsing as jalali with format:", jalaliFormat);
      return moment(str, jalaliFormat, true);
    }

    const gregorianFormat = format || "YYYY-MM-DD HH:mm:ss";
    console.log("parsing as gregorian with format:", gregorianFormat);
    return moment(str, gregorianFormat, true);
  };

  let result = "";

  if (type === "date") {
    const m = parseDate(value);
    if (m && m.isValid()) {
      result = m.format("jYYYY/jM/jD");
    } else {
      console.warn('Invalid date for type="date":', value);
      result = "نامعتبر";
    }
    console.log("type date:", m, result);
  }

  if (type === "time") {
    const m = parseDate(value);
    if (m && m.isValid()) {
      result = m.format("HH:mm:ss");
    } else {
      console.warn('Invalid time for type="time":', value);
      result = "نامعتبر";
    }
    console.log("type time:", m, result);
  }

  if (type === "datetime") {
    const m = parseDate(value);
    if (m && m.isValid()) {
      let date = m.format("jYYYY/jM/jD");
      let time = m.format("HH:mm:ss");
      result = `${date} ساعت ${time}`;
    } else {
      console.warn('Invalid datetime for type="datetime":', value);
      result = "نامعتبر";
    }
    console.log("type datetime:", m, result);
  }

  return <>{result}</>;
};

export default DateTime;
