const Predictor = require('../../predictor');

const RAW_URL = "https://raw.githubusercontent.com/rhuda21/Main/refs/heads/main/Game%20Data/Steal%20An%20Egg/Data.json";

let predictorInstance = null;

async function getPredictor() {
    if (!predictorInstance) {
        const response = await fetch(RAW_URL);
        const data = await response.json();
        predictorInstance = new Predictor(data);
    }
    return predictorInstance;
}

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const predictor = await getPredictor();
        let names = [];
        let rarities = [];

        if (event.httpMethod === 'GET') {
            const params = event.queryStringParameters || {};
            if (params.names) names = params.names.split(',').map((s) => s.trim());
            if (params.rarities) rarities = params.rarities.split(',').map((s) => s.trim());
        } else if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            names = body.names || [];
            rarities = body.rarities || [];
        }

        if (names.length === 0 && rarities.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Provide at least one name or rarity in query params or JSON body." })
            };
        }

        const results = predictor.predictByQuery({ names, rarities });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                count: results.length,
                data: results
            })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};