var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const mongoClient = require("mongodb").MongoClient;
const fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});

router.post('/confirm', loginConfirm );

function loginConfirm(req, res, next) {
  // console.log(req.headers.cookie);
  
  // res.send("1");
  //接受数据;
  // console.log(req.body);
  var username = req.body.username;
  var passworld = req.body.passworld;
  var cookie = req.headers.cookie;
  var tocken = req.body.tocken;
  
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

  mongoConfirm(res, username, encrypted, tocken);
}

function mongoConfirm(res,username,hash,tocken){
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
        if (result.length == 1) {
          // res.send("0");
          // client.close();
          resolve(result[0]);
        };
        resolve("数据库错误");
      })
  })
  .then(function (usr) {
   //返回数据;
    if (usr.passworld == hash){
      if(tocken){
        createTocken(res,username);
      }
      res.send(usr);
   }else{
     res.send("0")
   }
  },
  function (e) {
    res.send("0");
    client.close();
  })
  })
}

function createTocken(res,username){
  //创建tocken头
  let tocken_header = {
    "typ":"jwt",
    "alg":"MD5"
  }
  let header_hex = objTohex(tocken_header);
  //创建payload部分;
  let tocken_payload = {
    "iss": "localhost",
    "exp": "10000",
    "name": username
  }
  let payload_hex = objTohex(tocken_payload);

  var pem = fs.readFileSync(__dirname+"/../server.pem");
  var key = pem.toString("ascii");
  const tocken_sinature = crypto.createHmac('sha1', key)
    .update(payload_hex + "" + header_hex)
    .digest('hex');
  // console.log(tocken_sinature)

  var user_tocken = header_hex + "." + payload_hex + "." + tocken_sinature;
  res.cookie("HUAIZHIID", user_tocken)
  // let tocken_sinature = 
  //查看该用户是否存在tocken 如果存在tocken就更新tocken，如果没有就创建tocken
  var url = "mongodb://localhost:27017"
  mongoClient.connect(url, (err, client) => {
    var odb = client.db("account");
    var tockens = odb.collection("tockens");
    tockens.find({username:username}).toArray((err,result)=>{
      if(result.length != 0){
        tockens.update({ username: username }, { $set: { tocken: user_tocken } });
      } else {
        tockens.insert({ username: username,tocken:user_tocken});
      }
    })
  })
}

function objTohex(obj){
  var s = JSON.stringify(obj);
  var buff = new Buffer(s);
  var hex = buff.toString("hex");
  return hex;
}

function hexToObj(hex){
  var buff = new Buffer(hex,"hex");
  var s = buff.toString("utf8");
  var obj = JSON.parse(s);
  return obj;
}

// console.log(objTohex(jwt_header));

module.exports = router;
