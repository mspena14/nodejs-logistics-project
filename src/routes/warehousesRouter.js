import { Router } from 'express';
import { pool } from '../../config/db.js';

export const warehouseRouter = Router();

warehouseRouter.get('/', async (req, res) => {
    const [warehouses] = await pool.query("SELECT * FROM warehouses");
    console.log(warehouses)
    res.json({
        message: "Data fetched successful",
        data: warehouses
    })
});