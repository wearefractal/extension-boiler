define (require) ->
  templ = require 'templates/navbar'

  class Navbar extends dermis.View
    className: "navbar-view"
    content: templ

  return Navbar