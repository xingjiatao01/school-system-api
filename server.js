/*安装 express：
    1.初始化项目：npm init -y
    2.安装express: npm install express
*/
/*安装 cors:
    1.安装cors: npm install cors
    2.引入跨域包：
        const cors = require('cors')
*/
/* 连接TiDB需要mysql2，执行 npm install mysql2 */
//【必写】
const express = require('express')
const app = express()
const mysql = require('mysql2') //包不变，mysql2兼容TiDB
const cors = require('cors')
const port = 8000

//================ 这里全部替换成TiDB云端数据库配置================
const db = mysql.createConnection({
    host:'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user:'3qYa7FSQ8AdCiSj.root',
    password:'yzHOwf99UwK6OSTl',
    database:'school_db',
    ssl:{
        rejectUnauthorized: false
    }
})
//2.测试数据库连通【必写】
db.connect((err) =>{
    if(err){
        console.log('数据库连接失败',err);
    }else{
        console.log('✅ TiDB云端数据库连接成功');
        
    }
})
//============================================================

// 全局跨域中间件，写在所有路由前面
    app.use(cors())
// 解析json【必写】
app.use(express.json())
// ========== 下面这部分是【可变】，写不同接口就改这里 ==========
app.post('/server', (request, response)=>{ //注册用户，并插入数据库
    const {username,password,phone,role,yzm,xueyuan} = request.body;
    const sql = "INSERT INTO USER (username,password,phone,role,yzm,xueyuan) VALUES (?,?,?,?,?,?)";
    db.query(sql,[username,password,phone,role,yzm,xueyuan],(err,result)=>{
        if(err){
            response.json({code:500,msg:"插入失败"});
        }else{
            response.json({code:200,msg:"注册成功",data:result});
        }
    })
})
app.post('/phone', (request, response)=>{   //查找手机号是否存在
    const {phone} = request.body;
    console.log(request.body.phone);
    const sql = "select phone from user where phone = ?";
    db.query(sql,[phone],(err,result)=>{
        if(err){
            response.json({code:500,msg:"插入失败"});
        }
        if(result.length > 0){
            response.json({code:200,msg:"该手机号已注册，请直接登录"});
        }else{
            response.json({code:400,msg:"手机号不存在"});
        }
    })
})
app.get('/phone', (request, response)=>{  //获取手机号
    const {phone} = request.body;
    console.log(request.body.phone);
    const sql = "select phone from user where phone = ?";
    db.query(sql,[phone],(err,result)=>{
        if(err){
            response.json({code:500,msg:"插入失败"});
        }
        if(result.length > 0){
            response.send({
                code: 200,
                msg: "获取成功",
                data: result[0].phone //这里你原来写res是笔误，我帮你修正成result
              })
        }else{
            response.json({code:400,msg:"手机号不存在"});
        }
    })
    console.log('收到请求', request.body)
    response.send("收到,get请求,1")
})
app.post('/username', (request, response)=>{   //查找用户是否存在
    const {username} = request.body;
    const sql = `select username from user where username = ?`;
    db.query(sql,[username],(err,result)=>{
        if(err){
            response.json({code:500,msg:"失败"});
        }
        if(result.length > 0){
            response.json({code:200,msg:"该用户已存在"});
        }else{
            response.json({code:400,msg:"用户不存在"});
        }
    })
})
app.post('/username/delete', (request, response)=>{   //查找用户,然后注销用户
    const {username} = request.body;
    const sql = `delete from user where username = ?`;
    db.query(sql,[username],(err,result)=>{
        if(err){
            response.json({code:500,msg:"注销失败"});
        }
        if(result.affectedRows > 0){
            response.json({code:200,msg:"注销成功",data:result});
        }else{
            response.json({code:400,msg:"用户不存在"});
        }
    })
})
app.post('/username/xiugai', (request, response)=>{   //查找用户,然后注销用户
    const {username,password,phone,role} = request.body;
    const sql = `update user set username = ?,password = ?,phone = ?,role = ? where username = ?`;
    db.query(sql,[username,password,phone,role,username],(err,result)=>{
        if(err){
            response.json({code:500,msg:"修改失败"});
        }
        if(result.affectedRows > 0){
            response.json({code:200,msg:"修改成功",data:result});
        }else{
            response.json({code:400,msg:"用户不存在"});
        }
    })
})
app.post('/find', (request, response)=>{   //查找手机号、用户是否存在
    const {field,val} = request.body;
    let sql,params
    if(field === 'username'){
        sql = `select username from user where username = ?`
        params = [val]
    }else if(field === 'phone'){
        sql = `select phone from user where phone = ?`
        params = [val]
    }else{
        return response.json({code:400,msg:"失败"});
    }
    db.query(sql,params,(err,result)=>{
        if(err){
            response.json({code:500,msg:"失败"});
        }
        if(result.length > 0){
            response.json({code:200,msg:"该用户存在"});
        }else{
            response.json({code:400,msg:"用户不存在"});
        }
    })
})
app.get('/find/get', (request, response)=>{  //获取手机号
    const {field,val} = request.query;
    let sql,params
    if(field === 'role'){
        sql = `select role from user where username = ?`
        params = [val]
    }
    db.query(sql,params,(err,result)=>{
        if(err){
            response.json({code:500,msg:"查询失败"});
        }
        if(result.length > 0){
            response.send({
                code: 200,
                msg: "获取成功",
                data: result[0].role
              })
        }else{
            response.json({code:400,msg:"身份不存在"});
        }
    })
})
app.get('/find/get/all', (request, response)=>{  //获取手机号
    const {val} = request.query;
    console.log(val);
    
    let sql,params
    sql = `select * from user where username = ?`
    params = [val]
    db.query(sql,params,(err,result)=>{
        if(err){
            response.json({code:500,msg:"查询失败"});
        }
        if(result.length > 0){
            response.send({
                code: 200,
                msg: "获取成功",
                data: result[0]
              })
        }else{
            response.json({code:400,msg:"身份不存在"});
        }
    })
})
app.get('/get/all', (request, response)=>{  //获取手机号
    sql = `select * from user`
    db.query(sql,(err,result)=>{
        if(err){
            response.json({code:500,msg:"查询失败"});
        }
        if(result || result.length > 0){
            response.send({
                code: 200,
                msg: "获取成功",
                data: result
              })
        }else{
            response.json({code:400,msg:"身份不存在"});
        }
    })
})
app.get('/get/student/all', (request, response)=>{  //获取手机号
    const xueyuan  = request.query.xueyuan;
    sql = `select * from student where xueyuan = ?`
    db.query(sql,[xueyuan],(err,result)=>{
        if(err){
            response.json({code:500,msg:"查询失败"});
        }
        if(result.length > 0){
            response.send({
                code: 200,
                msg: "获取成功",
                data: result
              })
        }else{
            response.json({code:400,msg:"身份不存在"});
        }
    })
})
app.get('/get/all/find', (request, response)=>{  //获取手机号
    const {username,phone} = request.query;
    let sql,params
    sql = `select * from user where username = ? || phone = ?`
    params = [username,phone]
    db.query(sql,params,(err,result)=>{
        if(err){
            response.json({code:500,msg:"查询失败"});
        }
        if(result.length > 0){
            response.send({
                code: 200,
                msg: "获取成功",
                data: result
              })
        }else{
            response.json({code:400,msg:"身份不存在"});
        }
    })
})
app.post('/denglu', (request, response)=>{
    const {username,password} = request.body;
    const sql = "select username,password from user where username = ? and password = ?";
    db.query(sql,[username,password],(err,result)=>{
        if(err){
            response.json({code:500,msg:"查询数据库出错"});
        }
        if(result.length > 0){
            response.json({code:200,msg:"登录成功"});
        }else{
            response.json({code:400,msg:"账号或密码错误"});
        }
    })
})
app.post('/xuehao', (request, response)=>{   //查找学号是否存在
    const {xuehao} = request.body;
    const sql = "select xuehao from student where xuehao = ?";
    db.query(sql,[xuehao],(err,result)=>{
        if(err){
            response.json({code:500,msg:"查询失败"});
        }
        if(result.length > 0){
            response.json({code:200,msg:"该学号已存在"});
        }else{
            response.json({code:400,msg:"学号不存在"});
        }
    })
})
app.post('/cha', (request, response)=>{ //将学生信息插入数据库
    const {sname,xuehao,xueyuan,sex} = request.body;
    const sql = "INSERT INTO student (sname,xuehao,xueyuan,sex) VALUES (?,?,?,?)";
    db.query(sql,[sname,xuehao,xueyuan,sex],(err,result)=>{
        if(err){
            response.json({code:500,msg:"插入失败"});
        }else{
            response.json({code:200,msg:"插入成功",data:result});
        }
    })
})
app.post('/delete', (request, response)=>{ //按条件删除学生数据
    const {xuehao} = request.body;
    const sql = "delete from student where xuehao = ?";
    db.query(sql,[xuehao],(err,result)=>{
        if(err){
            response.json({code:500,msg:"删除失败"});
        }
        if(result.affectedRows > 0){
            response.json({code:200,msg:"删除成功",data:result});
        }else{
            response.json({code:400,msg:"学生不存在"});
        }
    })
})
app.post('/xiugai', (request, response)=>{ //修改学生信息
    const {sname,xuehao,sex} = request.body;
    const sql = "UPDATE student SET sname = ?,sex = ? WHERE xuehao = ?;"
    db.query(sql,[sname,sex,xuehao],(err,result)=>{
        if(err){
            response.json({code:500,msg:"修改失败"});
        }else{
            response.json({code:200,msg:"修改成功",data:result});
        }
    })
})
app.post('/qingchu', (request, response)=>{ //按条件清空学生信息
    const {xueyuan} = request.body;
    // const sql = "UPDATE student SET sname = ?,sex = ? WHERE xuehao = ?;"
    const sql = "DELETE FROM student WHERE xueyuan = ?"
    db.query(sql,[xueyuan],(err,result)=>{
        if(err){
            response.json({code:500,msg:"清空失败"});
        }else{
            response.json({code:200,msg:"清空成功",data:result});
        }
    })
})
app.get('/student/cha', (request, response)=>{  //按条件查找学生
    const {sname,xuehao,sex} = request.query;
    let sql,params
    console.log(request.query.sname);
    
    sql = `select * from student where sname = ? || xueyuan = ? || sex = ?`
    params = [sname,xuehao,sex]
    db.query(sql,params,(err,result)=>{
        if(err){
            response.json({code:500,msg:"查询失败"});
        }
        if(result.length > 0){
            response.send({
                code: 200,
                msg: "查询成功",
                data: result
              })
        }else{
            response.json({code:400,msg:"该学生不存在"});
        }
    })
})
app.get('/server', (request, response)=>{
    console.log('收到请求', request.body)
    response.send("收到,get请求,1")
})
//【必写】
app.listen(port, () => {
  console.log(`服务器已启动，8000端口监听中......`)
})
