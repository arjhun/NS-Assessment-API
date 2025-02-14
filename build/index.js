import "dotenv/config";
import { OpenAPIClientAxios } from "openapi-client-axios";
import yaml from "js-yaml";
import { readFileSync } from "fs";
const api = new OpenAPIClientAxios({
    definition: yaml.load(readFileSync("reisinformatie-api.yaml", "utf8")),
    axiosConfigDefaults: {
        headers: {
            "Ocp-Apim-Subscription-Key": "5e52219ad42843139ef6dcc966a50055",
        },
    },
});
const client = await api.getClient();
const tripResponse = await client.getTravelAdvice({
    fromStation: "Utrecht Centraal",
    toStation: "Amsterdam Centraal",
    dateTime: new Date().toISOString(),
});
const trips = tripResponse.data.length;
//# sourceMappingURL=index.js.map