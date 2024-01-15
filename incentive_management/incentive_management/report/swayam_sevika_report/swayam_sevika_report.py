# Copyright (c) 2024, Talibsheikh16@gmail.com and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import get_fullname


def execute(filters=None):
    if not filters:
        filters = {}

    data, columns = [], []

    columns = get_columns()
    cs_data = get_cs_data(filters)

    if not cs_data:
        frappe.msgprint("No Records Found")
        return columns, data

    for d in cs_data:
        row = {
            "employee_id": d.employee_id,
            "emp_name": d.Emp_Name,
            "designation": d.designation,
            "branch": d.branch,
            "region": d.region,
            "ss_code": d.ss_code,
            "full_name": d.Swayam_Sevika,
            "status": d.status,
        }
        data.append(row)

    return columns, data


def get_columns():
    return [
        {
            "fieldname": "employee_id",
            "label": "Employee ID",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "emp_name",
            "label": "Employee Name",
            "fieldtype": "Data",
            "width": "180",
        },
        {
            "fieldname": "designation",
            "label": "Designation",
            "fieldtype": "Data",
            "width": "120",
        },
        {
            "fieldname": "branch",
            "label": "Branch",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "region",
            "label": "Region",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "ss_code",
            "label": "SS Code",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "full_name",
            "label": "Swayam Sevika Full Name",
            "fieldtype": "Data",
            "width": "200",
        },
        {
            "fieldname": "status",
            "label": "Status",
            "fieldtype": "Data",
            "width": "100",
        },
    ]


def get_cs_data(filters):
    # Build the SQL query with a WHERE clause to filter by status
    sql_query = """
          SELECT 
        ss.employee_id,
        emp.employee_name as Emp_Name,
        emp.designation,
        emp.branch,
        emp.region,
        ss.ss_code,
        ss.full_name as Swayam_Sevika,
        ss.status
    FROM 
        `tabSwayam Sevika Data` ss
    JOIN 
        `tabEmployee` emp ON emp.employee_id = ss.employee_id
    WHERE 
        ss.status IN ('Approved', 'Rejected');
    """

    # Execute the SQL query
    data = frappe.db.sql(sql_query, as_dict=True)

    return data
