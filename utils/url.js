function parseParams(url) {
    /* 例子
    url = 'https://www.baidu.com/s?name=aa&age=48&sex=male'
    return {
        name:"aa",
        age:"48",
        sex:"male"
        } 
    */
    if (typeof url !== "string") {
        return false
    }
    let t = url.indexOf("?")
    if(t===-1){
        return false
    }
    let s = url.slice(t+1),
    a=s.split("&"),
    obj={};
    a.forEach((value,index)=>{
        let arr=value.split("=")
        obj[arr[0]]=arr[1]
    })
    return obj
}

module.exports={parseParams}