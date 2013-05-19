define (require) ->
  templ = require 'templates/notFound'
  
  class NotFound extends dermis.View
    className: "notFound-view"
    content: templ

  return NotFound