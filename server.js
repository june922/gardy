//FOR ANDROI EMULATOR

require('dotenv').config();  // Load environment variables

const port = process.env.PORT || 3000;
const app = require('./app');

app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});

// ✅ Start the server and listen on all interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});



// require('dotenv').config();  // Load environment variables

// const port = process.env.PORT || 3000;
// const app = require('./app');

// app.get("/", (req, res) => {
//   res.json({ message: "Welcome" });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });