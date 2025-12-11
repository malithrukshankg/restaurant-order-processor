import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { MenuItem } from "./entities/MenuItem";

async function seed() {
  await AppDataSource.initialize();

  const menuRepo = AppDataSource.getRepository(MenuItem);


  await menuRepo.clear();

  await menuRepo.save([
    { name: "Cheeseburger", type: "BURGER", size: null, price: 15, isActive: true },
    { name: "Chicken burger", type: "BURGER", size: null, price: 20, isActive: true },
    { name: "Soft drink", type: "DRINK", size: "SMALL", price: 4, isActive: true },
    { name: "Soft drink", type: "DRINK", size: "LARGE", price: 5, isActive: true },
  ]);

  console.log("Seeded menu items");

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
