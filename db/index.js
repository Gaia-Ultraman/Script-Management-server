var sqlite3 = require('sqlite3')
var db = new sqlite3.Database("dataBase.db", function (err) {
    if (err) {
        console.log("数据库创建或打开失败!")
    }
})
//数据库初始化
db.run('CREATE TABLE IF NOT EXISTS Logs ( deviceId varchar(255),name varchar(255),data text,createTime text )', function (err) {
    console.log('err:', err)
})


// for(let i=0;i<100;i++){
//     db.run(`INSERT INTO Logs VALUES ('${15654}', 'number${i}', 'data字段','${moment()}')`)
// }

// db.run('CREATE TABLE Logs (id int,name varchar(255),data text)')

// db.run(`INSERT INTO Logs VALUES (1, 'number', 'data字段')`,function(err){
//     console.log('err:',err)
// })

// db.run('DELETE FROM Logs',function(err){
//     console.log("GET",err)
// })

//运行任意query
module.exports.All = function (query, cb) {
    db.all(query, function (err, rows) {
        cb({
            rows,
            msg: err ? JSON.stringify(err) : ''
        })
    })
}

module.exports.default = db