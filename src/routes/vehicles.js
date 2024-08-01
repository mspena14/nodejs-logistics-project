import { Router, fs, path, fileURLToPath } from "./warehouses.js";

const routerVehicle = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename)
const vehiclesFilePath = path.join(_dirname, "../../data/vehicles.json");

const readVehiclesFs = async () => {
    try {
        const vehicles = await fs.readFile(vehiclesFilePath, 'utf8');
        return JSON.parse(vehicles);
    } catch (err) {
        throw new Error (`Error en la promesa ${err}`)
    }
};

const idGenerator = async () => {
    const vehicles = await readVehiclesFs();
    if (vehicles.length == 0) return 1;
    const latestVehicles = vehicles[(vehicles.length -1 )]
    return latestVehicles.id + 1
};

const writeVehiclesFs = async (vehicles) => {
    await fs.writeFile(vehiclesFilePath, JSON.stringify(vehicles, null, 2))
};

routerVehicle.post("/", async (req, res) => {
    if (!req.body.model) return res.status(404).send("model property required!");
    if (!req.body.year) return res.status(404).send("year property required!");
    if (!req.body.driverId) return res.status(404).send("driverId property required!");

    const driverResponse = await fetch(`http://localhost:3000/drivers/${req.body.driverId}`);

    if (!driverResponse.ok) return res.status(404).send("Driver id not found!");

    const vehicles = await readVehiclesFs();
    const newVehicles = {
        id: await idGenerator(),
        model: req.body.model,
        year: req.body.year,
        driverId : req.body.driverId
    };

    vehicles.push(newVehicles);
    await writeVehiclesFs(vehicles);
    res.status(201).json({message: "Vehicles created successfully!", vehicle:newVehicles});
});

routerVehicle.get("/", async (req, res) => {
    const vehicles = await readVehiclesFs();
    res.json({vehicles:vehicles});
});

routerVehicle.get("/:id", async (req, res) => {
    const vehicles = await readVehiclesFs();
    const vehicle = vehicles.find(v => v.id === parseInt(req.params.id));
    if (!vehicle) return res.status(404).send("Vehicles not found!");
    res.json({vehicle:vehicle});
});

routerVehicle.put("/:id", async (req, res) => {
    if (!req.body.model) return res.status(404).send("model property required!");
    if (!req.body.year) return res.status(404).send("year property required!");
    if (!req.body.driverId) return res.status(404).send("driverId property required!");

    const driverResponse = await fetch(`http://localhost:3000/drivers/${req.body.driverId}`);

    if (!driverResponse.ok) return res.status(404).send("Driver id not found!");

    const vehicles = await readVehiclesFs();
    const vehicleIndex = vehicles.findIndex(v => v.id === parseInt(req.params.id));

    if (vehicleIndex === -1) return res.status(404).send("Vehicles not found!");
    const updateVehicle = {
        ...vehicles[vehicleIndex],
        model: req.body.model,
        year: req.body.year,
        driverId : req.body.driverId
    };

    vehicles[vehicleIndex] = updateVehicle;
    await writeVehiclesFs(vehicles);
    res.status(200).json({message: "Vehicles update successfully!", vehicle:updateVehicle});
});

routerVehicle.delete("/:id", async (req, res) => {
    let vehicles = await readVehiclesFs();
    const vehicleToDelete = vehicles.find(v => v.id === parseInt(req.params.id));

    if (!vehicleToDelete) return res.status(404).send("Vehicles not found!");
    
    vehicles = vehicles.filter(v => v.id !== vehicleToDelete.id);
    await writeVehiclesFs(vehicles);
    res.status(200).send("Vehicles deleted successfully!")
})

export default routerVehicle;