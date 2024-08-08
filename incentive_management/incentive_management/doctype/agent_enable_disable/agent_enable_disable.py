import frappe
from frappe.model.document import Document

class AgentEnableDisable(Document):
    pass

@frappe.whitelist()
def delete_records_by_owner(user_id, employee_id):
    try:
        # Fetch records owned by the user from the "My Swayam Sevika" doctype
        records = frappe.get_list(
            "My Swayam Sevika", 
            filters={"employee_id": employee_id},
            fields=["ss_code", "full_name", "date_of_birth", "branch_code", 
                    "present_address", "city", "phone", "aadhar_number", "pan_number"]
        )

        # Debugging: Log fetched records
        print(f"Fetched Records: {records}")

        if not records:
            frappe.msgprint(f"No records found for user: {employee_id}")
            return True

        # Save the records data in another doctype (e.g., "Disabled Agent Data")
        for record in records:
            backup_record = frappe.new_doc("Disabled Agents SS Data")
            backup_record.update({
                "ss_code": record.get("ss_code"),
                "full_name": record.get("full_name"),
                "date_of_birth": record.get("date_of_birth"),
                "branch_code": record.get("branch_code"),
                "present_address": record.get("present_address"),
                "city": record.get("city"),
                "phone": record.get("phone"),
                "aadhar_number": record.get("aadhar_number"),
                "pan_number": record.get("pan_number"),
                "previous_bdobde_empid": employee_id
            })
            backup_record.insert()
            print(f"Inserted Backup Record: {backup_record.name}")

        print("Records inserted successfully.")
       
        # Delete records owned by the user
        frappe.db.sql("DELETE FROM `tabMy Swayam Sevika` WHERE employee_id = %s", employee_id)
        frappe.db.commit()
        print("Records deleted successfully.")
        return True
    except frappe.PermissionError as e:
        print(f"Permission Error: {str(e)}")
        frappe.log_error(f"Permission Error: {str(e)}")
        return {"error": "Permission Error: " + str(e)}
    except Exception as e:
        # Print the actual error message for debugging
        print(f"Error deleting records: {str(e)}")
        frappe.log_error(f"Error deleting records: {str(e)}")
        return {"error": str(e)}
