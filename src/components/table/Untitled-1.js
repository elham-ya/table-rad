const tables1 = [
  { inviceList: [{ key: "address", title: "zipcode", width: "120" }] },
  {
    serviceList: [
      { key: "billnumebr", title: "number", width: "200" },
      { key: "invoiceNumber", title: "invoice", width: "150" },
    ],
  },
];

const tables2 = [
  {
    id: "inviceList",
    columns: [
      { key: "address", title: "zipcode", width: 120 },
      // اگر ستون‌های دیگه‌ای هم داشتی اینجا اضافه می‌کنی
    ],
  },
  {
    id: "serviceList",
    columns: [
      { key: "billnumebr", title: "number", width: 200 },
      { key: "invoiceNumber", title: "invoice", width: 150 },
    ],
  },
];
