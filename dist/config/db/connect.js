"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = __importDefault(require("./config"));
async function connect() {
    try {
        await (0, typeorm_1.createConnection)(config_1.default);
        console.log("connect thanh cong");
    }
    catch (err) {
        console.log("connect that bai");
    }
}
exports.default = connect;
//# sourceMappingURL=connect.js.map