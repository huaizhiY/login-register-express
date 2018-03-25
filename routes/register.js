var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const mongoClient = require("mongodb").MongoClient;
const fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('register');
});

router.post('/confirm', registerConfirm );

function registerConfirm(req, res, next) {
  
  // res.send("1");
  //接受数据;
  // console.log(req.body);
  var username = req.body.username;
  var passworld = req.body.passworld;
  //密码加密：
  //秘钥加密：
  // var pem = fs.readFileSync(__dirname+"/../server.pem");
  // var key = pem.toString("ascii");
  // const hash = crypto.createHmac('sha1', key)
  //   .update(passworld)
  //   .digest('hex');
  //无秘钥加密：
  //创建一个密码 stream => 参数 为加密方式 参数2 密文中的一个后缀;
  const cipher = crypto.createCipher('aes192', "a passworld");
  //载入一个密码，并规定输入和输出值;
  let encrypted = cipher.update(passworld, 'utf8', 'hex');
  //最后输出数据 ， 及后缀。
  encrypted += cipher.final('hex');

  mongoConfirm(res, username, encrypted)
}

function mongoConfirm(res,username,hash){
  var url = "mongodb://localhost:27017"
  mongoClient.connect(url, (err, client) => {
    if (err) res.send("2");
    var odb = client.db("account");
    var user = odb.collection("user");
    //验证用户是否重名;
    //验证用户
  new Promise(function (resolve, rejected){
      user.find({ username: username }).toArray((err, result) => {
        // console.log(result);
        if (result.length > 0) {
          // res.send("0");
          // client.close();
          rejected("用户重名")
        };
        resolve();
      })
  })
  .then(function () {
    user.insert({ username: username, passworld: hash }, (err, data) => {
      if (err) {
        res.send("0");
        client.close();
        return;
      }
      var res_obj = {
        state: "success",
        username: username,
        passworld: hash
      }
      res.send(JSON.stringify(res_obj));
    })
  },
  function (e) {
    res.send("0");
    client.close();
  })

   
  })

}

// var jwt_header = {
//      "iss": "yanghuaizhi.com",
//      "exp": "10000",
//      "name": "yanghuaizhi"
// }

// function objTohex(obj){
//   var s = JSON.stringify(obj);
//   var buff = new Buffer(s);
//   var hex = buff.toString("hex");
//   return hex;
// }

// function hexToObj(hex){
//   var buff = new Buffer(hex,"hex");
//   var s = buff.toString("utf8");
//   var obj = JSON.parse(s);
//   return obj;
// }

// console.log(objTohex(jwt_header));

module.exports = router;
