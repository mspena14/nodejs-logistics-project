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
    const latestShipmentsFs = shipments[(shipments.length -1 )]
    return latestShipmentsFs.id + 1
};

const writeShipmentsFs = async (shipments) => {
    await fs.writeFile(shipmentsFilePath, JSON.stringify(shipments, null, 2))
};

routerShipment.post("/postShipments", async (req, res) => {
    const warehouseFound = await fetch(`http://localhost:3000/warehouses/${req.body.warehouseId}`);
    const shipments = await readShipmentsFs();
    const newShipment = {
        id: await idGenerator(),
        item: req.body.item,
        quantity: req.body.quantity,
        warehouseId : await warehouseFound.json()
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
    const warehouseFound = await fetch(`http://localhost:3000/warehouses/${req.body.warehouseId}`);
    const shipments = await readShipmentsFs();
    const shipmentIndex = shipments.findIndex(s => s.id === parseInt(req.params.id));

    if (shipmentIndex === -1) return res.status(404).send("Shipments not found!");
    const updateShipment = {
        ...shipments[shipmentIndex],
        item: req.body.item,
        quantity: req.body.quantity,
        warehouseId : await warehouseFound.json()
    };

    shipments[shipmentIndex] = updateShipment;
    await writeShipmentsFs(shipments);
    res.status(200).json({message: "Shipments update successfully!", shipment:updateShipment});
});

routerShipment.delete("/delete/:id", async () => {
    let shipments = await readShipmentsFs();
    const shipmentToDelete = shipments.find(s => s.id === parseInt(req.params.id));

    if (!shipmentToDelete) return res.status(404).send("Shipments not found!");
    
    shipments = shipments.filter(s => s.id !== shipmentToDelete.id);
    await writeShipmentsFs(shipments);
    res.status(200).send("Shipments deleted successfully!")
})

export default routerShipment;