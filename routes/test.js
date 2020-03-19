var router = require('express').Router();

router.get("/", function (req, res) {
    res.send("test success")
})

module.exports = router;