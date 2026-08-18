const Predictor = require('./predictor');

const RAW_URL = "https://raw.githubusercontent.com/rhuda21/Main/refs/heads/main/Game%20Data/Steal%20An%20Egg/Data.json";

async function main() {
    const response = await fetch(RAW_URL);
    const data = await response.json();

    const predictor = new Predictor(data);

    // 1. Predict by Rarity
    console.log("--- Prediction by Rarity (Legendary) ---");
    const rarityResults = predictor.predictByRarity("Legendary");
    console.log(JSON.stringify(rarityResults, null, 2));

    // 2. Predict by Specific Egg Name
    console.log("\n--- Prediction by Egg Name ---");
    const nameResult = predictor.predictByName("VolcanoEgg");
    console.log(JSON.stringify(nameResult, null, 2));
}

main().catch(console.error);