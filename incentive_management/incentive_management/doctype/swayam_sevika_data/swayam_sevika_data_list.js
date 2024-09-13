function extend_listview_event(doctype, event, callback) {
  if (!frappe.listview_settings[doctype]) {
    frappe.listview_settings[doctype] = {
      refresh: function (listview) {
        $(".layout-side-section").hide();
      },
    };
  }

  const old_event = frappe.listview_settings[doctype][event];
  frappe.listview_settings[doctype][event] = function (listview) {
    if (old_event) {
      old_event(listview);
    }
    callback(listview);
  };
}

extend_listview_event("Swayam Sevika Data", "refresh", function (listview) {
  $(document).ready(function () {
    // Apply color changes based on entry_type
    $('span[data-filter="ss_status,=,Live"]').each(function () {
      $(this).removeClass("gray").addClass("green").text(__("Live"));
    });

    $('span[data-filter="ss_status,=,Closed"]').each(function () {
      $(this).removeClass("gray").addClass("red").text(__("Closed"));
    });
  });
});
