const { BrowserWindow } = require('electron')
const path = require('path')
const http = require('http')
const https = require('https')
const readChunk = require('read-chunk')
const fileType = require('file-type')
const extend = require('deep-extend')

function isPDF (url) {
  return new Promise((resolve, reject) => {
    if (url.match(/^file:\/\//i)) {
      const fileUrl = url.replace(/^file:\/\//i, '')
      const buffer = readChunk.sync(fileUrl, 0, 262)

      resolve(fileType(buffer).mime === 'application/pdf')
    } else if (url.match(/.pdf$/i)) {
      resolve(true)
    } else {
      const prot = url.match(/^https:\/\//i) ? https : http

      prot.get(url, res => {
        if (res.headers.location) {
          isPDF(res.headers.location).then(isit => resolve(isit))
            .catch(err => reject(err))
        } else {
          res.once('data', chunk => {
            res.destroy()

            const ft = fileType(chunk)
            if (ft) {
              resolve(ft.mime === 'application/pdf')
            } else {
              resolve(false)
            }
          })
        }
      })
    }
  })
}

class PDFWindow extends BrowserWindow {
  constructor (opts) {
    super(extend({}, opts, {
      webPreferences: { nodeIntegration: false }
    }))

    this.webContents.on('will-navigate', (event, url) => {
      event.preventDefault()
      this.loadURL(url)
    })

    this.webContents.on('new-window', (event, url) => {
      event.preventDefault()

      event.newGuest = new PDFWindow()
      event.newGuest.loadURL(url)
    })
  }

  loadURL (url) {
    console.log(url)
    isPDF(url).then(isit => {
      if (isit) {
        super.loadURL(`file://${
          path.join(__dirname, 'pdfjs', 'web', 'viewer.html')}?file=${url}`)
      } else {
        super.loadURL(url)
      }
    })
  }
}

PDFWindow.addSupport = function (browserWindow) {
  browserWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    browserWindow.loadURL(url)
  })

  browserWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()

    event.newGuest = new PDFWindow()
    event.newGuest.loadURL(url)
  })

  const load = browserWindow.loadURL
  browserWindow.loadURL = function (url) {
    isPDF(url).then(isit => {
      if (isit) {
        load.call(browserWindow, `file://${
          path.join(__dirname, 'pdfjs', 'web', 'viewer.html')}?file=${url}`)
      } else {
        load.call(browserWindow, url)
      }
    })
  }
}

module.exports = PDFWindow
