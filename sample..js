const express = require('express');
const app = express();
const { makeAndSetLogger } =require("./logger.js");
makeAndSetLogger({app: app, dir: "./log" });

