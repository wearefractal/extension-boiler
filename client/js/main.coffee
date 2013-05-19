define (require) ->
  router = require 'app/router'
  appLayout = require 'layouts/App'

  console.log "main loaded"

  # render main app layout
  $('body').html appLayout.render().el

  router.start()