import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Button, Progress, Badge } from "reactstrap";
import moment from "moment-jalaali";
// import _, { isNaN, isNumber } from "lodash";
import { DateTimeProps } from "../../types/index";

const DateTime: React.FC<DateTimeProps> = ({ value, format, type }) => {
  // examples of date and time
  // endDateTime: "2026-02-01 18:34:00"
  // endTime: "18:34:00"

  const isNumeric = (val: any) => {
    return val !== null && val !== "" && !Number.isNaN(Number(val));
  };

  const normalizeTimestamp = (val: any) => {
    let ts = Number(val);
    return ts < 1e12 ? ts * 1000 : ts;
  };

  const parseDate = (value: any) => {
    if (!value) return null;

    if (isNumeric(value)) {
      return moment(normalizeTimestamp(value));
    }

    const str = String(value);
    if (str.startsWith("13") || str.startsWith("14")) {
      return moment(str, format, true);
    }

    return moment(str, format, true);
  };

  let result = "";

  if (type === "date") {
    const m = parseDate(value);
    if (m && m.isValid()) result = m.format("jYYYY/jM/jD");
  }

  if (type === "time") {
    const m = parseDate(value);
    if (m && m.isValid()) result = m.format("HH:mm:ss");
  }

  if (type === "datetime") {
    const m = parseDate(value);
    if (m && m.isValid()) {
      let date = m.format("jYYYY/jM/jD");
      let time = m.format("HH:mm:ss");
      result = `${date} ساعت ${time}`;
    }
  }

  return <>{result}</>;
};

export default DateTime;
