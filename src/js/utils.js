const fs = require("fs")
const path =require("path")
function ReadFile(path){
    console.log("reading file at :",path);
    return new Promise((resolve,reject)=>{
        fs.readFile(path,"utf8",(err,data)=>{
            if(err){console.log(err); reject([false,err])}
            resolve([true,data])
        })
    })
    
}
function FindAllFileRefs(string){
    const regex = /(ASSETS.*\.(scb|sco|dds))/g;
    return string.match(regex)||[];
}

function CheckParentDirs(startPath, targetDir, maxDepth = 5) {
    let currentDir = path.resolve(startPath);
    let depth = 0;
    const targetDirLower = targetDir.toLowerCase();

    while (currentDir !== path.parse(currentDir).root && depth < maxDepth) {
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            if (item.toLowerCase() === targetDirLower && fs.statSync(path.join(currentDir, item)).isDirectory()) {
                console.log(`Found ${targetDir} in ${currentDir}`);
                return [true,currentDir];
            }
        }
        currentDir = path.dirname(currentDir);
        depth++;
    }
    
    console.log(`${targetDir} not found within ${maxDepth} levels`);
    return[false]
}
module.exports={ReadFile,FindAllFileRefs,CheckParentDirs}