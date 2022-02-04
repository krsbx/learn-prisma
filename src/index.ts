require('dotenv').config();
import express from 'express';
import root from './utils/root';

const app = express();
const PORT = process.env.PORT || 3000;

root(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
