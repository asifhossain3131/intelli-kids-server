const express=require('express')
const cors=require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



const app=express()
const port=process.env.PORT||5000;


// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_KEY}@cluster0.df7drrh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const toysCollections=client.db('intelliKids').collection('allToys')
 

    // jwt 
    app.post('/authoriztion',(req,res)=>{
      const user=req.body 
      const token=jwt.sign(user,process.env.ACCESS_TOKEN, { expiresIn: '2h' })
      res.send({token})
    })

    app.get('/toys', async(req,res)=>{
      const result=await toysCollections.find().toArray()
      res.send(result)
    })

    app.get('/toys/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id: new ObjectId(id)}
      const result=await toysCollections.findOne(query)
      res.send(result)
    })

    app.get('/mytoys/',async(req,res)=>{ 
      const email=req.query.email
      const sort=req.query.sort
      console.log(sort)
      let query={}
      if(email){
        query={sellerEmail:email}
      }
      let result
      if(sort==0){
        result=await toysCollections.find(query).toArray()
      }
      else{
         result=await toysCollections.find(query).sort({toysPrice:sort}).toArray()
      }
      res.send(result)
    })

    app.post('/toys',async(req,res)=>{
      const toysInfo=req.body 
      const result=await toysCollections.insertOne(toysInfo)
      res.send(result)
    })

    app.put('/toys/:id',async(req,res)=>{
      const id=req.params.id 
      const toy=req.body 
      const filter={_id:new ObjectId(id)}
      const options={upsert:true}
      const updateToy={
        $set:{
          toysName:toy.toysName,
          toysPrice:toy.toysPrice,
 toysDescription:toy.toysDescription,
 toysQuantity:toy.toysQuantity
        }
      }
      const result=await toysCollections.updateOne(filter,updateToy,options)
      res.send(result)
    })

    app.delete('/toys/:id',async(req,res)=>{
      const id=req.params.id 
      const query={_id:new ObjectId(id)}
      const result=await toysCollections.deleteOne(query)
      res.send(result)
    })


    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);


app.get('/',(req,res)=>{
    res.send('Intelli kidos server is running')
})


app.listen(port)