const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://cars-doctor-6c129.web.app',
        'https://cars-doctor-6c129.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// middlewares 
const logger = (req, res, next) => {
    console.log('log: info', req.method, req.url);
    next();
}

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    // console.log('token in the middleware', token);
    // no token available 
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.user = decoded;
        next();
    })
}




// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ofnl5ln.mongodb.net/?retryWrites=true&w=majority`;

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
        const AllRoomCategoryCollection = client.db('HotelBooking').collection('Room_Category');
        const AllRoomsCollection = client.db('HotelBooking').collection('AllRooms');
        const MyCartCollection = client.db('HotelBooking').collection('mycart');
        const MyReviewCollection = client.db('HotelBooking').collection('review');

        // All Create api works here
        // auth related api
        app.post('/jwt', logger, async (req, res) => {
            const user = req.body;
            console.log('user for token', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .send({ success: true });
        })

        app.post('/logout', async (req, res) => {
            const user = req.body;
            console.log('logging out', user);
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })




        // All Room Category section
        app.get('/roomCategory', async (req, res) => {
            const cursor = AllRoomCategoryCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/roomCategory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await AllRoomCategoryCollection.findOne(query);
            res.send(result);
        })

        app.post('/roomCategory', async (req, res) => {
            const newBrand = req.body;
            console.log(newBrand);
            const result = await AllRoomCategoryCollection.insertOne(newBrand);
            res.send(result);
        })

        app.delete('/roomCategory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await AllRoomCategoryCollection.deleteOne(query);
            res.send(result);
        })




        // All Room Category section


        // All Room Category section
        app.get('/allRooms', async (req, res) => {
            const cursor = AllRoomsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/allRooms/:CategoryName', async (req, res) => {
            const CategoryName = req.params.CategoryName;
            const cursor = AllRoomsCollection.find({ CategoryName: CategoryName });
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/allRooms/:CategoryName/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await AllRoomsCollection.findOne(query);
            // console.log(result);
            res.send(result);
        })
        app.get('/allRooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await AllRoomsCollection.findOne(query);
            res.send(result);
        })




        app.get('/allRoomsByCategory/:CategoryName', logger, verifyToken, async (req, res) => {
            const CategoryName = req.params.CategoryName;
            const cursor = AllRoomsCollection.find({ CategoryName: CategoryName });
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/allRooms', logger, verifyToken, async (req, res) => {
            const newBrand = req.body;
            console.log(newBrand);
            const result = await AllRoomsCollection.insertOne(newBrand);
            res.send(result);
        })

        app.put('/allRooms/:id', logger, verifyToken, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const updateBrand = req.body;
            const Brand = {
                $set: {
                    image: updateBrand.image,
                    image1: updateBrand.image1,
                    image2: updateBrand.image2,
                    image3: updateBrand.image3,
                    image4: updateBrand.image4,
                    name: updateBrand.name,
                    CategoryName: updateBrand.CategoryName,
                    seatNum: updateBrand.seatNum,
                    price: updateBrand.price,
                    availability: updateBrand.availability,
                    description: updateBrand.description
                }
            }

            const result = await AllRoomsCollection.updateOne(filter, Brand, option);
            console.log(updateBrand);
            res.send(result);
        })


        app.patch('/allRooms/:id', logger, verifyToken, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateAvail = req.body;
            console.log(updateAvail);
            const updateDoc = {
                $set: {
                    availability: updateAvail.availability,

                }
            };
            const result = await AllRoomsCollection.updateOne(filter, updateDoc);
            res.send(result);


        })

        // All Room Category section
        // For my cart

        app.get('/Cart', logger, verifyToken, async (req, res) => {
            const cursor = MyCartCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/Cart/:user', logger, verifyToken, async (req, res) => {
            const user = req.params.user;
            const cursor = MyCartCollection.find({ userName: user });
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result);
        });

        app.get('/Cart/:user/:id', logger, verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await MyCartCollection.findOne(query);
            // console.log(result);
            res.send(result);
        })
        app.post('/Cart', logger, verifyToken, async (req, res) => {
            const newCart = req.body;
            console.log(newCart);
            const result = await MyCartCollection.insertOne(newCart);
            res.send(result);
        })
        // app.post('/Cart', async (req, res) => {
        //     const newCart = req.body;
        //     console.log(newCart);
        //     const result = await MyCartCollection.insertOne(newCart);
        //     res.send(result);
        // })

        app.post('/Cart', logger, verifyToken, async (req, res) => {
            const newCart = req.body;
            console.log(newCart);

            const filter = { _id: new ObjectId(newCart.roomId) };
            const update = {
                $set: { availability: 'No' }
            };
            const updateResult = await AllRoomsCollection.updateOne(filter, update);

            if (updateResult.modifiedCount === 1) {
                const result = await MyCartCollection.insertOne(newCart);
                res.send(result);
            } else {
                res.status(500).json({ error: 'Failed to update availability' });
            }
        });


        app.patch('/Cart/:user/:id', logger, verifyToken, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateAvail = req.body;
            console.log(updateAvail);
            const updateDoc = {
                $set: {
                    name1: updateAvail.name1,
                    nid: updateAvail.nid,
                    email: updateAvail.email,
                    date: updateAvail.date,

                }
            };
            const result = await MyCartCollection.updateOne(filter, updateDoc);
            res.send(result);


        })


        app.delete('/Cart/:id', logger, verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await MyCartCollection.deleteOne(query);
            res.send(result);
        })


        // for Review
        app.get('/review', async (req, res) => {
            const cursor = MyReviewCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.post('/review', async (req, res) => {
            const newCart = req.body;
            console.log(newCart);
            const result = await MyReviewCollection.insertOne(newCart);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




// Start main Server
app.get('/', (req, res) => {
    res.send('server is running');
});

app.listen(port, () => {
    console.log(`server is running in port: ${port}`);
})