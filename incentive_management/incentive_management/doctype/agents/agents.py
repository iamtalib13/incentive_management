# Copyright (c) 2024, Talibsheikh16@gmail.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Agents(Document):
    pass

@frappe.whitelist()
def agents_list():
    try:
        # SQL query to fetch employee data with specific designations and the count from tabMy Swayam Sevika
        query = """
            SELECT
                e.name,
                e.employee_id,
                e.first_name,
                e.last_name,
                e.designation,
                e.branch,
                e.region,
                e.status,
                COALESCE(COUNT(ms.employee_id), 0) AS swayam_sevika_count
            FROM
                `tabEmployee` e
            LEFT JOIN
                `tabMy Swayam Sevika` ms
            ON
                e.employee_id = ms.employee_id
            WHERE
                e.designation IN ('BLOCK DEVELOPMENT OFFICER', 'BUSINESS DEVELOPMENT EXECUTIVE', 'Block Development Officer')
            GROUP BY
                e.name, e.employee_id, e.first_name, e.last_name, e.designation, e.branch, e.region, e.status
        """
        
        # Execute the SQL query
        agents = frappe.db.sql(query, as_dict=True)
        
        return {'agents': agents}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'Employee List Fetch Error')
        return {'agents': [], 'error': str(e)}

@frappe.whitelist()
def inactivate_agent(employee_id):
    try:
        # Update the status of the employee to 'Inactive'
        frappe.db.set_value('Employee', employee_id, 'status', 'Inactive')
        
        # Delete records from tabMy Swayam Sevika for this employee
        frappe.db.delete('My Swayam Sevika', {'employee_id': employee_id})
        
        frappe.db.commit()  # Commit changes to the database

        return {'status': 'success', 'message': f'Employee ID {employee_id} is now inactive and associated records are deleted.'}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'Inactivate Agent Error')
        return {'status': 'error', 'message': str(e)}

@frappe.whitelist()
def activate_agent(employee_id):
    try:
        # Update the status of the employee to 'Active'
        frappe.db.set_value('Employee', employee_id, 'status', 'Active')
        
        frappe.db.commit()  # Commit changes to the database

        return {'status': 'success', 'message': f'Employee ID {employee_id} is now active.'}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'Activate Agent Error')
        return {'status': 'error', 'message': str(e)}
