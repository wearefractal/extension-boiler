define (require) ->
  templ = require 'templates/appLayout'

  class AppLayout extends dermis.Layout
    content: templ
    regions:
      "navbar": "#navbar"
      "main": "#main"

  return new AppLayout