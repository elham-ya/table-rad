import React from "react";
import moment from "moment-jalaali";
import { DateTimeProps } from "../../types/index";
import { findString } from "../../utils";

const DateTime: React.FC<DateTimeProps> = ({
  value = "",
  format,
  type = "datetime",
  strings
}) => {
  // examples of date and time
  // endDateTime: "2026-02-01 18:34:00"
  // endTime: "18:34:00"

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
    let ts = Number(val);
    return ts < 1e12 ? ts * 1000 : ts;
  };

  const parseDate = (value: any) => {
    if (value === undefined || value === null || value === "" || value === "undefined") return null;

    if (isNumeric(value)) {
      const normalizedTs = normalizeTimestamp(value);
      return moment(normalizedTs);
    }

    const str = String(value).trim();
    const isJalaliFormat = format && format.includes("j");
    const looksLikeJalali = /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(str);

    if (isJalaliFormat || looksLikeJalali) {
      const jalaliFormat = format || "jYYYY/jM/jD";
      return moment(str, jalaliFormat, true);
    }

    const gregorianFormat = format || "YYYY-MM-DD HH:mm:ss";
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
  }

  if (type === "time") {
    const m = parseDate(value);
    if (m && m.isValid()) {
      result = m.format("HH:mm:ss");
    } else {
      console.warn('Invalid time for type="time":', value);
      result = "نامعتبر";
    }
  }

  if (type === "datetime") {
    const m = parseDate(value);
    
    if (m && m.isValid()) {
      let date = m.format("jYYYY/jM/jD");
      let time = m.format("HH:mm:ss");
      result = `${date} ${findString(strings?.hour , strings)} ${time}`;
    } else {
      console.warn('Invalid datetime for type="datetime":', value);
      result = "نامعتبر";
    }
  }

  return <>{result}</>;
};

export default DateTime;
