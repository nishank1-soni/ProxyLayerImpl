const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware,fixRequestBody} = require("http-proxy-middleware");
const _ = require('lodash');
// Create Express Server
const app = express();
const URL =  "https://uat.rupeek.co";
// Configuration
const PORT = 3000;
const HOST = "localhost";
// Logging : This tells express to log via morgan and morgan to log in the "combined" pre-defined format // That's it. Everything in your snippet after this are just other variations your might want to use
app.use(morgan('combined'))
app.use(express.json());


var validatingResponse = function(proxyRes, req, res) 
{
    const exchange = `[${req.method}] [${proxyRes.statusCode}] ${req.path} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path}`;
    console.log(exchange); // [GET] [200] / -> http://www.example.com
};

var restream = function(proxyReq, req, res, options) {
    if (req.body) 
    {
        const newLoanRequestObj = _.omit(req.body, [
            "pledgecards",
            "coBorrowerDetails",
            "phone"
        ]);
        let bodyData = JSON.stringify(newLoanRequestObj);
        proxyReq.setHeader('Content-Type','application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // stream the content
        proxyReq.write(bodyData);
    }
}


var apiProxy = createProxyMiddleware('/testing', {
    target: URL,
    pathRewrite: {[`^/testing`]: "",},
    changeOrigin: true,// to handle mismatching SSL certificate 
    onProxyReq: restream,
    onProxyRes: validatingResponse
});




app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(apiProxy);  

// Start Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
});