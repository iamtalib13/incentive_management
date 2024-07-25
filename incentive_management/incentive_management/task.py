import frappe

def update_district():
    tickets = frappe.get_all(
        "My Swayam Sevika",
        fields=["name", "employee_id"],  
    )

    for ticket in tickets:
        id = ticket.name
        employee_id = ticket.employee_id

        # Construct the SQL query with proper parameterization
        sql_query = """
            SELECT district
            FROM `tabEmployee`
            WHERE employee_id=%s
        """

        # Execute the query with the provided employee_id
        result = frappe.db.sql(sql_query, (employee_id,), as_dict=True)

        try:
            if result:
                district = result[0].get('district')  # Extract the district value from the result
                # Update district in My Swayam Sevika
                frappe.db.set_value("My Swayam Sevika", id, "district", district, update_modified=False)
                print(f"Updated record {id} with district {district}")
            else:
                print(f"No district found for employee_id {employee_id}")
        except Exception as e:
            print(f"Error updating record {id}: {e}")