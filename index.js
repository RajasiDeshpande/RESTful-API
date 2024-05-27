const { faker } = require('@faker-js/faker');
const mysql=require("mysql2");
let express=require("express");
let app=express();
let path=require("path");
const methodOverride=require("method-override")
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
let port=8080;
app.listen(port,()=>{
    console.log(`server is listening through port ${port}`);
})
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
let getRandomUser=()=> {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(), 
      faker.internet.password(),
    ];
};
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password:"rajasi",
});
app.get("/",(req,res)=>{
    let q="select count(*) from user";
    try{
        connection.query(q,(err,result)=>{
            if (err) throw err;
            let count=result[0]["count(*)"];
            res.render("home.ejs",{count});
        })
    }catch(err){
        console.log(err);
        res.send("some error occur!!!");
    }
});
app.get("/user",(req,res)=>{
    let q="select * from user";
    try{
        connection.query(q,(err,users)=>{
            if(err) throw err;
            res.render("showuser.ejs",{users});
        })
    }catch(err){
        console.log(err);
        res.send("some error occured!!!");
    }
})
app.get("/user/:id/edit",(req,res)=>{
    let {id}=req.params;
    let q=`select * from user where id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            res.render("edit.ejs",{user});
        })
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    }
    
})
app.patch("/user/:id",(req,res)=>{
    let {id}=req.params;
    let q=`select * from user where id="${id}"`;
    let{password : formPass , username : newUsername}=req.body;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            if(formPass != user.password){
                res.send("Wrong password");
            }else{
                let q2=`update user set username='${newUsername}' where id='${id}'`;
                connection.query(q2,(err,result)=>{
                    if(err) throw  err;
                    res.redirect("/user");
                })
            }
        })
    }catch(err){
        res.send("some error occured");
    }
})
app.get("/user/:id/delete",(req,res)=>{
    let {id}=req.params;
    let q=`select * from user where id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            console.log(result);
            let user=result[0];
            res.render("delete.ejs",{user});
        })
    }catch(err){
        console.log(err);
        res.send("some error occured in DB");
    }
})
app.delete("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {password: formPass, username: newUsername} = req.body;
    let q=`select * from user where id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if (err) throw err;
            let user=result[0];
            if((newUsername==user.username)&&(formPass==user.password)){
                let q=`delete from user where id='${id}'`;
                try{
                    connection.query(q,(err,result)=>{
                        if (err) throw err;
                        res.redirect("/user");
                    })
                }catch(err){
                    console.log(err);
                    res.send("some error occured");
                }
            }else{
                res.send("Wrong information !!!");
            }
        })
    }catch(err){
        console.log(err);
        res.send("some error occured");
    }
})
app.get("/user/new",(req,res)=>{
    res.render("new.ejs");
})
app.post("/user",(req,res)=>{
    let {id , username , email , password}=req.body;
    let q="insert into user values (?,?,?,?)";
    let newadd=[id,username,email,password];
    try{
        connection.query(q,newadd,(err,result)=>{
            if(err) throw err;
            console.log(result);
        })
    }catch(err){
        console.log(err);
        res.send("some error occurs in database");
    }
    res.redirect("/user")
})