var opt;

opt = {
  baseUrl: ".",
  packages: [
    {
      name: "templates",
      location: "/templates"
    }, {
      name: "app",
      location: "/js"
    }, {
      name: "views",
      location: "/js/views"
    }, {
      name: "models",
      location: "/js/models"
    }, {
      name: "layouts",
      location: "/js/layouts"
    }, {
      name: "vendor",
      location: "/js/vendor"
    }
  ]
};

require(opt, ["app/main"]);
