// Copyright (c) 2024, Talibsheikh16@gmail.com and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Swayam Sevika Report"] = {
  filters: [
    {
      fieldname: "status",
      label: __("Status"),
      fieldtype: "Select",
      options: ["", "Approved", "Rejected"],
      default: "",
    },
  ],
  formatters: {
    status: function (value, row, column, data, default_formatter) {
      value = default_formatter(value, row, column, data);

      switch (data.status) {
        case "Approved":
          column.df.background_color = "#008000"; // Green
          break;
        case "Rejected":
          column.df.background_color = "#ff0000"; // Red
          break;
        default:
          // Handle other cases if needed
          break;
      }

      return value;
    },
  },
};
