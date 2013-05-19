class Background
  constructor: ->
    @windows = []

  ifShowFrame: ->
    version = parseInt navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10
    os = "other"
    if navigator.appVersion.indexOf("Linux") isnt -1
      os = "linux"
    else if navigator.appVersion.indexOf("CrOS") isnt -1
      os = "cros"
    else if navigator.appVersion.indexOf("Mac OS X") isnt -1
      os = "mac"
    return true if os is "linux" and version < 27
    return true if os is "mac" and version < 25
    return false


  launch: (launchData) =>
    options =
      frame: (if @ifShowFrame() then "chrome" else "none")
      minWidth: 400
      minHeight: 400
      width: 400
      height: 400

    chrome.app.window.create "index.html", options, (win) =>
      console.log "Window opened:", win
      win.onClosed.addListener @onWindowClosed.bind @, win


  onWindowClosed: (win) =>
    console.log "Window closed:", win


  onWindowReady: (win) =>
    @windows.push win
    win.setHasChromeFrame @ifShowFrame()


background = new Background
chrome.app.runtime.onLaunched.addListener background.launch

# Exports 
window.background = background