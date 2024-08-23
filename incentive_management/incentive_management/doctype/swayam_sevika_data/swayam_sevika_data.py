import frappe
from frappe.model.document import Document

class SwayamSevikaData(Document):
    def before_save(self):
        # Store the previous value of ss_status
        if self.is_new() or not self.get_db_value("ss_status"):
            self.previous_ss_status = None
        else:
            self.previous_ss_status = self.get_db_value("ss_status")

    def on_update(self):
        # Check if ss_status changed to "Closed"
        if self.previous_ss_status != "Closed" and self.ss_status == "Closed":
            self.check_and_delete_related_records()

    def check_and_delete_related_records(self):
        # Fetch records from "My Swayam Sevika" that match this record
        related_records = frappe.get_all(
            "My Swayam Sevika",
            filters={"ss_code": self.name},  # Replace with actual linking field
            fields=["name"]
        )

        frappe.logger().info(f"Found {len(related_records)} related records to delete.")

        # Delete related records
        for record in related_records:
            frappe.delete_doc("My Swayam Sevika", record['name'])
            frappe.logger().info(f"Deleted record {record['name']}")

        frappe.db.commit()
        frappe.msgprint(f"Related records in My Swayam Sevika deleted for {self.name}.")
