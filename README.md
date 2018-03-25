###Crypto

生成秘钥方式：openssl genrsa  -out server.pem 1024

###createHmac

###加密方式：


var pem = fs.readFileSync(__dirname+"/../server.pem”);//读取密码文件;
var key = pem.toString("ascii”);//转换成ascii吗；
const hash = crypto.createHmac('sha1', key)//创建加密方式：
.update(passworld)  //加密数据：
.digest('hex’);     //数据转码：


###Cipher

这是无秘钥加密方式

//无秘钥加密：
//创建一个密码 stream => 参数 为加密方式 参数2 密文中的一个后缀;
const cipher = crypto.createCipher('aes192', "a passworld");
//载入一个密码，并规定输入和输出值;
let encrypted = cipher.update(passworld, 'utf8', 'hex');
//最后输出数据 ， 及后缀。
encrypted += cipher.final('hex');


###Tocken：

                   在浏览网页的过程中，经常会被多次重复的登录搞得烦不胜烦，因为我们使用的是 “即用即走的” http协议，这货在传输完成后则断开连接， web端为了帮助我们实现免登陆，从而发明了，cookie,localstorage，sessionstorage,等技术，这些技术可以将登录信息暂时或者永久性地存储在web端， 但是这些技术安全性不高，在通讯过程中被劫持的概率大，所以在存储数据的时候，我们一般情况下并不会向cookie中直接放入用户的账号密码 ， 所以一个类似于令牌的东西出现了， 这货叫Tocken ，当然很多人也叫他 “令牌”。



###tocken的原理：

                   服务端实现的原则是：

                         1. 用户成功登陆，根据需求决定是否创建免登陆 tocken。    
                         2. 创建tocken，发送给web端。    
                         3. 用户访问时，查看是否存在tocken，如果存在，验证，正确后返回用户所需数据。

                    Web端实现非常简单：

                        1.向服务器发送免登陆（创建tocken）请求。
                        2.将服务器发送的tocken存在cookie之中 。 
                        3.访问服务器，http请求就会默认携带cookie给服务端去验证。


tocken的构成：
                
                tocken 实现的标准有分厂多种，现在主要来说JWT标准，该标准共分成三个部分1.header  2.payload 3. Sinature

                1.header 部分主要用于描述协议名称及数据加密算法。

                  
        {
          "typ": "JWT",
          "alg": “MD5"
        }

                经过hex转码后，变成如下形式：
   
       7b22747970223a224a5754222c22616c67223a224d4435227d


转换方法封装：

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


>2.payload 部分：

   payload部分主要构成：

* iss：Issuer，发行者
* sub：Subject，主题
* aud：Audience，观众
* exp：Expiration time，过期时间
* nbf：Not before
* iat：Issued at，发行时间
* jti：JWT ID



{
     "iss": “yanghuaizhi.com",
     "exp": “10000",
     "name": “yanghuaizhi"
}

                                
转换成hex编码会编程这样：

7b22697373223a2279616e67687561697a68692e636f6d222c22657870223a223130303030222c226e616d65223a2279616e67687561697a6869227d

Sinature部分：

这部分其实就是两者数据相加，然后进行加密；

var pem = fs.readFileSync(__dirname+"/../server.pem”);//读取密码文件;
var key = pem.toString("ascii”);//转换成ascii吗；
const hash = crypto.createHmac('sha1', key)//创建加密方式：
.update(header + payload)  //加密数据：
.digest('hex’);     //数据转码：
