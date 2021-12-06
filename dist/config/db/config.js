"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entities_1 = __importDefault(require("../../entities"));
const config = {
    type: "mssql",
    host: "localhost",
    username: "sa",
    password: "0coMatkhau",
    database: "youHubDB",
    synchronize: true,
    logging: false,
    entities: entities_1.default,
    options: {
        encrypt: false,
    },
};
exports.default = config;
//# sourceMappingURL=config.js.map