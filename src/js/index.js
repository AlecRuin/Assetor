var OpenPyFile = document.getElementById("FirstInput")
var BeginScanBtn = document.getElementById("BeginScanBtn")
var TextWindow = document.querySelector(".window")
var SaveResults = document.getElementById("SaveResults")
var SelectedFile;
function validateFileType() {
    const fileInput = document.getElementById('FirstInput');
    const filePath = fileInput.value;
    console.log("filepath: ",filePath);
    const allowedExtension = /\.py$/i;
    if (!allowedExtension.exec(filePath)) {
        alert('Invalid file type. Please select a Python (.py) file.');
        fileInput.value = '';
    }
}

OpenPyFile.addEventListener("click",async()=>{
    const filePaths = await window.electronAPI.openFileDialog("open-file-dialog")
    if(filePaths.length>0){
        console.log("Selected file: ",filePaths[0]);
        document.getElementById("FileSelected").innerHTML="Selected file: "+filePaths[0]
        SelectedFile=filePaths[0]
        BeginScanBtn.style="display: inline;"
        
    }
})
BeginScanBtn.addEventListener("click",async()=>{
    OpenPyFile.style="display:none;"
    window.electronAPI.RendererToMain("BeginScan",SelectedFile)
})

SaveResults.addEventListener("click",async()=>{
    window.electronAPI.RendererToMain("SaveResults")
})

window.electronAPI.MainToRenderer("ProcessMsg",(msg)=>{
    console.log(msg);
    const newDiv = document.createElement("div")
    newDiv.textContent="[ASSETOR]: "+msg
    TextWindow.appendChild(newDiv)
    TextWindow.scrollTop = TextWindow.scrollHeight
})
window.electronAPI.MainToRenderer("FinishedScan",()=>{
    OpenPyFile.style="display:inline;"
    document.getElementById("SaveResults").style="display:inline;"
})