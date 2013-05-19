define(function(require) {
  var appLayout, router;

  router = require('app/router');
  appLayout = require('layouts/App');
  console.log("main loaded");
  $('body').html(appLayout.render().el);
  return router.start();
});
