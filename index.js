const express = require("express");
const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

const { Client } = require("pg");

app.get("/", (req, res) => {
  res.status(200).render('index');
});

app.get("/:randomkey", async (req, res) => {
  let randomKey = req.params.randomkey;

  const client = new Client({ 
    connectionString: 'postgres://justin:justin@localhost:5432/requestbindb',
    user: "justin",
    password: "justin"
  });

  await client.connect();

  let result = await client.query(`SELECT requests.headers FROM requests JOIN identifier ON requests.random_key_id = identifier.id WHERE identifier.random_key = '${randomKey}'`);

  await client.end();

  if (result.rowCount > 0) {
    res.status(200).render('requests', {requests:result.rows});
  } else {
    // change url when deploying
    res.status(200).render('bin_nothing', {url: `http://165.232.130.72/r/${randomKey}`});
  }
});


app.post("/r/:randomkey", async (req, res) => {
  let headers = JSON.stringify(req.rawHeaders);
  let randomKey = req.params.randomkey;
  
  const client = new Client({ 
    connectionString: 'postgres://justin:justin@localhost:5432/requestbindb',
    user: "justin",
    password: "justin"
  });

  await client.connect();
  let randomKeyId = await client.query(`SELECT id FROM identifier WHERE random_key = '${randomKey}'`);
  
  await client.query(`INSERT INTO requests (headers, random_key_id) VALUES ('${headers}', ${randomKeyId.rows[0].id})`);
  await client.end();

  res.status(200).send('ASDF');
});

app.post("/create", async (req, res) => {
  let randomKey = new Date().getTime().toString(16);

  const client = new Client({ 
    connectionString: 'postgres://justin:justin@localhost:5432/requestbindb',
    user: "justin",
    password: "justin"
  });

  await client.connect();
  await client.query(`INSERT INTO identifier (random_key) VALUES ('${randomKey}')`);
  await client.end();

  res.status(200).send(randomKey);
})

app.listen(3000, () => {
  console.log(`Example app listening at port:3000`);
});