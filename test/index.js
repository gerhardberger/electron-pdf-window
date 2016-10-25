const { app, BrowserWindow } = require('electron')
const PDFWindow = require('../')

app.on('ready', () => {
  const win = new PDFWindow({
    width: 800,
    height: 600
  })

  const win2 = new BrowserWindow({
    width: 800,
    height: 600
  })

  PDFWindow.addSupport(win2)

  win.loadURL('http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf')
  // win.loadURL(`file://${__dirname}/helloworld.pdf`)

  // win2.loadURL('http://www.arxiv-sanity.com/')
  win2.loadURL('https://arxiv.org/abs/1601.06759')
})
