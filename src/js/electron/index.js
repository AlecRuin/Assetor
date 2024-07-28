const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const windowStateKeeper = require('electron-window-state')
const path = require("path")
const fs = require("fs")
const {ReadFile,FindAllFileRefs,CheckParentDirs} = require("../utils")
const createWindow = () => {
    let mainWindowState = windowStateKeeper({
        defaultHeight:600,
        defaultWidth:800
    })
  const win = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x:mainWindowState.x,
    y:mainWindowState.y,
    webPreferences:{
      preload:path.join(__dirname,"preload.js")
    }
  })
  win.loadFile(path.join(__dirname,'../../html/index.html'))
  mainWindowState.manage(win)
  if(mainWindowState.isMaximized)win.maximize();
  var FileRefs;
  var AssetsFolder;
  var PathOfLastFile;
  ipcMain.on("BeginScan",(event,data)=>{
    console.log("Beginning scan");
    win.webContents.send("ProcessMsg","Converting given .js to string")
    ReadFile(data).then(result=>{
      if(result[0]){
        PathOfLastFile=data
        win.webContents.send("ProcessMsg","Successfully converted file to string")
        FileRefs = [...new Set(FindAllFileRefs(result[1]))] 
        win.webContents.send("ProcessMsg",`Found ${FileRefs.length} item[s]`)
        win.webContents.send("ProcessMsg","Attempting to find ASSETS folder automatically")
        if(!AssetsFolder){
          AssetsFolder = CheckParentDirs(path.dirname(data),"assets")
          if(!AssetsFolder[0]){win.webContents.send("ProcessMsg","Failed to find ASSETS folder. Aborting");AssetsFolder=undefined;return;}
          AssetsFolder=AssetsFolder[1]
        }
        win.webContents.send("ProcessMsg",`ASSETS folder found at: ${AssetsFolder}\\ASSETS`)
        FileRefs = FileRefs.filter(item=>!fs.existsSync(path.join(AssetsFolder,item)))
        if(FileRefs.length>0){
          FileRefs.forEach(item=>win.webContents.send("ProcessMsg",`Missing asset found: ${item}`))
        }else{
          win.webContents.send("ProcessMsg",`All assets are already accounted for`)
        }
        win.webContents.send("FinishedScan")
      }
    })
  })

  ipcMain.on("SaveResults",(event)=>{
    if (FileRefs&&FileRefs.length>0){
      var JsonPath = path.join(path.dirname(PathOfLastFile), path.basename(PathOfLastFile, path.extname(PathOfLastFile)))+".json"
      console.log("JsonPath: ",JsonPath);
      fs.writeFileSync(JsonPath,JSON.stringify(FileRefs,null,2))
      win.webContents.send("ProcessMsg",`Wrote results to ${JsonPath}`)
    }
  })
}

app.whenReady().then(() => {
  createWindow()
})

ipcMain.handle("open-file-dialog", async()=>{
  const result=await dialog.showOpenDialog({
    properties:["openFile"],
    filters:[{name: "Python Files",extensions:["py"]}]
  })
  return result.filePaths
})

