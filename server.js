const port = 3000;
const app = require('./app');

app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});