import { testCategoryFetching, fetchProductsByCategoryRecursive } from "../lib/api";

async function runTest() {
  console.log("Starting Category Integration Test...");
  
  try {
    const { categories } = await testCategoryFetching();
    
    if (categories.length > 0) {
      const firstCat = categories[0];
      console.log(`\nTesting recursive product fetch for category: ${firstCat.name} (ID: ${firstCat.id})`);
      const products = await fetchProductsByCategoryRecursive(Number(firstCat.id));
      console.log(`Found ${products.length} products in this category and its subcategories.`);
      products.slice(0, 3).forEach(p => {
        console.log(`- [${p.id}] ${p.name}`);
      });
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTest();
