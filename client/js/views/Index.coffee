define (require) ->
  templ = require 'templates/index'

  class Index extends dermis.View
    className: "index-view"
    content: templ

  return Index