import frappe
from frappe import _
from frappe.model.document import Document

class SwayamSevikaData(Document):
    def before_validate(self):
        # Checking phone number validity
        phone_number = str(self.phone)
        if len(phone_number) != 10:
            frappe.throw(_("Phone number must be a 10-digit numeric value"))

        # Checking Aadhar number validity
        aadhar_number = str(self.aadhar_number)
        if not aadhar_number.isdigit() or len(aadhar_number) != 12:
            frappe.throw(_("Aadhar Number must be a 12-digit numeric value"))



       
    def before_save(self):       
        # check spaces in SS Code
        self.ss_code = str(self.ss_code).replace(" ", "")
                # Capitalize only the first letter of each name
        capitalized_first_name = self.first_name.title()
        capitalized_middle_name = self.middle_name.title()
        capitalized_last_name = self.last_name.title()

        # Update fields with capitalized values
        self.first_name = capitalized_first_name
        self.last_name = capitalized_last_name
        self.middle_name = capitalized_middle_name

        # Construct full_name with capitalized names
        self.full_name = f"{capitalized_first_name} {capitalized_middle_name} {capitalized_last_name}"

    def before_insert(self):       
        # check spaces in SS Code
        self.ss_code = str(self.ss_code).replace(" ", "")
        self.name = str(self.ss_code).replace(" ", "")

        
