define (require) ->
  appLayout = require 'layouts/App'
  Index = require 'views/Index'
  NotFound = require 'views/NotFound'
  Navbar = require 'views/Navbar'

  doNavbar = ->
    return if appLayout.region("navbar").view instanceof Navbar
    vu = new Navbar
    appLayout.region("navbar")
        .set(vu)
        .show()

  dermis.router.add
    "/index.html": (ctx) ->
      doNavbar()
      vu = new Index
      appLayout.region("main")
        .set(vu)
        .show ctx.params
        
    "*": (ctx) ->
      console.log ctx
      vu = new NotFound
      appLayout.region("main")
        .set(vu)
        .show ctx.params

  return dermis.router