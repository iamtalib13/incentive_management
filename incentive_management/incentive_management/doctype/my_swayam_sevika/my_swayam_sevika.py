# Copyright (c) 2024, Talibsheikh16@gmail.com and contributors
# For license information, please see license.txt


import frappe
from frappe import _
from frappe.model.document import Document
import re

class MySwayamSevika(Document):
	pass


@frappe.whitelist()
def fetch_sevika_data(ss_code):
    sevika_data = frappe.get_doc("Swayam Sevika Data", {"ss_code": ss_code})
    if sevika_data:
        return {
            "full_name": sevika_data.full_name,
            "date_of_birth": sevika_data.date_of_birth,
            "aadhar_number": sevika_data.aadhar_number,
            "pan_number": sevika_data.pan_number,
            "gender": sevika_data.gender,
            "phone": sevika_data.phone,
            "present_address": sevika_data.present_address,
            "city": sevika_data.city,
            "branch_code":sevika_data.branch_code,
        }
    else:
        return {}
    
@frappe.whitelist()
def fetch_employee_data(employee_id):
    # Use parameterized query to prevent SQL injection
    sql_query = f"""
        SELECT employee_name, designation, branch, region, district, department, division, cell_number
        FROM `tabEmployee`
        WHERE employee_id=%s
    """
    # Execute the query with the provided employee_id
    result = frappe.db.sql(sql_query, (employee_id,), as_dict=True)
    
    return result

@frappe.whitelist()
def get_owner_full_name(owner):
    # Fetch the full name and employee ID of the user with the provided ID
    full_name = frappe.get_value("User", owner, "full_name")
    emp_id = frappe.get_value("User", owner, "employee_id")
    
    if full_name:
        return {"full_name": full_name, "employee_id": emp_id}
    else:
        frappe.throw(_("Full name not found for user ID: {0}").format(owner))

@frappe.whitelist()
def delete_records_by_owner(user_id,employee_id):
    # Fetch records owned by the user from the "My Swayam Sevika" doctype
    records = frappe.get_list(
        "My Swayam Sevika", 
        filters={"owner": user_id},
        fields=["ss_code", "full_name", "date_of_birth", "branch_code", 
                "present_address", "city", "phone", "aadhar_number", "pan_number"]
    )
    
    # Print fetched records for debugging
    print("Fetched Records:", records)
    
    # If no records exist, return True without making any API calls
    if not records:
        return True
    
    try:
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
            print("Inserted Backup Record:", backup_record.name)
        
        print("First Records inserted successfully.")
       
        # Delete records owned by the user
        frappe.db.sql("DELETE FROM `tabMy Swayam Sevika` WHERE owner = %s", user_id)
        frappe.db.commit()
        print("Second Records deleted successfully.")
        return True
    except Exception as e:
        # Print the actual error message for debugging
        print("Error deleting records:", e)
        frappe.log_error("Error deleting records: " + str(e))
        return False

@frappe.whitelist()
def get_sevika_counts_for_bd():
    # Get the current logged-in user
    user = frappe.session.user
    
    # Extract numerical part from the user string (e.g., "3106" from "3106@sahayog.com")
    user_id_match = re.match(r'(\d+)', user)
    if user_id_match:
        user_id = user_id_match.group(1)
    else:
        frappe.throw("Invalid user format. Unable to extract user ID.")
    
    # Construct the SQL queries
    total_query = "SELECT COUNT(*) FROM `tabMy Swayam Sevika` WHERE employee_id=%s"
    approved_query = "SELECT COUNT(*) FROM `tabMy Swayam Sevika` WHERE employee_id=%s AND status='Approved'"
    rejected_query = "SELECT COUNT(*) FROM `tabRejected Records` WHERE request_by_empid=%s"
    pending_from_tl_query = "SELECT COUNT(*) FROM `tabMy Swayam Sevika` WHERE employee_id=%s AND status='Pending From TL'"
    
    # Execute the queries
    total_count = frappe.db.sql(total_query, (user_id,), as_dict=False)
    approved_count = frappe.db.sql(approved_query, (user_id,), as_dict=False)
    rejected_count = frappe.db.sql(rejected_query, (user_id,), as_dict=False)
    pending_from_tl_count = frappe.db.sql(pending_from_tl_query, (user_id,), as_dict=False)
    
    # Extract the counts from the results
    total_sevika_count = total_count[0][0] if total_count else 0
    approved_sevika_count = approved_count[0][0] if approved_count else 0
    rejected_sevika_count = rejected_count[0][0] if rejected_count else 0
    pending_from_tl_sevika_count = pending_from_tl_count[0][0] if pending_from_tl_count else 0
    
    return {
        'total_count': total_sevika_count,
        'approved_count': approved_sevika_count,
        'rejected_count': rejected_sevika_count,
        'pending_from_tl_count': pending_from_tl_sevika_count
    }

@frappe.whitelist()
def get_sevika_counts_for_tl():
    # Get the current logged-in user
    user = frappe.session.user

    user_id_match = re.match(r'(\d+)', user)
    if user_id_match:
        user_id = user_id_match.group(1)
    else:
        frappe.throw("Invalid user format. Unable to extract user ID.")
    
    # Construct the SQL queries
    total_query = "SELECT COUNT(*) FROM `tabMy Swayam Sevika` WHERE main_tl_id=%s"
    approved_query = "SELECT COUNT(*) FROM `tabMy Swayam Sevika` WHERE main_tl_id=%s AND status='Approved'"
    rejected_query = "SELECT COUNT(*) FROM `tabRejected Records` WHERE rejected_by_empid=%s"
    pending_from_tl_query = "SELECT COUNT(*) FROM `tabMy Swayam Sevika` WHERE main_tl_id=%s AND status='Pending From TL'"

    bom_total_query = "SELECT COUNT(*) FROM `tabMy Swayam Sevika` WHERE doc_received_by LIKE %s"
    bom_total_params = "%%%s%%" % (user)  # The pattern to search for  

    bom_approved_query = "SELECT COUNT(*) FROM `tabMy Swayam Sevika` WHERE doc_received_by LIKE %s AND status='Approved'" 
    bom_approved_params = "%%%s%%" % (user)  # Adjust as per your requirement   

    bom_pending_from_tl_query = "SELECT COUNT(*) FROM `tabMy Swayam Sevika` WHERE doc_received_by LIKE %s AND status='Pending From TL'"    
    bom_pending_from_tl_params = "%%%s%%" % (user)  # Adjust as per your requirement

    bom_rejected_query = "SELECT COUNT(*) FROM `tabRejected Records` WHERE rejected_by_empid=%s"
    bom_rejected_params = user_id  # Assuming `user_id` is the correct value
    
    # Execute the queries
    total_count = frappe.db.sql(total_query, (user,), as_dict=False)
    approved_count = frappe.db.sql(approved_query, (user,), as_dict=False)
    rejected_count = frappe.db.sql(rejected_query, (user_id,), as_dict=False)
    pending_from_tl_count = frappe.db.sql(pending_from_tl_query, (user,), as_dict=False)

    bom_total_count = frappe.db.sql(bom_total_query, (bom_total_params,), as_dict=False)
    bom_approved_count = frappe.db.sql(bom_approved_query, (bom_approved_params,), as_dict=False)
    bom_rejected_count = frappe.db.sql(bom_rejected_query, (bom_rejected_params,), as_dict=False)
    bom_pending_from_tl_count = frappe.db.sql(bom_pending_from_tl_query, (bom_pending_from_tl_params,), as_dict=False)
    
    # Extract the counts from the results
    total_sevika_count = total_count[0][0] if total_count else 0
    approved_sevika_count = approved_count[0][0] if approved_count else 0
    rejected_sevika_count = rejected_count[0][0] if rejected_count else 0
    pending_from_tl_sevika_count = pending_from_tl_count[0][0] if pending_from_tl_count else 0

    bom_total_sevika_count = bom_total_count[0][0] if bom_total_count else 0
    bom_approved_sevika_count = bom_approved_count[0][0] if bom_approved_count else 0
    bom_rejected_sevika_count = bom_rejected_count[0][0] if bom_rejected_count else 0
    bom_pending_from_tl_sevika_count = bom_pending_from_tl_count[0][0] if bom_pending_from_tl_count else 0
    
    return {
        'total_count': total_sevika_count,
        'approved_count': approved_sevika_count,
        'rejected_count': rejected_sevika_count,
        'pending_from_tl_count': pending_from_tl_sevika_count,
        'bom_total_count': bom_total_sevika_count,
        'bom_approved_count': bom_approved_sevika_count,
        'bom_rejected_count': bom_rejected_sevika_count,
        'bom_pending_from_tl_count': bom_pending_from_tl_sevika_count
    }
@frappe.whitelist()
def get_all_bom_user_ids(branch):
    # Fetch all Employees with Branch Operation Manager designation and matching branch
    employees = frappe.get_all('Employee',
                               filters={'designation': 'Branch Operation Manager', 'branch': branch},
                               fields=['user_id', 'company_email'])

    return employees