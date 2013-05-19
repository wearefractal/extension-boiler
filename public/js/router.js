define(function(require) {
  var Index, Navbar, NotFound, appLayout, doNavbar;

  appLayout = require('layouts/App');
  Index = require('views/Index');
  NotFound = require('views/NotFound');
  Navbar = require('views/Navbar');
  doNavbar = function() {
    var vu;

    if (appLayout.region("navbar").view instanceof Navbar) {
      return;
    }
    vu = new Navbar;
    return appLayout.region("navbar").set(vu).show();
  };
  dermis.router.add({
    "/index.html": function(ctx) {
      var vu;

      doNavbar();
      vu = new Index;
      return appLayout.region("main").set(vu).show(ctx.params);
    },
    "*": function(ctx) {
      var vu;

      console.log(ctx);
      vu = new NotFound;
      return appLayout.region("main").set(vu).show(ctx.params);
    }
  });
  return dermis.router;
});
