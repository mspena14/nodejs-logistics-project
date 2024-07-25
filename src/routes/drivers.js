import { Router, fs, path, fileURLToPath } from "./warehouses.js";

const routerDriver = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename)
const driversFilePath = path.join(_dirname, "../../data/drivers.json");

const readDriversFs = async () => {
    try {
        const drivers = await fs.readFile(driversFilePath, 'utf8');
        return JSON.parse(drivers);
    } catch (err) {
        throw new Error (`Error en la promesa ${err}`)
    }
};

const idGenerator = async () => {
    const drivers = await readDriversFs();
    if (drivers.length == 0) return 1;
    const latestDriver = drivers[(drivers.length -1 )]
    return latestDriver.id + 1
};

const writeDriversFs = async (drivers) => {
    await fs.writeFile(driversFilePath, JSON.stringify(drivers, null, 2))
};

routerDriver.post("/postDrivers", async (req, res) => {
    const drivers = await readDriversFs();
    const newDriver = {
        id: await idGenerator(),
        name: req.body.name
    };

    drivers.push(newDriver);
    await writeDriversFs(drivers);
    res.status(201).json({message: "Drivers created successfully!", driver:newDriver});
});

routerDriver.get("/", async (req, res) => {
    const drivers = await readDriversFs();
    res.json({drivers:drivers});
});

routerDriver.get("/:id", async (req, res) => {
    const drivers = await readDriversFs();
    const driver = drivers.find(d => d.id === parseInt(req.params.id));
    if (!driver) return res.status(404).send("Drivers not found!");
    res.json({driver:driver});
});

routerDriver.put("/:id", async (req, res) => {
    const drivers = await readDriversFs();
    const driverIndex = drivers.findIndex(d => d.id === parseInt(req.params.id));

    if (driverIndex === -1) return res.status(404).send("Drivers not found!");
    const updateDriver = {
        ...drivers[driverIndex],
        name: req.body.name,
    };

    drivers[driverIndex] = updateDriver;
    await writeDriversFs(drivers);
    res.status(200).json({message: "Drivers update successfully!", driver:updateDriver});
});

routerDriver.delete("/delete/:id", async () => {
    let drivers = await readDriversFs();
    const driverToDelete = drivers.find(d => d.id === parseInt(req.params.id));

    if (!driverToDelete) return res.status(404).send("Drivers not found!");
    
    drivers = drivers.filter(d => d.id !== driverToDelete.id);
    await writeDriversFs(drivers);
    res.status(200).send("Drivers deleted successfully!")
})

export default routerDriver;
