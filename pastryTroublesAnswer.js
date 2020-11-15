const fs = require('fs');
const dataLocation = "pastry_orders.json";
const exportFilename = "ordersExport.json";

// Load from json
let rawdata = fs.readFileSync(dataLocation);
let data = JSON.parse(rawdata);
let orderList = [];

// Remove empty arrays
for (let i = 0; i < data.length; i++) {
  if (data[i].length > 0) {
    orderList.push(data[i]);
  }
}

// Parse through all orders and reduce to
// efficiency rating
// total order cost
// total flour usage
// index
let efficiencyList = [];

orderList.forEach((order, index) => {
  let totalFlour = 0;
  let totalPrice = 0;
  let efficiencyRating = 0;
  order.forEach(item => {
    totalFlour += item.flourConsumption * item.quantity;
    totalPrice += item.price * item.quantity;
  });
  efficiencyRating = totalPrice / totalFlour;
  // add index also so easy to ref original orders
  efficiencyList.push([efficiencyRating, totalPrice, totalFlour, index]);
});

// Sort by efficiency rating
efficiencyList.sort((a, b) => {
  return b[0] - a[0];
});

// Collect all orders starting from the most efficient,
// When at the end, try orders until all flour is used,
// trying to be as efficient as possible.
// Will have to try going back multiple steps to get most
// efficient subset of orders
let flour = 60000;
let income = 0;
let orderCount = 0;
let indexList = [];

for (let i = 0; i < efficiencyList.length; i++) {
  if (flour > efficiencyList[i][2]) {
    income += parseFloat(efficiencyList[i][1]);
    flour -= parseFloat(efficiencyList[i][2]);
    orderCount++;
    indexList.push(parseInt(efficiencyList[i][3]));
  }
}

console.log("Total orders fulfilled: " + orderCount);
console.log("Total profit: $" + income.toFixed(2));
console.log(`Total flour left over: ${flour.toFixed(2)}g`);
console.log("Order list exported as: " + exportFilename);

// Get the profitable orders and export
indexList.sort((a,b) => {
  return a-b;
});

let jsonExport = [];

indexList.forEach(i => {
  jsonExport.push(orderList[i]);
})

fs.writeFileSync(exportFilename, JSON.stringify(jsonExport));

// Test the exported json
let testedFlour = 0;
let testedPrice = 0;

jsonExport.forEach(order => {
  order.forEach(item => {
    testedFlour += item.flourConsumption * item.quantity;
    testedPrice += item.price * item.quantity;
  })
})

console.log("\n~ ~ ~ Testing the results ~ ~ ~");
console.log("Total flour used: " + testedFlour);
console.log("Total price of products: " + testedPrice);
