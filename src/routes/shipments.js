import { Router, fs, path, fileURLToPath } from "./warehouses.js";

const routerShipment = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename)
const shipmentsFilePath = path.join(_dirname, "../../data/shipments.json");

const readShipmentsFs = async () => {
    try {
        const shipments = await fs.readFile(shipmentsFilePath, 'utf8');
        return JSON.parse(shipments);
    } catch (err) {
        throw new Error (`Error en la promesa ${err}`)
    }
};

const idGenerator = async () => {
    const shipments = await readShipmentsFs();
    if (shipments.length == 0) return 1;
    const latestShipments = shipments[(shipments.length -1 )]
    return latestShipments.id + 1
};

const writeShipmentsFs = async (shipments) => {
    await fs.writeFile(shipmentsFilePath, JSON.stringify(shipments, null, 2))
};

routerShipment.post("/", async (req, res) => {
    if (!req.body.item) return res.status(404).send("item property required!");
    if (!req.body.quantity) return res.status(404).send("quantity property required!");
    if (!req.body.warehouseId) return res.status(404).send("warehouseId property required!");
    if (!req.body.driverId) return res.status(404).send("driverId property required!");
    if (!req.body.vehicleId) return res.status(404).send("vehicleId property required!");

    const warehouseResponse = await fetch(`http://localhost:3000/warehouses/${req.body.warehouseId}`);
    const driverResponse = await fetch(`http://localhost:3000/drivers/${req.body.driverId}`);
    const vehicleResponse = await fetch(`http://localhost:3000/vehicles/${req.body.vehicleId}`);

    if (!warehouseResponse.ok) return res.status(404).send("Warehouse id not found!");
    if (!driverResponse.ok) return res.status(404).send("Driver id not found!");
    if (!vehicleResponse.ok) return res.status(404).send("Vehicle id not found!");

    const shipments = await readShipmentsFs();
    const newShipment = {
        id: await idGenerator(),
        item: req.body.item,
        quantity: req.body.quantity,
        warehouseId : req.body.warehouseId,
        driverId : req.body.driverId,
        vehicleId : req.body.vehicleId
    };

    shipments.push(newShipment);
    await writeShipmentsFs(shipments);
    res.status(201).json({message: "Shipments created successfully!", shipment:newShipment});
});

routerShipment.get("/", async (req, res) => {
    const shipments = await readShipmentsFs();
    res.json({shipments:shipments});
});

routerShipment.get("/:id", async (req, res) => {
    const shipments = await readShipmentsFs();
    const shipment = shipments.find(s => s.id === parseInt(req.params.id));
    if (!shipment) return res.status(404).send("Shipments not found!");
    res.json({shipment:shipment});
});

routerShipment.put("/:id", async (req, res) => {
    if (!req.body.item) return res.status(404).send("item property required!");
    if (!req.body.quantity) return res.status(404).send("quantity property required!");
    if (!req.body.warehouseId) return res.status(404).send("warehouseId property required!");
    if (!req.body.driverId) return res.status(404).send("driverId property required!");
    if (!req.body.vehicleId) return res.status(404).send("vehicleId property required!");

    const warehouseResponse = await fetch(`http://localhost:3000/warehouses/${req.body.warehouseId}`);
    const driverResponse = await fetch(`http://localhost:3000/drivers/${req.body.driverId}`);
    const vehicleResponse = await fetch(`http://localhost:3000/vehicles/${req.body.vehicleId}`);

    if (!warehouseResponse.ok) return res.status(404).send("Warehouse id not found!");
    if (!driverResponse.ok) return res.status(404).send("Driver id not found!");
    if (!vehicleResponse.ok) return res.status(404).send("Vehicle id not found!");

    const shipments = await readShipmentsFs();
    const shipmentIndex = shipments.findIndex(s => s.id === parseInt(req.params.id));

    if (shipmentIndex === -1) return res.status(404).send("Shipments not found!");
    const updateShipment = {
        ...shipments[shipmentIndex],
        item: req.body.item,
        quantity: req.body.quantity,
        warehouseId : req.body.warehouseId,
        driverId : req.body.driverId,
        vehicleId : req.body.vehicleId
    };

    shipments[shipmentIndex] = updateShipment;
    await writeShipmentsFs(shipments);
    res.status(200).json({message: "Shipments update successfully!", shipment:updateShipment});
});

routerShipment.delete("/:id", async (req, res) => {
    let shipments = await readShipmentsFs();
    const shipmentToDelete = shipments.find(s => s.id === parseInt(req.params.id));

    if (!shipmentToDelete) return res.status(404).send("Shipments not found!");
    
    shipments = shipments.filter(s => s.id !== shipmentToDelete.id);
    await writeShipmentsFs(shipments);
    res.status(200).send("Shipments deleted successfully!")
})

export default routerShipment;