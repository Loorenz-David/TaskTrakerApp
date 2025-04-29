self.addEventListener("install", (event) => {
    console.log("Service worker installed");
    event.waitUntil(
      caches.open("tasktracker-cache").then((cache) => {
        return cache.addAll([
          "/",
          "/main/jsserving/get_items",
          "/static/css/base.css",
          "/static/css/bg_styles.css",
          "/static/css/btn_styles.css",
          "/static/css/colors.css",
          "/static/css/container_style.css",
          "/static/css/grid_styles.css",
          "/static/css/hamburger_menu.css",
          "/static/css/login_styles.css",
          "/static/css/text_styles.css",
          "/static/js/handle_section_selection.js",
          "/static/js/login_functions.js",
          "/static/js/menu_interactions.js",
          "/static/js/request_handler.js",
          "/static/icons/white_logo_Recovered.png",
        ]);
      })
    );
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });