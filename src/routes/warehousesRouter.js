// import { Router } from 'express';
// import { pool } from '../../config/db.js';

// export const warehouseRouter = Router();

// warehouseRouter.get('/', async (_, res) => {
//     const [warehouses] = await pool.query("SELECT * FROM warehouses");
//     console.log(warehouses)
//     res.status(200).json({
//         message: "Data fetched successful",
//         data: warehouses
//     });
// });

// warehouseRouter.post('/', async (req, res) => {
//     const {name, location} = req.body;

//     try {
//         const sql =
//           'INSERT INTO `users`(`name`, `age`) VALUES ("Josh", 19), ("Page", 45)';
      

      

//       } catch (err) {
//         console.log(err);
//       }
// })