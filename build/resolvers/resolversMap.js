"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mutation_1 = __importDefault(require("./mutation"));
const query_1 = __importDefault(require("./query"));
const resolvers = Object.assign(Object.assign({}, query_1.default), mutation_1.default);
exports.default = resolvers;
