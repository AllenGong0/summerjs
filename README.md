# summerjs

符合个人要求的仅支持json数据传输的服务器框架<br/>
代码高可读性：<br/>
1.根目录为一个类，类中的方法为子路由<br/>
2.所有EPA为抽象方法，加强可读性和统一性<br/>

request和response封装借鉴了koa<br/>

stream和大文件io读写建议使用oss+cdn<br/>

####   开始测试

```
npm test
```

####   特性

-  简化的req和resp      是否完成： <input type="checkbox" checked="checked">

-  原生无侵入的核心部分     是否完成： <input type="checkbox">

-  利用修饰符完成router配置         是否完成： <input type="checkbox">

-  使用filter进行拦截           是否完成：<input type="checkbox">

-  使用EPA进行数据查询           是否完成：<input type="checkbox">

-  自动化将对象转译json         是否完成：<input type="checkbox">

####  推荐使用cli进行项目构建 (设想中)

- 集中配置 （是否完成：<input type="checkbox">）
- 隐藏不必要的文件 （是否完成：<input type="checkbox">）


