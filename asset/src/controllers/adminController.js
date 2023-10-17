const db = require("../configs/dbconnect");

module.exports = {
    index(req, res) {
        res.render("admin/index", { layout: "adminlayout" });
    },
}