var router = require('express').Router();
var { All } = require('../db/index')
router.post("/query", function (req, res) {
    // {
    //         rows,
    //         msg: err ? JSON.stringify(err) : ''
    //     }
    All(req.body.query,function(obj){
        res.send(obj)
    })
    
})

module.exports = router;
