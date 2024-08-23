frappe.ui.form.on("Agents", {
  refresh: function (frm) {
    frm.trigger("populate_summary_html");
    frm.disable_save();
  },

  async populate_summary_html(frm) {
    frm.call({
      method: "agents_list",
      freeze: true,
      freeze_message:
        "<img src=https://media.tenor.com/JwPW0tw69vAAAAAj/cargando-loading.gif>",

      async: true,
      callback: function (r) {
        if (r.message && r.message.agents) {
          // Generate HTML with a filter input and list of agent cards
          let html = `
			  <style>
				/* Card view CSS */
				.card-container {
				  display: flex;
				  flex-wrap: wrap;
				  gap: 20px;
				  justify-content: flex-start;
				  padding: 20px;
				}
				.card {
				  background-color: #D9D9D9;
				  border-radius: 8px;
				  padding: 15px;
				  width: 220px;
				  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				  position: relative;
				}
				.card h4 {
				  margin: 10px 0;
				  font-size: 18px;
				  color: #333;
				}
				.card p {
				  margin: 5px 0;
				  font-size: 13px;
				  color: #555;
				}
				.status-toggle {
				  position: absolute;
				  top: 15px;
				  right: 15px;
				}
				.switch {
				  position: relative;
				  display: inline-block;
				  width: 50px;
				  height: 28px;
				}
				.switch input {
				  opacity: 0;
				  width: 0;
				  height: 0;
				}
				.slider {
				  position: absolute;
				  cursor: pointer;
				  top: 0;
				  left: 0;
				  right: 0;
				  bottom: 0;
				  background-color: #ccc;
				  transition: .4s;
				  border-radius: 28px;
				}
				.slider:before {
				  position: absolute;
				  content: "";
				  height: 20px;
				  width: 20px;
				  border-radius: 50%;
				  left: 4px;
				  bottom: 4px;
				  background-color: white;
				  transition: .4s;
				}
				input:checked + .slider {
				  background-color: #4caf50;
				}
				input:checked + .slider:before {
				  transform: translateX(22px);
				}
  
				/* Search bar styling */
				#search-bar {
				  width: 100%;
				  padding: 10px;
				  font-size: 14px;
				  border: 1px solid #d0d7de;
				  border-radius: 6px;
				  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
				  margin-bottom: 20px;
				}
  
				.ss-details {
				  margin-bottom: -18px;
				  margin-top: -15px;
				}
				.branch-details {
				  margin-bottom: -18px;
				  margin-top: -15px;
				}
				.emp-details {
				  margin-bottom: -18px;
				}
			  </style>
			  <div style="padding: 12px; border-bottom: 1px solid #d0d7de; background: #f8f9fa;">
				<input type="text" id="search-bar" placeholder="Search Employee ID">
			  </div>
			  <div class="card-container">
			`;

          r.message.agents.forEach((agent) => {
            const isActive = agent.status.toLowerCase() === "active";
            html += `
				<div class="card" data-employee-id="${agent.employee_id}">
				  <div class="status-toggle">
					<label class="switch">
					  <input type="checkbox" ${isActive ? "checked" : ""}>
					  <span class="slider round"></span>
					</label>
				  </div>
				  <div class="emp-details">
					<b>${agent.employee_id}</b><br>
					<b>${agent.first_name} ${agent.last_name}</b>
					<p style="font-size: 10px;">${agent.designation}</p>
				  </div>
				  <hr>
				  <div class="branch-details">
					<p>Branch: <b>${agent.branch}</b> | <b>${agent.region}</b></p>
				  </div>
				  <hr>
				  <div class="branch-details">
					<p>Swayam Sevika: <b>${agent.swayam_sevika_count}</b></p>
				  </div>
				</div>
			  `;
          });

          html += "</div>";

          // Set the generated HTML as Summary HTML in the 'list_html' field
          frm.set_df_property("list_html", "options", html);

          // Ensure that the DOM is fully updated
          frappe.after_ajax(() => {
            // Attach event listener to filter input
            $("#search-bar").on("input", function () {
              const searchValue = $(this).val().toLowerCase();
              $(".card-container .card").each(function () {
                const employeeId = String(
                  $(this).data("employee-id")
                ).toLowerCase();
                $(this).toggle(employeeId.includes(searchValue));
              });
            });

            // Attach event listener to switches
            $(".card-container input[type='checkbox']").on(
              "change",
              function () {
                const isChecked = $(this).is(":checked");
                const employeeId = $(this).closest(".card").data("employee-id");

                if (isChecked) {
                  // Activation logic
                  frappe.confirm(
                    "Are you sure you want to activate this employee?",
                    () => {
                      frm.call({
                        method: "activate_agent",
                        args: {
                          employee_id: employeeId,
                        },
                        callback: function (r) {
                          if (r.message.status === "success") {
                            frappe.msgprint(r.message.message);
                          } else {
                            frappe.msgprint(`Error: ${r.message.message}`);
                          }
                        },
                      });
                    },
                    () => {
                      $(this).prop("checked", false); // Revert switch state
                    }
                  );
                } else {
                  // Deactivation logic
                  frappe.confirm(
                    "Are you sure you want to deactivate this employee?",
                    () => {
                      frm.call({
                        method: "inactivate_agent",
                        args: {
                          employee_id: employeeId,
                        },
                        callback: function (r) {
                          if (r.message.status === "success") {
                            frappe.msgprint(r.message.message);
                          } else {
                            frappe.msgprint(`Error: ${r.message.message}`);
                          }
                        },
                      });
                    },
                    () => {
                      $(this).prop("checked", true); // Revert switch state
                    }
                  );
                }
              }
            );
          });
        }
      },
    });
  },
});
