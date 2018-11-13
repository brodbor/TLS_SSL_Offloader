  var http = require('http'),
      httpProxy = require('http-proxy'),
	  connect = require('connect'),
	  util = require('util'),
	  request = require('request'),
	  transformerProxy  = require('transformer-proxy'),
	  colors = require('colors');

      console.log(colors.bgGreen.black("XC9 API Server"))


         var xconnurl ="xconn.medrecordsafe.com";
         var sec = "password=b&username=sitecore\\admin&client_id=postman-api&grant_type=password&scope=openid EngineAPI postman_api";
         var xconnport = "5000";

         var xconnlocal =util.format('%s:%s',"http://localhost", "5000");
         var url = util.format('https://%s:%s', xconnurl,xconnport);
         var urltoken = util.format('https://%s:%s/%s', xconnurl,"5050", "connect/token");


         //get JWT Token from Sitecore
         // may need to be moved to on-call execution; currently, exectured upon proxy service start
         Auth(function(tk){

				var app = connect();

               // Create a proxy server
				var proxy = httpProxy.createProxyServer({
				  target: {
					protocol: 'https:',
					host: xconnurl,
					port: xconnport,
				  },
				  changeOrigin: true,
				});

				// Update odat url to local proxy port/url
			   //TODO - not very efficient, look for better way to replace body on response
				var transformerFunction = function (data, req, res) {
					//console.log('Updating Body...')
                    var re = new RegExp(url, "gi");
                    return data.toString().replace(re,xconnlocal);
				};


                //appply body transform
				app.use(transformerProxy(transformerFunction));

                //set headers
			 proxy.on('proxyReq', function(proxyReq, req, res, options) {
                // console.log('Setting Headers...')
                 proxyReq.setHeader('Authorization', util.format('Bearer %s', tk));
                 proxyReq.setHeader('Environment', 'HabitatAuthoring');
                 proxyReq.setHeader('ShopName', 'CommerceEngineDefaultStorefront');

             });
				app.use(function (req, res) {

                    console.log(colors.inverse(util.format('Start proxing from %s to %s', xconnlocal,xconnurl)));
                    console.log(colors.green('...request successfully proxied to: ' + req.url ));
                    proxy.web(req, res);
				});


				http.createServer(app).listen(5000);


      });

         function Auth(callback) {
			request.post({
			  headers: {'content-type' : 'application/x-www-form-urlencoded'},
			  url:     urltoken,
			  body:    sec
			}, function(error, response, body){

			   var x = JSON.parse(body);
               // console.log("Generating  Token...         ")
			   callback( x.access_token );
			});

}