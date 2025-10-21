import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
