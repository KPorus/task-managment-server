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

    // all tasks
    app.patch('/alltasks/:id', verifyJWT, async (req, res) => {
        const id = req.params.id;
        const taskComplete = req.body.taskComplete
        const query = { _id: ObjectId(id) }
        const updatedDoc = {
            $set:{
                taskComplete: taskComplete
            }
        }
        const result = await tasksCollection.updateOne(query, updatedDoc);
        res.send(result);
    })
    app.patch('/updatetasks/:id', verifyJWT, async (req, res) => {
        const id = req.params.id;
        const details = req.body.details
        const query = { _id: ObjectId(id) }
        const updatedDoc = {
            $set:{
                details: details
            }
        }
        const result = await tasksCollection.updateOne(query, updatedDoc);
        res.send(result);
    })

    app.patch('/completetasks/:id', verifyJWT, async (req, res) => {
        const id = req.params.id;
        const taskComplete = req.body.taskComplete
        const query = { _id: ObjectId(id) }
        const updatedDoc = {
            $set:{
                taskComplete: taskComplete
            }
        }
        const result = await tasksCollection.updateOne(query, updatedDoc);
        res.send(result);
    })

    app.get("/completetasks/:email",verifyJWT, async (req, res) => {
        const email = req.params.email;
        const query = { email, taskComplete:true };
        const result = await tasksCollection.find(query).toArray();
        res.send(result);
    });

    app.delete("/completetasks/:id",verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await tasksCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/alltasks/:email",verifyJWT, async (req, res) => {
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
