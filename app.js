import env from "dotenv";
import { Sequelize } from "sequelize";
import { DataTypes } from 'sequelize';
import express from "express";

const app = express();

app.use(express.json());

env.config();

// A new sequelize instance
const sequelize = new Sequelize(
    process.env.MYSQL_NAME,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASS,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

async function testConnection() {
    try {
    
        // await sequelize.sync({ alter: true })  // Run this only once in order to prevent it from creating redundant indexes in the candidat table
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();


const Task = sequelize.define("Task", {
    title: DataTypes.STRING,
    completed: Boolean,
});

app.get('/', (req, res) => {
    res.send('hello from your task manager');
})

// Route pour ajouter une tache
app.post("/tasks-add", async (req, res) => {
  try {
    const {title, completed} = req.body;
    const newTask = await Task.create({
        title, completed
    });
    res.status(201).send(newTask);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Edit task
app.post("/tasks-edit", async (req, res) => {
    const { id, title, completed } = req.body;

    try {

      const updatedTask = await Task.findOneAndUpdate(
        { _id: id },
        { title, completed },
        { new: true } // Retourne la tâche mise à jour
      );
      if (!updatedTask) {
        return res.status(404).send("Tâche non trouvée");
      }
      res.status(200).send(updatedTask);
    } catch (err) {
      res.status(400).send(err);
    }
  });

app.listen(3000, () => console.log("Server is running on port 3000"));
