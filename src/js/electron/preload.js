const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld("electronAPI",{
    openFileDialog:(channel,...args)=>ipcRenderer.invoke(channel,...args),
    RendererToMain:(channel,data)=>ipcRenderer.send(channel,data),
    MainToRenderer:(channel,callback)=>ipcRenderer.on(channel,(event,...args)=>{callback(...args)})
})