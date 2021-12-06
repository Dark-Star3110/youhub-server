"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const connect_1 = __importDefault(require("./config/db/connect"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
(0, connect_1.default)();
app.get("/", (_req, res) => {
    res.send("<h1>Hello World!</h1>");
});
app.listen(port, () => {
    console.log(`listening on port http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map