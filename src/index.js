const http = require('http');
const fs = require('fs');
const http2 = require('http2');
const httpResponse = require('./httpResponse');
const httpRequest = require('./httpRequest');
// Create an unencrypted HTTP/2 server.
// Since there are no browsers known that support
// unencrypted HTTP/2, the use of `http2.createSecureServer()`
// is necessary when communicating with browser clients.
class Summer {

  /**
   * 启动服务器
   * @param {object} keygen https协议证书 ,仅需要相应路径即可
   * 示例：
   * {
   *    key: localhost-privkey.pem,
   *    cert: localhost-cert.pem
   *}
   */
  constructor(httpServer) {
    this._httpServer = httpServer;
  }
  //暂时移除callback
  start(keygen) {
    //如果没有https证书就使用http协议启动服务
    try {
      if (keygen == null) {
        //在这里注入req,resp扩展
        this._httpServer = http.createServer(
          { IncomingMessage: httpRequest, ServerResponse: httpResponse }
        );
      } else {
        this._httpServer = http2.createSecureServer({
          key: fs.readFileSync(keygen.key),
          cert: fs.readFileSync(keygen.cert)
        })
        this._httpServer.on('error', (err) => {
          console.error(err);
        })
        //    this._httpServer.on('stream', callback);
      }
      return this;
    } catch (err) {
      console.log(err);
    }
  }
  /**
   * 就支持显示监听的端口号
   * @param {*} port 
   */
  listen(port) {
    if (this._httpServer.listening) {
      console.log("已有监听端口");
    }
    this._httpServer.listen(port);
    //console.log(args);
    //解决端口
    console.log(`Server running at http://127.0.0.1:${port}`);
    return this._httpServer;
  }
}

let app = new Summer().start().listen(9090);
app.on('request', function (req, resp) {
  console.log(req)
})
//console.log(http.response());