import express from 'express';
import cors from 'cors';
import indexRouter from './routes/authRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import cookieParser from 'cookie-parser';
const app = express();

// CORS must be first
app.use(cors({
  origin: 'https://rosync.vercel.app',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/api', folderRoutes);
app.use('/api', fileRoutes);
app.use('/api', shareRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;