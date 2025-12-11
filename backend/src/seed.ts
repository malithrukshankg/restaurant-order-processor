import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { MenuItem } from "./entities/MenuItem";

async function seed() {
  await AppDataSource.initialize();

  const menuRepo = AppDataSource.getRepository(MenuItem);

  
  await menuRepo.clear();

  await menuRepo.save([
    { name: "Margherita Pizza", price: 18.5, category: "Main", isActive: true },
    { name: "Pepperoni Pizza", price: 20.0, category: "Main", isActive: true },
    { name: "BBQ Chicken Pizza", price: 22.0, category: "Main", isActive: true },
    { name: "Garlic Bread", price: 7.5, category: "Starter", isActive: true },
    { name: "Cheesy Garlic Bread", price: 8.5, category: "Starter", isActive: true },
    { name: "Coke", price: 4.0, category: "Drink", isActive: true },
    { name: "Sprite", price: 4.0, category: "Drink", isActive: true },
  ]);

  console.log("Seeded menu items");

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
