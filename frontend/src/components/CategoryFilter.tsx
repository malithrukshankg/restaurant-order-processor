interface CategoryFilterProps {
  activeCategory: "ALL" | "BURGER" | "DRINK";
  onCategoryChange: (category: "ALL" | "BURGER" | "DRINK") => void;
  totalItems: number;
  burgerCount: number;
  drinkCount: number;
}

export function CategoryFilter({
  activeCategory,
  onCategoryChange,
  totalItems,
  burgerCount,
  drinkCount,
}: CategoryFilterProps) {
  return (
    <div className="category-filter">
      <button
        className={`category-btn ${activeCategory === "ALL" ? "active" : ""}`}
        onClick={() => onCategoryChange("ALL")}
      >
        All Items ({totalItems})
      </button>
      <button
        className={`category-btn ${activeCategory === "BURGER" ? "active" : ""}`}
        onClick={() => onCategoryChange("BURGER")}
      >
        Burgers ({burgerCount})
      </button>
      <button
        className={`category-btn ${activeCategory === "DRINK" ? "active" : ""}`}
        onClick={() => onCategoryChange("DRINK")}
      >
        Drinks ({drinkCount})
      </button>
    </div>
  );
}