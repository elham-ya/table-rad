import React from "react";
import TableView from "./components/table/Table";
import { ContentType } from "./types/index";
import data from "./data.json";

function App() {
  const dataNormalized = data.map((item: any, index: number | string) => {
    const newItem = {
      ...item,
      guildSrv: [
        {
          ...item.guildSrv,
          value: item.guildSrv.name,
          class: "warning",
          extraValue: "14%",
        },
        {
          ...item.guildSrv,
          value: item.guildSrv.name,
          class: "secondary",
          extraValue: "14%",
        },
        {
          ...item.guildSrv,
          value: item.guildSrv.name,
          class: "info",
          extraValue: "14%",
        },
      ],
      metadata: {
        ...item.metadata,
        paymentType: {
          value: item.metadata.paymentType,
          class: "info",
        },
        businessName: {
          value: item.metadata.businessName,
          class: "primary",
          extraValue: `${item.metadata.prepaidPercent}%`,
        },
        issuerType: [
          { value: item.metadata.issuerType, class: "success" },
          { value: item.metadata.issuerType, class: "success" },
          { value: item.metadata.issuerType, class: "success" },
        ],
      },
    };

    console.log(222, newItem);

    return newItem;
  });
  const handleViewInvoice = () => {
    alert("first action");
  };
  const actionButtons = [
    {
      uniqueId: "1",
      title: "مشاهده فاکتور",
      icon: "fa fa-eye",
      onClick: () => handleViewInvoice,
      disable: false,
      hasAccess: true,
    },
    {
      uniqueId: "2",
      title: "لیست بلیت ها",
      onClick: () => console.log("button 2 clicked"),
      disable: false,
      hasAccess: false,
      icon: "fas fa-ticket-alt fa-lg fa-rotate-90",
    },
    {
      uniqueId: "3",
      title: "چاپ مجدد",
      onClick: () => console.log("button clicked"),
      disable: false,
      hasAccess: true,
      icon: "fas fa-bars fa-lg",
    },
    {
      uniqueId: "4",
      title: "استرداد فاکتور",
      onClick: () => console.log("button clicked"),
      disable: true,
      hasAccess: true,
      icon: "fas fa-print fa-lg",
    },
    {
      uniqueId: "5",
      title: "پرداخت فاکتور",
      onClick: () => console.log("button clicked"),
      disable: false,
      hasAccess: true,
      href: "/",
      icon: "fas fa-times-circle fa-lg",
    },
  ];
  // columns of table
  const cols = [
    {
      uniqueId: "actions",
      title: "عملیات",
      width: "100",
      key: "actionbutton",
      type: ContentType.Button,
      actions: actionButtons.filter((btn) => btn.hasAccess === true),
      visible: true,
      excel: true,
    },
    {
      uniqueId: "ChangeKind",
      title: "نوع تغییر",
      type: ContentType.Text,
      width: "160",
      visible: true,
      excel: false,
      translate: true,
      key: "metadata.tags",
    },
    {
      uniqueId: "تست تکست یک دونه ای",
      title: "تکست تکی",
      type: ContentType.Text,
      width: "100",
      visible: true,
      excel: false,
      translate: true,
      key: "metadata.smsContentType",
    },
    {
      uniqueId: "price",
      title: "قیمت",
      key: "payableAmount",
      width: "100",
      type: ContentType.Price,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "tag_1",
      title: "تست تگ",
      visible: true,
      excel: true,
      type: ContentType.Badge,
      width: "100",
      translate: true,
      key: "metadata.paymentType",
    },
    {
      uniqueId: "tag_2",
      title: "تست تگ2",
      visible: true,
      excel: true,
      type: "badge",
      width: "140",
      key: "metadata.businessName",
    },
    {
      uniqueId: "multiTag",
      title: "تست تگ دو سطحی",
      visible: true,
      excel: true,
      type: ContentType.Badge,
      width: "150",
      translate: true,
      key: "metadata.issuerType",
    },
    {
      uniqueId: "multiTagWithoutSub",
      title: "تست تگ 2 سطحی لیست",
      visible: true,
      excel: true,
      type: ContentType.Badge,
      width: "200",
      key: "guildSrv",
    },
    {
      uniqueId: "creationDate",
      title: "تاریخ ایجاد",
      width: "140",
      visible: true,
      excel: true,
      key: "metadata.updated.at",
      type: "datetime",
      format: "YYYY/MM/DD",
    },
    {
      title: "تاریخ پرداخت",
      uniqueId: "paymentDate",
      visible: true,
      excel: false,
      type: "datetime",
      width: "120",
      key: "paymentDate",
    },
    {
      uniqueId: "description",
      title: "توضیحات",
      key: "description",
      width: "100",
      type: ContentType.Text,
      visible: false,
      excel: true,
    },
    {
      uniqueId: "billNumber",
      title: "شناسه قبض",
      key: "metadata.billNumber",
      width: "150",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "customerInfo",
      title: "اطلاعات مشتری",
      width: "120",
      key: "userSrv.name",
      type: ContentType.Text,
      visible: true,
      excel: false,
    },
    {
      uniqueId: "orderStatus",
      title: "وضعیت سفارش",
      width: "120",
      key: "metadata.orderStatus.name",
      type: ContentType.Text,
      visible: false,
      excel: false,
    },
    {
      uniqueId: "paymentTool",
      title: "روش پرداخت",
      width: "150",
      key: "metadata.paymentType.value",
      type: ContentType.Text,
      visible: false,
      excel: true,
      translate: true,
    },
    {
      uniqueId: "phoneNumber",
      title: "شماره تلفن",
      width: "140",
      key: "cellphoneNumber",
      type: ContentType.Text,
      visible: false,
      excel: true,
    },
    {
      uniqueId: "invoiceId",
      title: "شناسه فاکتور",
      width: "160",
      key: "metadata.invoiceId",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "issuanceStatus",
      title: "وضعیت صدور",
      width: "130",
      key: "metadata.issuanceStatus",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "cellPhone",
      title: "شماره موبایل",
      width: "200",
      key: "cellphoneNumber",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "paymentStatus",
      title: "وضعیت پرداخت",
      width: "200",
      key: "metadata.orderStatus.paymentStatus",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "invoice",
      title: "فاکتور ",
      width: "190",
      key: "metadata.invoice",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "orderStatus",
      title: "وضعیت سفارش",
      width: "120",
      key: "metadata.orderStatus.name",
      type: ContentType.Text,
      visible: true,
      excel: false,
    },
    {
      uniqueId: "paymentTool",
      title: "روش پرداخت",
      width: "150",
      key: "metadata.paymentType.value",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },

    {
      uniqueId: "orderStatus",
      title: "وضعیت سفارش",
      width: "120",
      key: "metadata.orderStatus.name",
      type: ContentType.Text,
      visible: true,
      excel: false,
    },
    {
      uniqueId: "paymentTool",
      title: "روش پرداخت",
      width: "150",
      key: "metadata.paymentType.value",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "phoneNumber",
      title: "شماره تلفن",
      width: "200",
      key: "cellphoneNumber",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "invoiceId",
      title: "شناسه فاکتور",
      width: "200",
      key: "metadata.invoiceId",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "issuanceStatus",
      title: "وضعیت صدور",
      width: "130",
      key: "metadata.issuanceStatus",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "cellPhone",
      title: "شماره موبایل",
      width: "200",
      key: "cellphoneNumber",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "paymentStatus",
      title: "وضعیت پرداخت",
      width: "200",
      key: "metadata.orderStatus.paymentStatus",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "invoice",
      title: "فاکتور ",
      width: "190",
      key: "metadata.invoice",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "phoneNumber",
      title: "شماره تلفن",
      width: "200",
      key: "cellphoneNumber",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
    {
      uniqueId: "invoiceId",
      title: "شناسه فاکتور",
      width: "200",
      key: "metadata.invoiceId",
      type: ContentType.Text,
      visible: true,
      excel: true,
    },
  ];

  const handleSelect = (selectedRows: unknown[]) => {
    console.log("ردیف‌های انتخاب‌شده :", selectedRows);
  };

  const handlePageChange = (_pageNumber: number) => {
    // dispatch getlist by new pageNumber
  };

  const handleSizeChange = (_pageNumber: number) => {
    // dispatch getlist by new pageSize
  };

  const config = {
    "Access-Token": "151626219-7e82c9cb78Be438d91932002d6959a60.XzIwMjY1",
    "Client-Id": "17959574q2f0347718971594ccd86f3f4",
    url: `https://api.sandpod.ir/srv/cms-sandbox/api/core/users/setting`,
  };

  const myTranslate = {
    user: "کاربر",
    cash: "نقدی",
    rial: "ریال",
    hours: "ساعت",
    content: "محتوا",
    product: "محصول",
    invoice_types: "نوع فاکتور",
    promotions: "مدیریت پیشنهادات",
    tourismServices: "خدمات",
    ticket: "بلیت",
    paymentReport: `گزارش مبلغی`,
    countReport: `گزارش تعدادی`,
    issuedInvoices: `فاکتور های صادر شده`,
    canceledInvoice: `فاکتور های استرداد شده`,
    product_154160: "محصول154160",
    content_product_type: `نوع‌محتوا/نوع‌محصول`,
    content_type: `نوع محتوا`,
    service_provider_20283: "سرویس پرووایدر20283",
    service_enable_true: "سرویس فعال است",
    podcms_Test: "پنل تست cms",
  };

  return (
    <TableView
      id="test"
      data={dataNormalized}
      cols={cols}
      totalCount={data.length}
      checkBox={true}
      onRowSelect={handleSelect}
      onPageChange={handlePageChange}
      onSizeChange={handleSizeChange}
      requestConfig={config}
      pageSizeOptions={[10, 20, 25, 30, 40, 50]}
      size={10}
      translates={myTranslate}
    />
  );
}

export default App;
