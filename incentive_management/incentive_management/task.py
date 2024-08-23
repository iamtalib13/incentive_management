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


import frappe
import frappe

def update_my_swayam_sevika_from_tl_and_branches():
    try:
        # Fetch all records from "TL and Branches"
        tl_and_branches_records = frappe.get_all(
            "TL and Branches",
            filters={},
            fields=["name", "branch", "dds_employee_id", "smbg_employee_id", "dds_user", "smbg_user"]
        )

        updated_records_count = 0  # Initialize counter for updated records

        # Iterate over each record in "TL and Branches"
        for tl_record in tl_and_branches_records:
            # Fetch corresponding records in "My Swayam Sevika" for the current branch
            swayam_sevika_records = frappe.get_all(
                "My Swayam Sevika",
                filters={"branch": tl_record['branch']},
                fields=["name", "employee_id"]
            )

            # Prepare the update data for "My Swayam Sevika"
            for swayam_record in swayam_sevika_records:
                try:
                    # Create employee user email
                    employee_user = swayam_record['employee_id'] + "@sahayog.com"
                    user_roles = frappe.get_roles(employee_user)

                    # Determine the main_tl based on the user's roles
                    if 'BDEs' in user_roles:
                        main_tl = tl_record['dds_user']
                    elif 'BDOs' in user_roles:
                        main_tl = tl_record['smbg_user']
                    else:
                        main_tl = None  # Handle the case where the role doesn't match

                    # Prepare the data for updating "My Swayam Sevika"
                    swayam_update_data = {
                        "dds_tl": tl_record['dds_employee_id'],
                        "dds_user_id": tl_record['dds_user'],
                        "smbg_tl": tl_record['smbg_employee_id'],
                        "smbg_user_id": tl_record['smbg_user'],
                        "main_tl_id": main_tl if main_tl else None
                    }

                    # Update the current record in "My Swayam Sevika"
                    for field, value in swayam_update_data.items():
                        frappe.db.set_value("My Swayam Sevika", swayam_record['name'], field, value, update_modified=False)

                    updated_records_count += 1  # Increment counter for each updated record

                    # Print the updated record details
                    print(f"Updated record {swayam_record['name']}: {swayam_update_data}")

                except Exception as e:
                    # Handle errors for individual records
                    frappe.log_error(f"Error updating record {swayam_record['name']}: {e}", "Update My Swayam Sevika")
                    print(f"Error updating record {swayam_record['name']}: {e}")

        # Commit the changes
        frappe.db.commit()
        # Print the total number of updated records
        print(f"Total records updated: {updated_records_count}")

        # Display success message
        frappe.msgprint(f"Records in My Swayam Sevika have been updated based on TL and Branches. Total records updated: {updated_records_count}")

    except Exception as e:
        # Handle errors for the entire process
        frappe.log_error(f"Error updating My Swayam Sevika from TL and Branches: {e}", "Update My Swayam Sevika")
        frappe.msgprint(f"An error occurred during the update process. Error: {e}")
        print(f"An error occurred during the update process: {e}")


def delete_and_print_closed_ss_records():
    closed_ss_records = frappe.get_all(
        'Swayam Sevika Data',
        filters={'ss_status': 'Closed'},
        fields=['ss_code']
    )

    deleted_codes = []  # List to collect ss_code of deleted records
    deleted_count = 0
    not_found_count = 0  # Counter for records not found

    for record in closed_ss_records:
        ss_code = record['ss_code']
        
        try:
            # Fetch the record from My Swayam Sevika before deleting
            ss_record = frappe.get_doc('My Swayam Sevika', ss_code)
            
            # Print the record details
            print(f"Deleting record: {ss_record.as_dict()}")
            
            # Delete the record
            frappe.db.delete('My Swayam Sevika', {'ss_code': ss_code})
            
            # Collect ss_code and increment the counter
            deleted_codes.append(ss_code)
            deleted_count += 1
        except frappe.exceptions.DoesNotExistError:
            print(f"Record with ss_code {ss_code} not found.")
            not_found_count += 1
        
    # Commit changes to the database
    frappe.db.commit()

    # Provide a summary message
    deleted_codes_str = ', '.join(deleted_codes)
    if deleted_codes_str:
        frappe.msgprint(f"Deleted records with ss_codes: {deleted_codes_str}")
    else:
        frappe.msgprint("No records found with status 'Closed' to delete.")
    
    # Print the total count of deleted records
    frappe.msgprint(f"Total deleted count: {deleted_count}")

    # Print the total count of not found records as an exception
    if not_found_count > 0:
        frappe.throw(f"Total not found count: {not_found_count}")