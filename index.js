const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

const uri =
  'mongodb+srv://avijitsarkarofficial39:sz76f83X0K19e1aV@pos.azodoii.mongodb.net/product_Database?retryWrites=true&w=majority';
const collectionName = 'Product Inventory';
const salesCollectionName = 'Sales'; // Add this line for the Sales collection

app.get('/api/products', async (req, res) => {
  let client;

  try {
    client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const database = client.db();
    const collection = database.collection(collectionName);

    // Adjust the projection to include name, price, and units
    const projection = { name: 1, price: 1, units: 1 };
    const products = await collection.find({}, { projection }).toArray();

    res.json(products);
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// Add a new route for updating MongoDB data
app.post('/api/update-products', async (req, res) => {
  let client;

  try {
    client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const database = client.db();
    const collection = database.collection(collectionName);

    // Update 'units' values based on the cart items received in the request
    const cartItems = req.body.cartItems;
    for (const item of cartItems) {
      const filter = { name: item.name }; // Assuming the name is a unique identifier
      const update = { $inc: { units: -item.qty } }; // Decrease the 'units' value by the quantity
      await collection.updateOne(filter, update);
    }

    res.status(200).json({ message: 'MongoDB data updated successfully' });
  } catch (err) {
    console.error('Error updating data in MongoDB:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// Add a new route for saving data in the 'Sales' collection
app.post('/api/save-sales', async (req, res) => {
  let client;

  try {
    client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const database = client.db();
    const collection = database.collection(salesCollectionName);

    const salesData = req.body;
    const result = await collection.insertOne(salesData);

    if (result.insertedCount === 1) {
      res.status(200).json({ message: 'Data saved in Sales collection successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save data in Sales collection' });
    }
  } catch (err) {
    console.error('Error saving data in Sales collection:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
