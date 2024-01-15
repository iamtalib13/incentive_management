// Copyright (c) 2023, apeksha and contributors
// For license information, please see license.txt

frappe.ui.form.on("Swayam Sevika Data", {
  refresh(frm) {
    // Check user roles
    if (frappe.user.has_role("BDO & BDE")) {
      console.log("You are BDO & BDE");

      if (!frm.is_new() && frm.doc.status == "Draft") {
        frm.trigger("send_for_approval");
      } else if (frm.doc.status !== "Draft") {
        frm.disable_save();
        frm.disable_form();

        if (frm.doc.active == 0 && frm.doc.status == "Approved") {
          frm
            .add_custom_button(__("Activate"), function () {
              frappe.confirm(
                "Are you sure you want to Activate - <b>" +
                  frm.doc.full_name +
                  "</b>",
                () => {
                  // action to perform if Yes is selected
                  frm.set_value("active", 1);
                  frm.refresh_field("active");

                  frm.save();
                },
                () => {
                  // action to perform if No is selected
                }
              );
            })
            .css({
              "background-color": "#28a745", // Set green color
              color: "#ffffff", // Set font color to white
            });
        }

        // Add custom button for Rejection

        if (frm.doc.active == 1 && frm.doc.status == "Approved") {
          frm
            .add_custom_button(__("Deactivate"), function () {
              frappe.confirm(
                "Are you sure you want to Dectivate- <b>" +
                  frm.doc.full_name +
                  "</b>",
                () => {
                  // action to perform if Yes is selected
                  frm.set_value("active", 0);
                  frm.refresh_field("active");

                  frm.save();
                },
                () => {
                  // action to perform if No is selected
                }
              );
            })
            .css({
              "background-color": "#dc3545", // Set red color
              color: "#ffffff", // Set font color to white
            });
        }
      }
    } else if (frappe.user.has_role("MIS Admin")) {
      // MIS Admin logic
      if (frm.is_new()) {
        frappe.set_route("List", "Swayam Sevika Data", "List");
      } else {
        if (frm.doc.status === "Draft") {
          frm.disable_form();
          frm.disable_save();
        } else if (frm.doc.status === "Pending From MIS") {
          // Additional logic for "Pending From MIS" status
          console.log("MIS Pending");
          frm
            .add_custom_button(__("Approve"), function () {
              frappe.confirm(
                "Are you sure you want to Approve - <b>" +
                  frm.doc.full_name +
                  "</b>",
                () => {
                  // action to perform if Yes is selected
                  frm.set_value("status", "Approved");
                  frm.refresh_field("status");
                  console.log("Approved");
                  frm.save();
                },
                () => {
                  // action to perform if No is selected
                }
              );
            })
            .css({
              "background-color": "#28a745", // Set green color
              color: "#ffffff", // Set font color to white
            });

          // Add custom button for Rejection
          frm
            .add_custom_button(__("Reject"), function () {
              frappe.confirm(
                "Are you sure you want to Reject- <b>" +
                  frm.doc.full_name +
                  "</b>",
                () => {
                  // action to perform if Yes is selected
                  frm.set_value("status", "Rejected");
                  frm.refresh_field("status");
                  console.log("Reject");
                  frm.save();
                },
                () => {
                  // action to perform if No is selected
                }
              );
            })
            .css({
              "background-color": "#dc3545", // Set red color
              color: "#ffffff", // Set font color to white
            });
        } else if (frm.doc.status == "Approved") {
          frm.disable_form();
          frm.disable_save();
        } else if (frm.doc.status == "Rejected") {
          frm.disable_form();
          frm.disable_save();
        }
      }
      console.log("You are MIS Admin");
      frm.disable_save();
    } else if (frappe.user.has_role("MIS User")) {
      // MIS User logic
      if (frm.is_new()) {
        frappe.set_route("List", "Swayam Sevika Data", "List");
      } else {
        if (frm.doc.status === "Draft") {
          frm.disable_form();
          frm.disable_save();
        } else if (frm.doc.status == "Pending From MIS") {
          console.log("MIS Pending");
          // Additional logic for "Pending From MIS" status
          frm
            .add_custom_button(__("Approve"), function () {
              frappe.confirm(
                "Are you sure you want to Approve - <b>" +
                  frm.doc.full_name +
                  "</b>",
                () => {
                  // action to perform if Yes is selected
                  frm.set_value("status", "Approved");
                  frm.refresh_field("status");
                  console.log("Approved");
                  frm.save();
                },
                () => {
                  // action to perform if No is selected
                }
              );
            })
            .css({
              "background-color": "#28a745", // Set green color
              color: "#ffffff", // Set font color to white
            });

          // Add custom button for Rejection
          frm
            .add_custom_button(__("Reject"), function () {
              frappe.confirm(
                "Are you sure you want to Reject- <b>" +
                  frm.doc.full_name +
                  "</b>",
                () => {
                  // action to perform if Yes is selected
                  frm.set_value("status", "Rejected");
                  frm.refresh_field("status");
                  console.log("Reject");
                  frm.save();
                },
                () => {
                  // action to perform if No is selected
                }
              );
            })
            .css({
              "background-color": "#dc3545", // Set red color
              color: "#ffffff", // Set font color to white
            });
        } else if (frm.doc.status == "Approved") {
          frm.disable_form();
          frm.disable_save();
        } else if (frm.doc.status == "Rejected") {
          frm.disable_form();
          frm.disable_save();
        }
      }
      console.log("You are MIS User");
      frm.disable_save();
    } else {
      // No matching role, insufficient permission logic
      console.log("Sorry, insufficient permission");
      frm.disable_form();
      frm.disable_save();

      frappe.set_route("/app/swayam-sevika-management");
      // Show alert with indicator
      frappe.show_alert(
        {
          message: __("Hi, you are not BDO/BDE"),
          indicator: "red",
        },
        5
      );
    }

    if (frm.is_new()) {
      // Setting Employee ID for new forms
      const user = frappe.session.user;
      const eid = user.match(/\d+/)[0];
      frm.set_value("employee_id", eid);
    }

    // Apply CSS styles for custom save button
    frm.fields_dict.save_btn.$input.css({
      "background-color": "#5890FF",
      color: "#fff",
      border: "none",
      padding: "8px 22px",
      cursor: "pointer",
    });
  },
  approve_reject_btn: function (frm) {
    frm
      .add_custom_button(__("Approve"), function () {
        frm.set_value("status", "Approved");
        frm.refresh_field("status");
        console.log("Approved");
        frm.save();
      })
      .css({
        "background-color": "#28a745", // Set green color
        color: "#ffffff", // Set font color to white
      });

    // Add custom button for Rejection
    frm
      .add_custom_button(__("Reject"), function () {
        frm.set_value("status", "Rejected");
        frm.refresh_field("status");
        console.log("Reject");
        frm.save();
      })
      .css({
        "background-color": "#dc3545", // Set red color
        color: "#ffffff", // Set font color to white
      });
  },

  send_for_approval: function (frm) {
    frm
      .add_custom_button(__("Send for Approval"), function () {
        frappe.confirm(
          "Are you sure you want to Submit Swayam Sevika Data?",
          () => {
            // action to perform if Yes is selected
            frm.set_value("status", "Pending From MIS");
            frm.refresh_field("status");

            frm.save();
          },
          () => {
            // action to perform if No is selected
          }
        );
      })
      .css({
        "background-color": "#28a745", // Set green color
        color: "#ffffff", // Set font color to white
      });
  },

  before_save: function (frm) {},

  // check the present and permanent address is same or not
  address_check_same: function (frm) {
    let addressCheckValue = frm.doc.address_check_same;
    console.log(addressCheckValue);
    if (addressCheckValue == "1") {
      frm.toggle_display("permanent_address", false);
      console.log("permanent address field is hide..");
      frm.set_value("permanent_address", frm.doc.present_address);
      frm.refresh_field("permanent_address");
      console.log(frm.doc.permanent_address);
    } else {
      frm.toggle_display("permanent_address", true);
      console.log("permanent address field is visible..");
      frm.set_value("permanent_address", null);
      frm.refresh_field("permanent_address");
    }
  },

  save_btn: function (frm) {
    //Taking values from doctype fields
    let ssCode = frm.doc.ss_code;
    //let date = frm.doc.entry_date;
    let firstName = frm.doc.first_name;
    let middleName = frm.doc.middle_name;
    let lastName = frm.doc.last_name;

    let phoneNo = frm.doc.phone;
    let birthDate = frm.doc.date_of_birth;
    let panNo = frm.doc.pan_number;
    let aadharNo = frm.doc.aadhar_number;
    let gender = frm.doc.gender;
    let highEdu = frm.doc.highest_education;

    let presentAdd = frm.doc.present_address;
    //let permanentAdd = frm.doc.permanent_address;

    //checking the empty values
    if (!ssCode) {
      frappe.throw("Please Enter your SS Code");
    } else if (!firstName) {
      frappe.throw("Please Enter your First Name");
    } else if (!middleName) {
      frappe.throw("Please Enter your Middle Name");
    } else if (!lastName) {
      frappe.throw("Please Enter your Last Name");
    } else if (!phoneNo) {
      frappe.throw("Please Enter your Phone Number");
    } else if (!birthDate) {
      frappe.throw("Please Enter your Date of Birth");
    } else if (!presentAdd) {
      frappe.throw("Please Enter your Address");
    } else if (!gender) {
      frappe.throw("Please Enter your Gender");
    } else if (!highEdu) {
      frappe.throw("Please Enter your Higher Education");
    } else {
      frm.save();
    }
    // frm.set_value("ss_code", null);
    // frm.set_value("first_name", null);
    // frm.set_value("middle_name", null);
    // frm.set_value("last_name", null);
    // frm.set_value("phone", null);
    // frm.set_value("pan_number", null);
    // frm.set_value("aadhar_number", null);
    // frm.set_value("gender", null);
    // frm.set_value("highest_education", null);
    // frm.set_value("present_address", null);
    // frm.set_value("permanent_address", null);
    // frm.set_value("date_of_birth", null);
    // frm.set_value("address_check_same", null);
    // frm.refresh_field();
  },
});
