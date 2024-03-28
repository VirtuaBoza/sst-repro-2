import { default as tiktoken } from "tiktoken-node";

const encoding = tiktoken.getEncoding("cl100k_base");

const tokens = encoding.encode("FELINES");

console.log(tokens);
