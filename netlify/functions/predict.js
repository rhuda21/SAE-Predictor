const Predictor = require('../../predictor');

const RAW_URL = "https://raw.githubusercontent.com/rhuda21/Main/refs/heads/main/Game%20Data/Steal%20An%20Egg/Data.json";

let predictorInstance = null;

function normalizeList(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item).trim())
            .filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

async function getPredictor() {
    if (!predictorInstance) {
        const response = await fetch(RAW_URL);
        if (!response.ok) {
            throw new Error(`Failed to load predictor data: ${response.status}`);
        }

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
            names = normalizeList(params.names);
            rarities = normalizeList(params.rarities);
        } else if (event.httpMethod === 'POST') {
            let body = {};

            if (event.body) {
                try {
                    body = JSON.parse(event.body);
                } catch (error) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            error: 'Invalid JSON body. Please send a valid object with names and/or rarities.'
                        })
                    };
                }
            }

            names = normalizeList(body.names);
            rarities = normalizeList(body.rarities);
        }

        if (names.length === 0 && rarities.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Provide at least one name or rarity in query params or JSON body.'
                })
            };
        }

        const results = predictor.predictByQuery({ names, rarities });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                count: results.length,
                data: results,
                message: 'Patched request processed successfully.'
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
