const express=require('express')
const cors=require('cors')
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
    // collections lists 
    const toysCollections=client.db('intelliKids').collection('allToys')
    const bannerCollections=client.db('intelliKids').collection('bannerInfo')
    const kidTestimonialCollections=client.db('intelliKids').collection('kidTestimonials')
    const galleryCollections=client.db('intelliKids').collection('gallery')
 

  //  toys related 
    app.get('/toys', async(req,res)=>{
      let query={}
      const limit=parseInt(req.query.limit)||2
      const page=parseInt(req.query.page)||0
      const skip=page*limit
      let result
      if(req.query?.category){
    query={subCategory: req.query.category}
     result=await toysCollections.find(query).skip(skip).limit(limit).toArray()
      }
      else{
         result=await toysCollections.find().limit(20).toArray()
      }
      res.send(result)
    })

    app.get('/toy/:category', async(req,res)=>{
      const category=req.params.category 
      const result=await toysCollections.find({subCategory: category}).toArray()
      res.send(result)
    })

    app.get('/toys/:id', async(req,res)=>{
      const id=req.params.id
      const query={_id: new ObjectId(id)}
      const result=await toysCollections.findOne(query)
      res.send(result)
    })

    app.get('/mytoys', async(req,res)=>{ 
      const email=req.query.email
      const sort=req.query.sort
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

    app.get('/countToys/:category',async(req,res)=>{
               const category=req.params.category 
               const filter={subCategory: category}
               const toysNumbers=await toysCollections.countDocuments(filter)
               res.send({toysNumbers:toysNumbers})
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


    // banner info related
    app.get('/bannerInfo',async(req,res)=>{
      const result=await bannerCollections.find().toArray()
      res.send(result)
    })


    // kid testimonial related
    app.get('/testimonials',async(req,res)=>{
      const result=await kidTestimonialCollections.find().toArray()
      res.send(result)
    })

    // gallery related 
    app.get('/galleries', async(req,res)=>{
      const result=await galleryCollections.find().toArray()
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