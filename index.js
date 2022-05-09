const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const res = require('express/lib/response');
const jwt = require('jsonwebtoken');

require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return
    }
    console.log(authHeader);
    next();
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.th5av.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('iStore').collection('product');

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ accessToken });

        })

        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct)
            res.send(result);
        })

        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    price: updatedProduct.price,
                    stock: updatedProduct.stock,
                    email: updatedProduct.email,
                    img: updatedProduct.img,
                }
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);


        })

        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })



    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running istore server');
});

app.listen(port, () => {
    console.log('port listen is ok:', port)
})
