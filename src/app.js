import express from "express";
import errorHundler from "./middlewares/errorHundler.js";
import routerWarehouse from "./routes/warehouses.js";
import routerDriver from "./routes/drivers.js";
import routerShipment from "./routes/shipments.js";
import routerVehicle from "./routes/vehicles.js";
import { routes } from "./routes/router.js";

const app = express();
const PORT = 3000;

// app.use(express.json());

app.use('/', routes)

// app.use("/warehouses", routerWarehouse);
// app.use("/drivers", routerDriver);
// app.use("/shipments", routerShipment);
// app.use("/vehicles", routerVehicle);
// app.use(errorHundler);


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
