import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

import formRoutes from './modules/form/form.routes.ts';

const app = express();

app.use('/', formRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

export default app;
