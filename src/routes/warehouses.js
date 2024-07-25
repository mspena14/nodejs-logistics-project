import { Router } from "express";
import { promises as fs } from 'fs';
import { fileURLToPath  } from "url";
import path from 'path';

const routerWarehouse = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename)
const warehousesFilePath = path.join(_dirname, "../../data/warehouses.json");

const readWarehousesFs = async () => {
    try {
        const warehouses = await fs.readFile(warehousesFilePath, 'utf8');
        return JSON.parse(warehouses);
    } catch (err) {
        throw new Error (`Error en la promesa ${err}`)
    }
};

const idGenerator = async () => {
    const warehouses = await readWarehousesFs();
    if (warehouses.length == 0) return 1;
    const latestWarehouse = warehouses[(warehouses.length -1 )]
    return latestWarehouse.id + 1
};

const writeWarehousesFs = async (warehouses) => {
    await fs.writeFile(warehousesFilePath, JSON.stringify(warehouses, null, 2))
};

routerWarehouse.post("/postWarehouses", async (req, res) => {
    if (!req.body.name) return res.status(404).send("name property required!");
    if (!req.body.location) return res.status(404).send("location property required!");
    if (!req.body.vehicleId) return res.status(404).send("vehicleId property required!");

    const vehicleResponse = await fetch(`http://localhost:3000/vehicles/${req.body.vehicleId}`);
    if (!vehicleResponse.ok) return res.status(404).send("Vehicle id not found!");

    const warehouses = await readWarehousesFs();
    const newWarehouse = {
        id: await idGenerator(),
        name: req.body.name,
        location:  req.body.location,
        vehicleId: req.body.vehicleId
    };

    warehouses.push(newWarehouse);
    await writeWarehousesFs(warehouses);
    res.status(201).json({message: "Warehouse created successfully!", warehouse:newWarehouse});
});

routerWarehouse.get("/", async (req, res) => {
    const warehouses = await readWarehousesFs();
    res.json({warehouses:warehouses});
});

routerWarehouse.get("/:id", async (req, res) => {
    const warehouses = await readWarehousesFs();
    const warehouse = warehouses.find(w => w.id === parseInt(req.params.id));
    if (!warehouse) return res.status(404).send("Warehouse not found!");
    res.json({warehouse:warehouse});
});

routerWarehouse.put("/:id", async (req, res) => {
    if (!req.body.name) return res.status(404).send("name property required!");
    if (!req.body.location) return res.status(404).send("location property required!");
    if (!req.body.vehicleId) return res.status(404).send("vehicleId property required!");

    const vehicleResponse = await fetch(`http://localhost:3000/vehicles/${req.body.vehicleId}`);
    if (!vehicleResponse.ok) return res.status(404).send("Vehicle id not found!");

    const warehouses = await readWarehousesFs();
    const warehouseIndex = warehouses.findIndex(w => w.id === parseInt(req.params.id));

    if (warehouseIndex === -1) return res.status(404).send("Warehouse not found!");
    const updateWarehouse = {
        ...warehouses[warehouseIndex],
        name: req.body.name,
        location:  req.body.location,
        vehicleId: req.body.vehicleId
    };

    warehouses[warehouseIndex] = updateWarehouse;
    await writeWarehousesFs(warehouses);
    res.status(200).json({message: "Warehouse update successfully!", warehouse:updateWarehouse});
});

routerWarehouse.delete("/delete/:id", async (req, res) => {
    let warehouses = await readWarehousesFs();
    const warehouseToDelete = warehouses.find(w => w.id === parseInt(req.params.id));

    if (!warehouseToDelete) return res.status(404).send("Warehouse not found!");
    
    warehouses = warehouses.filter(w => w.id !== warehouseToDelete.id);
    await writeWarehousesFs(warehouses);
    res.status(200).send("Warehouse deleted successfully!")
})

export default routerWarehouse;
export { Router, fs, path, fileURLToPath };