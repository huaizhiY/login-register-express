var express = require('express');
var router = express.Router();
var qs = require("querystring");
var mongoClient = require("mongodb").MongoClient;

/* GET home page. */
router.get('/', function(req, res, next) {
  var cookie = qs.parse(req.headers.cookie,"; ","=");
  // console.log(cookie);
  var vaildate = false;
  if(cookie.HUAIZHIID){
    var payload_hex = cookie.HUAIZHIID.split(".")[1];
    var payload = hexToObj(payload_hex);
    var url = "mongodb://localhost:27017";

    // console.log(payload.name);
    mongoClient.connect(url,(err,client)=>{
      var account = client.db("account");
      account.collection("tockens").find({ username: payload.name}).toArray((err,result)=>{
        if(err) throw err.message;
        // console.log(result);
        if(result.length >= 0){
          vaildate = true;
        }
        var data = payload.name;
        client.close();
        render(vaildate,res,data);
      })
    })
  }else{
    res.render("index", {
      vaildate: false,
      data: null,
      title: "请注册或登录"
    })
  }
});
function render(vaildate,res,data){

  console.log(vaildate)
  if (vaildate){
    res.render("index", {
      vaildate:vaildate,
      data:data,
      title:"欢迎"
    })
  }else{
    res.render("index", {
      vaildate: vaildate,
      data: null,
      title: "请登录或注册"
    })
  }
 
}

function hexToObj(hex) {
  var buff = new Buffer(hex, "hex");
  var s = buff.toString("utf8");
  var obj = JSON.parse(s);
  return obj;
}

module.exports = router;
