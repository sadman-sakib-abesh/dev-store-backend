const app=require('express')()
const nodemailer=require('nodemailer')
var validator = require("email-validator");
const cors=require('cors')
const bodyparser=require('body-parser')
var paypal = require('paypal-rest-sdk');
const sessionStorage=require("./session")




paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUb2wGQ3WQfKoiQxjnx6rUCf66qL0o4GJb1yWxxfKO7B6wodpuwRxik0Qv11jNs8SzVfAUoY9jBRhjBW',
  'client_secret': 'EO7p0rfWLND8HWPDf8SJ6xBz_BhQpWwDT8vQ1xKSVYA6HSqLopp80OzwYtTTtPB6MFBFbPlApCSF1I16'
});


app.use(cors());

app.use(bodyparser.json({limit: '5mb'}));
app.use(bodyparser.urlencoded({ extended: true }));

var{ MongoClient,ObjectId} = require('mongodb');
var uri = "mongodb://abesh:Iamabesh123@cluster0-shard-00-00.fpqk3.mongodb.net:27017,cluster0-shard-00-01.fpqk3.mongodb.net:27017,cluster0-shard-00-02.fpqk3.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-15fdo3-shard-0&authSource=admin&retryWrites=true&w=majority";
MongoClient.connect(uri, function(err, client) {
  const products = client.db("claps").collection("products");



  app.post('/build',(req,res)=>{
    if(validator.validate(req.body.mail)===false){
      res.send('invalid email')
    }else{
  
    
    var transporter = nodemailer.createTransport({
      service:'gmail',
        auth: {
          user: 'noreply.businesspoint@gmail.com',
          pass: '20_21<point>'
    
        }
      });
      
      var mailOptions = {
        from:'noreply.businesspoint@gmail.com',
        to: 'sadmansakibabesh@gmail.com',
        subject: 'you got claps build proposal from '+' --'+`${req.body.mail}`,
        html:'<b>claps# </b>'+req.body.body,
        attachments:[{ 
          filename: `${req.body.mail}_page_contact.html`, 
          content:req.body.msg
      }]
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.send("**not send")
          console.log(error)
        } else {
          res.send("build proposal sent successfully!!")
        }
      });
    
    }

})




  app.post('/contact',(req,res)=>{
    

  if(validator.validate(req.body.mail)===false){
    res.send('invalid email')
  }else{



    var transporter = nodemailer.createTransport({
      service:'gmail',
        auth: {
          user: 'noreply.businesspoint@gmail.com',
          pass: '20_21<point>'
    
        }
      });
      
      var mailOptions = {
        from:'noreply.businesspoint@gmail.com',
        to: 'sadmansakibabesh@gmail.com',
        subject: 'you got claps from '+' --'+`${req.body.mail}`,
        html:'<b>claps# </b>'+req.body.msg,
        attachments:[{ 
          filename: `${req.body.mail}_page_contact.html`, 
          content:req.body.msg
      }]
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.send("**not send")
          console.log(error)
        } else {
          res.send("mail sent successfully!!")
        }
      });

    }
})









app.post('/product-post',(req,res)=>{

  products.insertOne(req.body,(err)=>{
if(err){
  console.log(err)
}else{
  res.send('sent')
}
  })
})


app.delete('/product-del/:_id',(req,res)=>{

  products.deleteOne({_id:ObjectId(req.params['_id'])},(err)=>{
if(err){
  console.log(err)
}else{
  res.send('deleted')
}
  })
})




app.get('/product-get-id',(req,res)=>{

  products.find({_id:new ObjectId(req.query._id)}).toArray((err,info)=>{
if(err){
  console.log(err)
}else{
res.send([{_id:info[0]._id,pre:info[0].pre,price:info[0].price,about:info[0].about,hash:info[0].hash,link:info[0].link,img:info[0].img}])
}
  })
})


app.post('/pay',(req,res)=>{
  if(validator.validate(req.body.mail)===false){
    res.send({err:'invalid email'})
  }else{

  
    
  var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/#/Success",
        "cancel_url": "http://localhost:3000/#/Canceled"
    },
    "transactions": [{
        "item_list": {
            "items":req.body.items
        },
        "amount": {
            "currency": "USD",
            "total": req.body.total
        },
        "description": "claps payment"
    }]
};
sessionStorage.setItem('mail',req.body.mail)
sessionStorage.setItem('items',req.body.items)
sessionStorage.setItem('total',req.body.total)

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
     for(let i=0;i<payment.links.length;i++){
if(payment.links[i].rel==='approval_url'){
res.send(payment.links[i].href)
}
}
  }
});

   
  }
})


app.post('/success',(req,res)=>{

const payment_done={
"payer_id":req.body.PayerID,
"transactions":[{
"amount":{
  "currency":'USD',
  "total":sessionStorage.getItem('total')

}

}]
}


paypal.payment.execute(req.body.paymentId,payment_done,(err,payment)=>{

if(err){
  console.log(err.response)
}else{
//all the thing I have to do 
let b=[]
let a=sessionStorage.getItem('items')
let payment_cart=payment.cart

for(var i=0;i<a.length;i++){

  products.find({_id:ObjectId(a[i].sku)}).toArray((err,info)=>{
    if(err){
      console.log(err)
    }else{



      const abc=()=>{
info.forEach(record=>
  b.push(record)
  )
}

const bcd=()=>{
  var transporter = nodemailer.createTransport({
    service:'gmail',
      auth: {
        user: 'noreply.businesspoint@gmail.com',
        pass: '20_21<point>'
  
      }
    });
    
    var mailOptions = {
      from: 'noreply.businesspoint@gmail.com',
      to: 'sadmansakibabesh@gmail.com',
      subject: 'you got claps sell cart----'+payment.cart,
      html:'<b>claps sell# cart-</b>'+payment.cart+' total-'+sessionStorage.getItem('total')+'$',
      attachments:[{ 
        filename: `payment_key.txt`, 
        content:JSON.stringify(payment)
    }]
    };
  
   
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        res.send("**not send")
        console.log(error)
      } else {
        res.send(payment.cart)
        b.forEach((ele)=>{
          var transporter2= nodemailer.createTransport({
            host: "smtp.yandex.com",
            port:465,
            secure:true,
              auth: {
                user: 'noreply@claps.ml',
                pass: 'I@mabesh1'
      
              }
            });

          var mailOptions2 = {
            from: 'noreply@claps.ml',
            to: sessionStorage.getItem('mail'),
            subject: 'claps dev store product delivery',
            html:`<b>Hello,<br/> You baught some items from claps dev store.<br/> Here is your download link-</b>${ele.download}<br/>product details-${ele.about}<br/><img src='${ele.img}' width='50%'/>`
            };
      
      
            transporter2.sendMail(mailOptions2, function(error, info){
              if (error) {
                res.send("**not send")
                console.log(error)
              } else {
                console.log('sent')
              }
            });
        })
          
      }
    });
  


  
}

abc()
setTimeout(() => {
  bcd()
  
}, 500);

  


    }

      })


}



  


//all the things I have to do
  
}

})



})






app.get('/product-get-eight',(req,res,next)=>{

  products.find({}).toArray((err,info)=>{
if(err){
  console.log(err)
}else{
  let a=[]


  if(info.length<8){
    for(var i=0;i<info.length;i++){
      a.push({_id:info[i]._id,pre:info[i].pre,price:info[i].price,img:info[i].img})
    }
    
    
  }else{
    
    for(var i=0;i<info.length;i++){
      a.push({_id:info[i]._id,pre:info[i].pre,price:info[i].price,img:info[i].img})
    }

  }



  res.send(a)


}
  })

})


app.get('/search',(req,res)=>{

  products.find({about:{$regex:".*"+req.query.i+"*."}}).toArray((err,info)=>{
if(err){
  console.log(err)
}else{
  let a=[]
  for(var i=0;i<info.length;i++){
    a.push({_id:info[i]._id,pre:info[i].pre,price:info[i].price,img:info[i].img})
   }
  
res.send(a)


}

  })

})







app.get('/product-get',(req,res,next)=>{

  products.find({}).toArray((err,info)=>{
if(err){
  console.log(err)
}else{

  let a=[]
  next()
  for(var i=0;i<info.length;i++){
    a.push({_id:info[i]._id,pre:info[i].pre,price:info[i].price,img:info[i].img})
   }
  
res.send(a)


  
}
  })

})




app.listen(process.env.PORT  || 4000,(err)=>{
  if(err){
    console.log("err")
  }else{
    console.log("running")
  }
})




});










