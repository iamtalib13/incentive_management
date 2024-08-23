// Copyright (c) 2024, Talibsheikh16@gmail.com and contributors
// For license information, please see license.txt

frappe.ui.form.on("My Swayam Sevika", {
  before_save: function (frm) {
    // If the status is blank, set it to "Draft" before saving
    if (!frm.doc.status) {
      frm.set_value("status", "Draft");
      frm.refresh_field("status");
    }

    // Check if ss_code is entered
    // if (!frm.doc.ss_code) {
    //   frappe.msgprint("Please enter the SS Code.");
    //   frappe.validated = false; // Prevent saving
    //   return;
    // }
  },
  ss_code: function (frm) {
    selected_ss_code = frm.doc.ss_code;
  },

  onload: function (frm) {
    frm.set_query("ss_code", function () {
      return {
        filters: [["ss_status", "=", "Live"]],
      };
    });
  },
  validate: function (frm) {
    if (frm.doc.ss_code) {
      // Access the ss_status field from the linked Swayam Sevika Data
      let ss_status = frm.doc.ss_status;

      if (ss_status === "Closed") {
        frappe.msgprint({
            title: __('Alert'),
            message: __("This SS code is Closed, You can't access."),
            indicator: 'red'
        });

        // Delay the refresh to allow the alert to be visible
        setTimeout(function() {
          window.location.reload();
      }, 2000); // 2000 ms (2 seconds) delay to match the alert duration

        frappe.validated = false; // Prevents the form from being saved
        frm.set_value("ss_code", null);
        frm.set_value("ss_status", null);
        frm.refresh_fields();
      }
    }
  },
  send_for_approval: function (frm) {
    // Call custom button function
    customSendForApproval(frm);
  },
  refresh: function (frm) {
    const sendForApprovalButton = document.querySelector(
      'button[data-fieldname="send_for_approval"]'
    );

    // Apply the styles to change the background color and text color
    if (sendForApprovalButton) {
      sendForApprovalButton.style.backgroundColor = "rgb(40, 167, 69)";
      sendForApprovalButton.style.color = "rgb(255, 255, 255)";
    }

    // add custom button only if form is not new
    if (frm.is_new()) {
      console.log("neww");
      // When form is new
      // Setting Employee ID
      const user = frappe.session.user;
      const eid = user.match(/\d+/)[0];
      frm.set_value("employee_id", eid);
      frm.refresh_field("employee_id");
      frm.set_value("status", "");
      frm.refresh_field("status");
      console.log("Employee ID :", frm.doc.employee_id);

      // Fetching Employee Data
      frm.call({
        method: "fetch_employee_data",
        args: {
          employee_id: frm.doc.employee_id,
        },
        callback: function (r) {
          if (!r.exc) {
            // Accessing response data
            const employeeData = r.message[0]; // Accessing the first element of the array
            console.log("Employee Data:", employeeData);

            // Set emp_full_name field with employee's name
            frm.set_value("emp_full_name", employeeData.employee_name);
            frm.refresh_field("emp_full_name");

            frm.set_value("employee_user_id", frappe.session.user);
            frm.refresh_field("employee_user_id");

            frm.set_value("designation", employeeData.designation);
            frm.refresh_field("designation");

            frm.set_value("emp_phone", employeeData.cell_number);
            frm.refresh_field("emp_phone"); // Corrected field name

            frm.set_value("region", employeeData.region);
            frm.refresh_field("region");

            frm.set_value("division", employeeData.division);
            frm.refresh_field("division");

            frm.set_value("district", employeeData.district);
            frm.refresh_field("district");

            frm.set_value("branch", employeeData.branch);
            frm.refresh_field("branch");

            frm.set_value("department", employeeData.department);
            frm.refresh_field("department");
          }
        },
      });
    }
    // check if user is BDO or BDE
    if (frappe.user.has_role("BDOs")) {
      var bdoBranch = frm.doc.branch;
      console.log("BDO ki branch: " + bdoBranch);
    } else if (frappe.user.has_role("BDEs")) {
      var bdeBranch = frm.doc.branch;
      console.log("BDE ki branch: " + bdeBranch);
    } else if (frappe.user.has_role("BD-others")) {
      var bdOtherBranch = frm.doc.branch;
      console.log("BD-other ki branch: " + bdOtherBranch);
    }

    // check if user is DDS or SMBG
    if (frappe.user.has_role("Team Leader - SMBG")) {
      var tlSMBGBranch = frm.doc.branch;
      console.log("TL ki branch (SMBG): " + tlSMBGBranch);
    } else if (frappe.user.has_role("Team Leader - DDS")) {
      var tlDDSBranch = frm.doc.branch;
      console.log("TL ki branch (DDS): " + tlDDSBranch);
    } else if (frappe.user.has_role("Team Leader - BOM")) {
      var tlBOMBranch = frm.doc.branch;
      console.log("TL ki branch (BOM): " + tlBOMBranch);
    }

    // Add custom buttons based on user roles and document status
    if (!frm.is_new()) {
      // When form is not new
      // Disable save button if status is "Approved" or "Rejected" or "Pending From TL" and user has "MIS User" role
      if (
        (frm.doc.status === "Draft" || frm.doc.status === "Pending From TL") &&
        (frappe.user.has_role("BDOs") ||
          frappe.user.has_role("BDEs") ||
          frappe.user.has_role("BD-others"))
      ) {
        frm.disable_form();
      }

      if (
        frm.doc.status === "Approved" &&
        (frappe.user.has_role("BDOs") ||
          frappe.user.has_role("BDEs") ||
          frappe.user.has_role("BD-others") ||
          frappe.user.has_role("Team Leader - SMBG") ||
          frappe.user.has_role("Team Leader - DDS") ||
          frappe.user.has_role("Team Leader - BOM"))
      ) {
        frm.enable_form();
      }

      if (
        (frm.doc.status === "Rejected" ||
          frm.doc.status === "Pending From TL") &&
        (frappe.user.has_role("Team Leader - SMBG") ||
          frappe.user.has_role("Team Leader - DDS") ||
          frappe.user.has_role("Team Leader - BOM"))
      ) {
        frm.disable_save();
        frm.set_df_property("ss_code", "read_only", 1);
        console.log("Work kar raha hai TL"); // Assuming "Work kar raha hai TL" is Hindi for "Work is being done by TL".
        frm.refresh_field("ss_code");
      }

      // Check if the user has the appropriate role and the status is "Draft"
      if (
        (frappe.user.has_role("BDOs") ||
          frappe.user.has_role("BDEs") ||
          frappe.user.has_role("BD-others")) &&
        frm.doc.status === "Draft"
      ) {
        // Add custom button for "Send for Approval"
        frm
          .add_custom_button(__("Send for Approval"), function () {
            customSendForApproval(frm);
          })
          .css({
            "background-color": "#28a745", // Set green color
            color: "#ffffff", // Set font color to white
          });

        // Hide menu button
        frm.page.menu_btn_group.toggle(false);
      }

      // Disable save button if status is "Pending From TL" and user has "BDO & BDE" role
      if (
        (frm.doc.status === "Pending From TL" ||
          frm.doc.status === "Approved") &&
        (frappe.user.has_role("BDEs") ||
          frappe.user.has_role("BDOs") ||
          frappe.user.has_role("BD-others"))
      ) {
        frm.disable_save();
        frm.set_df_property("ss_code", "read_only", 1);
      }

      // Add custom buttons for "Approve" and "Reject" if status is "Pending From TL" and user has "Team leaders" role
      if (
        frm.doc.status === "Pending From TL" &&
        (frappe.user.has_role("Team Leader - SMBG") ||
          frappe.user.has_role("Team Leader - DDS") ||
          frappe.user.has_role("Team Leader - BOM"))
      ) {
        frm
          .add_custom_button(__("Approve"), function () {
            frappe.confirm(
              "Are you sure you want to approve the request for <b>" +
                frm.doc.full_name +
                "</b>? This action cannot be undone.",
              () => {
                // action to perform if Yes is selected
                frm.set_value("status", "Approved");
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
            cursor: "pointer", // Add cursor pointer on hover
          });

        frm
          .add_custom_button(__("Reject"), function () {
            frappe.confirm(
              "Are you sure you want to reject the request for <b>" +
                frm.doc.full_name +
                "</b>? This action will <b>DELETE</b> this form & cannot be undone.",
              () => {
                // action to perform if Yes is selected
                frm.set_value("status", "Rejected");
                frm.set_value("active", 0); // Set active to 0 if rejected
                frm.refresh_field("status");
                frm.refresh_field("active");
                frm.save();

                // Get the full name of the current user
                frappe.db
                  .get_value("User", frappe.session.user, [
                    "employee_id",
                    "full_name",
                  ])
                  .then((response) => {
                    var currentUserFullName = response.message.full_name;
                    var currentUserEmployeeID = response.message.employee_id;
                    console.log("TL Name: " + currentUserFullName);
                    console.log("TL Employee ID: " + currentUserEmployeeID);

                    // Get the ID of the document owner
                    var owner = frm.doc.owner;

                    // Call server-side method to get the full name of the owner
                    frm.call({
                      method: "get_owner_full_name",
                      args: {
                        owner: owner, // Pass the owner ID as an argument
                      },
                      callback: function (response) {
                        if (response.message) {
                          var ownerDetails = response.message;
                          var ownerFullName = ownerDetails.full_name;
                          var ownerEmpid = ownerDetails.employee_id;
                          console.log("Sender Name: " + ownerFullName);
                          console.log("Sender Employee ID: " + ownerEmpid);

                          // Create a new document in 'Rejected Records' doctype
                          var rejectedRecord =
                            frappe.model.get_new_doc("Rejected Records");
                          rejectedRecord.ss_code = frm.doc.ss_code; // Copy relevant data
                          rejectedRecord.request_by = ownerFullName; // Assign the sender's full name
                          rejectedRecord.request_by_empid = ownerEmpid;
                          rejectedRecord.rejected_by = currentUserFullName; // Assign the full name of the user who rejected the form
                          rejectedRecord.rejected_by_empid =
                            currentUserEmployeeID;
                          // Copy other fields as needed

                          frappe.db
                            .insert(rejectedRecord)
                            .then((doc) => {
                              // Document created successfully
                              console.log("Rejected records saved!");

                              // Now Deleting Record
                              frappe.db
                                .delete_doc(frm.doc.doctype, frm.doc.name)
                                .then(() => {
                                  // Document deleted successfully
                                  console.log("Main record deleted!");
                                  if (
                                    frappe.user.has_role(
                                      "Team Leader - SMBG"
                                    ) ||
                                    frappe.user.has_role("Team Leader - DDS") ||
                                    frappe.user.has_role("Team Leader - BOM")
                                  ) {
                                    window.location.href =
                                      "/app/swayam-sevika-management";
                                  }
                                })
                                .catch((err) => {
                                  // Error occurred while deleting
                                  console.log(
                                    "Error deleting main record: ",
                                    err
                                  );
                                });
                            })
                            .catch((err) => {
                              // Error occurred while saving
                              frappe.msgprint("Error saving record: " + err);
                              console.log("Rejected records NOT saved!");
                            });
                        } else {
                          console.log("Sender Name not found for ID: " + owner);
                        }
                      },
                      error: function (err) {
                        console.error("Error retrieving sender name: " + err);
                      },
                    });
                  })
                  .catch((err) => {
                    // Error occurred while retrieving the full name of the current user
                    console.log(
                      "Error retrieving full name of current user: ",
                      err
                    );
                  });
              },
              () => {
                // action to perform if No is selected
              }
            );
          })
          .css({
            "background-color": "#dc3545", // Set red color
            color: "#ffffff", // Set font color to white
            cursor: "pointer", // Add cursor pointer on hover
          });
      }
    }
  },

  admin_save: function (frm) {
    // Trigger save operation
    frm.save();
  },
});
function customSendForApproval(frm) {
  let tl_user = "";
  let main_tl_mail = "";
  if (frappe.user.has_role("BDEs")) {
    tl_user = frm.doc.dds_user_id;
    main_tl_mail = frm.doc.dds_mail;
    setTLFields(tl_user, main_tl_mail);
  } else if (frappe.user.has_role("BDOs")) {
    tl_user = frm.doc.smbg_user_id;
    main_tl_mail = frm.doc.smbg_mail;
    setTLFields(tl_user, main_tl_mail);
  } else if (frappe.user.has_role("BD-others")) {
    // Call the custom server-side API endpoint to get all BOMs for the branch
    frappe.confirm(
      "<i>Do you want to send for Approval?</i>",
      () => {
        // action to perform if Yes is selected
        frappe.call({
          method:
            "incentive_management.incentive_management.doctype.my_swayam_sevika.my_swayam_sevika.get_all_bom_user_ids",
          args: {
            branch: frm.doc.branch,
          },
          callback: function (response) {
            if (response && response.message && response.message.length >= 0) {
              let bomUsers = response.message;
              console.log(response.message);

              // // Set options for doc_received_by field
              // let options = bomUsers.map(bomUser => bomUser.user_id).join("\n");
              // frappe.meta.get_docfield(frm.doc.doctype, 'doc_received_by', frm.doc.name).options = options;
              // frm.refresh_field('doc_received_by');

              // Loop through each BOM and send/share the form
              bomUsers.forEach(function (bomUser) {
                let tl_user = bomUser.user_id;
                let main_tl_mail = bomUser.company_email;

                let userOptions = bomUsers
                  .map((user) => user.user_id)
                  .join("\n");
                frm.set_value("doc_received_by", userOptions);

                frappe.call({
                  method: "frappe.share.add",
                  freeze: true, // Set to true to freeze the UI
                  freeze_message: "Internet Not Stable, Please Wait...",
                  args: {
                    doctype: frm.doctype,
                    name: frm.docname,
                    user: tl_user,
                    read: 1,
                    write: 1,
                    submit: 0,
                    share: 1,
                    notify: 1,
                    send_email: 0, // Set this to 0 to prevent sending email notifications
                  },
                  callback: function (response) {
                    if (frm.doc.status === "Draft") {
                      frm.set_value("status", "Pending From TL");
                      frm.set_value("active", true);
                      frm.refresh_field("status");
                      frm.save();
                    }
                  },
                });
              });
              //Display a message to the user
              frappe.show_alert({
                message: "Your Approval Request Sent Successfully ",
                indicator: "green",
              });

              // Optionally, perform additional actions after sharing with all BOMs
            } else {
              // Handle case where no matching Employee records are found
              console.log(
                "No matching Branch Operation Managers found for the branch."
              );
              // Optionally, you can notify the user or handle this case as per your application logic.
            }
          },
        });
      },
      () => {
        // action to perform if No is selected
      }
    );
  }
  function setTLFields(tl_user, main_tl_mail) {
    // Set the fields on frm.doc
    frm.doc.main_tl_id = tl_user;
    frm.doc.main_tl_mail = main_tl_mail;
    // Log values for debugging
    console.log("TL user id: " + tl_user);
    console.log("Main TL ID : " + frm.doc.main_tl_id);
    console.log("Main TL Mail ID : " + frm.doc.main_tl_mail);

    sendForApproval(tl_user, main_tl_mail);
  }
  function sendForApproval(tl_user, main_tl_mail) {
    frappe.confirm(
      "<i>Do you want to send for Approval?</i>",
      () => {
        // action to perform if Yes is selected
        frappe.call({
          method: "frappe.share.add",
          freeze: true, // Set to true to freeze the UI
          freeze_message: "Internet Not Stable, Please Wait...",
          args: {
            doctype: frm.doctype,
            name: frm.docname,
            user: tl_user,
            read: 1,
            write: 1,
            submit: 0,
            share: 1,
            notify: 1,
            send_email: 0, // Set this to 0 to prevent sending email notifications
          },

          callback: function (response) {
            //Display a message to the user
            frappe.show_alert({
              message: "Your Approval Request Sent Successfully ",
              indicator: "green",
            });
            if (frm.doc.status === "Draft") {
              frm.set_value("status", "Pending From TL");
              frm.set_value("active", true);
              frm.refresh_field("status");
              frm.save();
            }
          },
        });
      },
      () => {
        // action to perform if No is selected
      }
    );
  }
}
