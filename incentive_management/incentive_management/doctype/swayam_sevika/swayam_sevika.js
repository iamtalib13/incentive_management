// Copyright (c) 2024, apeksha and contributors
// For license information, please see license.txt

frappe.ui.form.on("Swayam Sevika", {
  refresh(frm) {
    if (frm.is_new()) {
      //Setting Employee ID
      let user = frappe.session.user;
      let eid = user.match(/\d+/)[0];
      frm.set_value("employee_id", eid);
    }
  },
});
