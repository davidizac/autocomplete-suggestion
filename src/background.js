chrome.tabs.onUpdated.addListener(() => {
  browser.tabs.executeScript({
    file: 'js/content-script.js'
  })
})
