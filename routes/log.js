var router = require('express').Router();
var {getLogs}  = require('../db/log')

//  http://localhost:99/api/getLogs?id=132&limit=10
router.get("/getLogs", function (req, res) {
    getLogs(req.query.id,req.query.limit,result=>{
        res.send({
            succes:!!result,
            data:result
        })
    })
})

module.exports = router;
