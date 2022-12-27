const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// fun part
app.use((req, res, next) => {
  console.log(req.path, "I am watching you.");
  next();
});

// middle wares
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1rqmivg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const tasksCollection = client.db("Tasks").collection("all tasks");
   

    // jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "14d",
      });
      res.send({ token });
    });

    app.get("/", (req, res) => {
      res.send("I am watching. caught you");
    });

    // user profie

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await userCollection.find(query).toArray();
      console.log(result.length);
      if (result.length > 1) {
        let userOne = result[0];
        console.log(userOne);
        res.send(userOne);
        return;
      } else {
        res.send(result[0]);
      }
    });

    // buyer user api

    app.post("/orders", async (req, res) => {
      const order = req.body;
      console.log(order);
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const result = await ordersCollection.find(filter).toArray();
      res.send(result);
    });

    app.delete("/orders/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(filter);
      res.send(result);
    });

    // admin user api

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "Admin" });
    });

    app.get("/allProduct", async (req, res) => {
      const query = {};
      const result = await userProductCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/seller", async (req, res) => {
      const query = { role: "Seller" };
      const user = await userCollection.find(query).toArray();
      res.send(user);
    });

    app.delete("/seller/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/buyer", async (req, res) => {
      const query = { role: "Buyer" };
      const user = await userCollection.find(query).toArray();
      res.send(user);
    });

    app.delete("/buyer/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    });

    // seller user api

    app.get("/sellerOrder/:email", async (req, res) => {
      const sellerEmail = req.params.email;
      const filter = { sellerEmail };
      const result = await ordersCollection.find(filter).toArray();
      res.send(result);
    });

    // all tasks
    // app.get("/alltasks/:id", async (req, res) => {
    //   const email = req.params.email;
    //   const query = { email };
    //   const user = await tasksCollection.findOne(query);
    //   res.send({ isSeller: user?.role === "Seller" });
    // });

    
    app.get("/userProduct/samsung", async (req, res) => {
      const query = { brandName: "samsung" };
      const result = await userProductCollection.find(query).toArray();
      res.send(result);
    });
    
    app.get("/userProduct/apple", async (req, res) => {
      const query = { brandName: "apple" };
      const result = await userProductCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/userProduct/walton", async (req, res) => {
      const query = { brandName: "walton" };
      const result = await userProductCollection.find(query).toArray();
      res.send(result);
    });
    // all tasks
    app.patch('/alltasks/:id', verifyJWT, async (req, res) => {
        const id = req.params.id;
        const taskComplete = req.body.taskComplete
        console.log(taskComplete)
        const query = { _id: ObjectId(id) }
        const updatedDoc = {
            $set:{
                taskComplete: taskComplete
            }
        }
        const result = await tasksCollection.updateOne(query, updatedDoc);
        res.send(result);
    })

    app.patch('/completetasks/:id', verifyJWT, async (req, res) => {
        const id = req.params.id;
        const taskComplete = req.body.taskComplete
        console.log(taskComplete)
        const query = { _id: ObjectId(id) }
        const updatedDoc = {
            $set:{
                taskComplete: taskComplete
            }
        }
        const result = await tasksCollection.updateOne(query, updatedDoc);
        res.send(result);
    })

    app.get("/completetasks/:email", async (req, res) => {
        const email = req.params.email;
        console.log(email);
        const query = { email, taskComplete:true };
        const result = await tasksCollection.find(query).toArray();
        res.send(result);
    });

    app.get("/alltasks/:email", async (req, res) => {
        const email = req.params.email;
        console.log(email);
        const query = { email };
        const result = await tasksCollection.find(query).toArray();
        res.send(result);
    });
    // all tasks
    app.delete("/alltasks/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await tasksCollection.deleteOne(filter);
      res.send(result);
    });
    // all task
    app.get("/alltasks", async (req, res) => {
      const query = {};
      const cursor = tasksCollection.find(query);
      const cat1 = await cursor.toArray();
      res.send(cat1);
    });
    app.post("/alltasks", async (req, res) => {
      const tasks = req.body;
      const result = await tasksCollection.insertOne(tasks);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

app.listen(port, (req, res) => {
  console.log(` server running on ${port}`);
});
