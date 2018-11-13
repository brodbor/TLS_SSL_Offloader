var http = require('http'),
    httpProxy = require('http-proxy'),
	connect = require('connect'),
	fs = require('fs'),
	util = require('util'),
    colors = require('colors'),
    transformerProxy  = require('transformer-proxy');



console.log(colors.bgGreen.black("xConnect/XC9 Server"))

//Target xConnect Server
var xconnurl ="xconn.medrecordsafe.com";
var xconnport = "8080";
var xconncert ="C:/npm/CB9F9774D9894B5F60C171CA4AD0CF560CCAAD4D.pfx";




var url = util.format('https://%s:%s', xconnurl,xconnport);
var xconnlocal =util.format('%s:%s',"http://localhost",xconnport);





var app = connect();

// Create a proxy server
var proxy = httpProxy.createProxyServer({
  target: {
    protocol: 'https:',
    host: xconnurl,
    port: 8080,
     pfx: fs.readFileSync(xconncert),
     passphrase: 'secret',
	secure: true,
  },
  changeOrigin: true,
});

// Update odat url to local proxy port/url
var transformerFunction = function (data, req, res) {

    var re = new RegExp(url, "gi");
    return data.toString().replace(re,xconnlocal);
};

app.use(transformerProxy(transformerFunction));

app.use(function (req, res) {
  console.log(colors.inverse(util.format(' Server started.. proxing from %s to %s', xconnlocal,url)));
    console.log(colors.green('...request successfully proxied to: ' + req.url ));
  proxy.web(req, res);
});

http.createServer(app).listen(8080);

