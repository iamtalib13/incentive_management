// Frappe form script for "Agent Enable-Disable" doctype
frappe.ui.form.on("Agent Enable-Disable", {
  refresh: function (frm) {
    // Disable form for MIS Admin
    if (frappe.user.has_role("MIS Admin")) {
      frm.disable_form();
    }
    // Check if form is not new and user has MIS User role
    if (!frm.is_new() && frappe.user.has_role("MIS User")) {
      // Attach event handler to the "change" event of the "status" field
      frm.fields_dict.status.$input.on("change", function () {
        // Check if status is "Active"
        if (frm.doc.status === "Active") {
          // Show a confirmation dialog before saving
          frappe.confirm(
            "<b>Are you sure you want to <span style='color: red;'>DISABLE</span> this agent?</b><br>" +
              "This will <b style='color: red;'>DISABLE</b> this user, also <b style='color: red;'>DELETE</b> 'My Swayam Sevika' Records created by him.",
            function () {
              // Proceed with saving the document and delete associated records
              console.log("User confirmed to disable the agent");
              frm.save().then(() => {
                deleteRecordsByOwner(frm.doc.user_id, frm.doc.employee_id); // Call deleteRecordsByOwner function with userId
              });
            },
            function () {
              // Revert status to 'Active' if the user cancels
              frm.set_value("status", "Active");
              console.log("User cancelled the disable action");
            }
          );
        }
      });
    }
  },
});

// Function to handle deletion of records by the user
function deleteRecordsByOwner(userId, empId) {
  console.log("Calling server-side function to delete records for user:", userId);
  // Call server-side function to delete records by owner
  frappe.call({
    method:
      "incentive_management.incentive_management.doctype.agent_enable_disable.agent_enable_disable.delete_records_by_owner",
    args: {
      user_id: userId,
      employee_id: empId,
    },
    callback: function (response) {
      console.log("Server response:", response);
      if (response.message === true) {
        console.log("Deleted records successfully.");
        // Optionally do something after successful deletion
      } else {
        console.error("Error deleting records: ", response.exc);
        // Optionally handle the error
        frappe.msgprint("Error deleting records: " + response.exc);
      }
    },
  });
}
