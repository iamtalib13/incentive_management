import frappe
from frappe.model.document import Document

class TLandBranches(Document):
    def on_change(self):
        self.update_my_swayam_sevika_branch()

    def update_my_swayam_sevika_branch(self):
        try:
            # Check if the fields are changed
            if self.dds_employee_id or self.smbg_employee_id:
                # Fetch the records in "My Swayam Sevika" linked to the current branch
                swayam_sevika_records = frappe.get_all(
                    "My Swayam Sevika",
                    filters={"branch": self.branch},
                    fields=["name", "employee_id"]
                )

                # Update the branch field in "My Swayam Sevika"
                for record in swayam_sevika_records:
                    # Create employee user email
                    employee_user = record['employee_id'] + "@sahayog.com"

                    # Ensure the user exists and get their roles
                    if frappe.get_doc("User", employee_user):
                        user_roles = frappe.get_roles(employee_user)

                        # Determine the main_tl based on the user's roles
                        if 'BDEs' in user_roles:
                            main_tl = self.dds_user
                        elif 'BDOs' in user_roles:
                            main_tl = self.smbg_user
                        else:
                            main_tl = None  # Handle the case where the role doesn't match

                        # Update fields in "My Swayam Sevika"
                        frappe.db.set_value("My Swayam Sevika", record['name'], "dds_tl", self.dds_employee_id, update_modified=False)
                        frappe.db.set_value("My Swayam Sevika", record['name'], "dds_user_id", self.dds_user, update_modified=False)
                        frappe.db.set_value("My Swayam Sevika", record['name'], "smbg_tl", self.smbg_employee_id, update_modified=False)
                        frappe.db.set_value("My Swayam Sevika", record['name'], "smbg_user_id", self.smbg_user, update_modified=False)

                        # Update main_tl only if it was set
                        if main_tl:
                            frappe.db.set_value("My Swayam Sevika", record['name'], "main_tl_id", main_tl, update_modified=False)

                frappe.db.commit()
                frappe.msgprint("Branch updated in My Swayam Sevika.")
        except Exception as e:
            frappe.log_error(f"Error updating branch in My Swayam Sevika: {str(e)}", "TLandBranches")
            frappe.msgprint(f"An error occurred: {str(e)}")
