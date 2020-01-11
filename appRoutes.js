var express = require('express');
var router = express();
var request = require('request');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var magentoServerKey;
var jsonSecretkey;


var ERROR = {
    JSON_ERROR      : "USER SESSION IS INVALID",                            // 400
    '401'             : "INVALID CREDENTIALS",                                // HTTP_UNAUTHORIZED
    '403'             : "ACCESS DENIED",                                      // HTTP_FORBIDDEN
    '404'             : "RESOURCE NOT FOUND",                                 // HTTP_NOT_FOUND
    '405'             : "YOU'RE NOT ALLOWED TO ACCESS THIS RESOURCE",         // HTTP_METHOD_NOT_ALLOWED
    '406'             : "THE REQUEST IS NOT ACCEPTABLE",                      // HTTP_NOT_ACCEPTABLE
    '500'             : "RESOURCE INTERNAL ERROR",                            // HTTP_INTERNAL_ERROR
    CUSTOM_ERROR    : "IT'S NOT YOU, IT'S US. SORRY FOR THE INCONVENIENCE"  // CUSTOM ERROR - 400
}



// GET CATEGORIES FROM MAGENTO
router.get('/get_category', (req, res) => {
    request(magentoServerKey + '/rest/V1/categories', function (error, response, body) {
        if (response.statusCode == 200) {                                                             // If response status is 200
            res.status(200).send(JSON.parse(body))
        }
        if(response.statusCode != 200 || error) {                                                     // If response status is an error 
            res.status(500).send(ERROR.CUSTOM_ERROR)
        }
    })
});


// GET LABLES DEFINED IN LABEL ARRAY (arr_labels)
router.get('/magentoImageLink', (req, res) => {
    key = magentoServerKey + "/pub/media/catalog/product";
    res.status(200).send(key);
});

// GET LABLES DEFINED IN LABEL ARRAY (arr_labels)
router.get('/magentoPdfLink', (req, res) => {
    key = magentoServerKey + "/pub/media/pdfattachment/";
    res.status(200).send(key);
});


// GET SEARCH APIS
router.get('/searchAPI', (req, res) => {
    // var token = createToken(searchApi);
    res.status(200).send(searchApi);
});


// GET PRODUCTS DETAILS FOR A PARTICULAR SKU
router.post('/get_sku', (req, res) => {                                          // ROUTER FOR GETTING PRODUCT DETAIL OF AN SKU
    request(magentoServerKey + '/rest/V1/products/'+req.body.data, function (error, response, body) {       // GET PARTICULAR PRODUCT DETAIL OF AN SKU FROM MAGENTO
        if (response.statusCode == 200) {                                                             // If response status is 200
            res.status(200).send(JSON.parse(body))  
        }
        if(response.statusCode != 200 || error) {
            res.status(500).json({msg: ERROR.CUSTOM_ERROR})
        }
    })
}); 

// GET PRODUCTS DETAILS FOR A PARTICULAR SKU ID
router.get('/get_attr/:id', (req, res) => {                                          // ROUTER FOR GETTING PRODUCT DETAIL OF AN SKU
    request(magentoServerKey + '/rest/V1/custom/orders/'+req.params.id, function (error, response, body) {       // GET PARTICULAR PRODUCT DETAIL OF AN SKU FROM MAGENTO
        if (response.statusCode == 200) {                                                             // If response status is 200
            res.status(200).send(JSON.parse(body))  
        }
        if(response.statusCode != 200 || error) {
            res.status(500).send(ERROR.CUSTOM_ERROR)
        }
    })
}); 

// GET PRODUCTS ID FOR A PARTICULAR SKU
router.get('/get_id/:id', (req, res) => {                                          // ROUTER FOR GETTING PRODUCT DETAIL OF AN SKU
    request(magentoServerKey + '/rest/V1/category/products/'+req.params.id, function (error, response, body) {       // GET PARTICULAR PRODUCT DETAIL OF AN SKU FROM MAGENTO
        if (response.statusCode == 200) {                                                             // If response status is 200
            res.status(200).send(JSON.parse(body))  
        }
        if(response.statusCode != 200 || error) {
            res.status(500).send(ERROR.CUSTOM_ERROR)
        }
    })
}); 


// GET PRODUCTS OF A PARTICULAR CATEGORY
router.get('/get_products/:id', (req, res) => {                                     // ROUTER FOR GETTING PRODUCT DETAILS OF AN SKU
    request(magentoServerKey + '/rest/V1/products?searchCriteria[filter_groups][0][filters][0][field]=category_id&searchCriteria[filter_groups][0][filters][0][value]='+req.params.id, function (error, response, body) {
        if (response.statusCode == 200) {                                                             // If response status is 200
            res.status(200).send(JSON.parse(body))                                  // JSON RESPONSE WIHOUT ENCRYPTION
        }
        if(response.statusCode != 200 || error) {
            res.status(500).send(ERROR.CUSTOM_ERROR)                   // SENDING ERROR RESPONSE
        }
    })
});


// USER LOGIN 
router.get('/user_login/:id', (req, res) => {                                       // ROUTER FOR USER LOGIN

    var loginData = req.params.id;                                                  // GET USER DATA ( username & password )

    request.post({                                                                  // POST METHOD FOR USER LOGIN
        url: magentoServerKey + '/rest/default/V1/integration/customer/token',      // MAGENTO URL FOR USER LOGIN
        headers: {                                                                  // HEADERS
            "Content-Type": "application/json", 
            "cache-control": "no-cache" 
        },
        body: loginData,                                                            // USER LOGIN DATA
    }, 
    function(error, response, body){
        if (response.statusCode == 200) {                                                             // If response status is 200
            try {
                var token = createToken(body.toString().replace(/"/g, ''))          // ENCRYPT RESPONSE DATA USING JWT (SHA - 256) ALGORITHM (createToken() => Encrypting Function)
                res.status(200).send(token)                                                     // SENDING ENCRYPTED DATA AS RESPONSE
            }
            catch(e) {
                res.status(400).send(ERROR.JSON_ERROR);                             // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
            }
        }
        if(response.statusCode != 200 || error) {
            res.status(401).send(ERROR['401'])                     // IF DATA DATA IS INVALID, SENDING ERROR RESPONSE
        }
    });
});








// CART FUNCTIONALITIES



// GET CART ITEMS OF A LOGGED IN CUSTOMER
router.get('/get_cart_items/:id', (req, res) => {                                   // ROUTER FOR GETTING CART ITEMS FOR A LOGGED IN USER

    var Jwt = req.params.id;                                                        // GETTING CUSTOMER ACCESS TOKEN ENCRYPTED BY JWT

    try {
        var token = decodeToken(Jwt);                                               // DECODE THE ENCRYPTED TOKEN (decodeToken() => Decrypting Function)
        
        request.get({                                                               // GET CART ITEMS OF AN CUSTOMER USING CUSTOMER (USER) ACCESS TOKEN
            headers: {                                                              // HEADERS
                "Content-Type": "application/json", 
                "Authorization": "Bearer " + token, 
                "cache-control": "no-cache" 
            },
            url: magentoServerKey + '/rest/default/V1/carts/mine'                   // MAGENTO URL FOR GETTING CART ITEMS OF AN CUSTOMER (USER)
        }, 
        function(error, response, body){
            if (response.statusCode == 200) {                                                         // If response status is 200
                try {
                    var token = createToken(body.toString())                        // ENCRYPT RESPONSE DATA USING JWT (SHA - 256) ALGORITHM (createToken() => Encrypting Function)
                    res.status(200).send(token)                                     // RESPONSE WITH ACTUAL DATA
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);                         // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])                 // IF DATA DATA IS INVALID, SENDING ERROR RESPONSE
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);                                     // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
    }
});


// GET CART ID OF A CUSTOMER
router.get('/get_cartId/:id', (req, res) => {                                       // ROUTER FOR CREATING CART-ID FOR A LOGGED IN USER

    var Jwt = req.params.id;                                                        // GETTING CUSTOMER ACCESS TOKEN ENCRYPTED BY JWT

    try {
        var token = decodeToken(Jwt);                                               // DECODE THE ENCRYPTED TOKEN (decodeToken() => Decrypting Function)
        
        request.post({                                                              // POST METHOD FOR ACQUIRING CART-ID WTH CUSTOMER TOKEN
            url: magentoServerKey + '/rest/default/V1/carts/mine',                  // MAGENTO URL FOR GETTING CART-ID FOR A LOGGED IN CUSTOMER (USER)
            headers: {                                                              // HEADERS
                "Content-Type": "application/json", 
                "Authorization": "Bearer " + token,
                "cache-control": "no-cache" 
            }
        }, 
        function(error, response, body){
            if (response.statusCode == 200) {                                                         // If response status is 200
                try {
                    var token = createToken(body.toString())                        // ENCRYPT RESPONSE DATA USING JWT (SHA - 256) ALGORITHM (createToken() => Encrypting Function)
                    res.status(200).send(token)                                     // RESPONSE WITH ACTUAL DATA
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);                         // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])                 // IF DATA DATA IS INVALID, SENDING ERROR RESPONSE
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);                                     // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
    }
})



// ADD ITEMS TO THE CUSTOMER CART
router.get('/add_cart_items/:input', (req, res) => {                                // ROUTER FOR ADDING CART ITEMS FOR A LOGGED IN USER

    var Jwt = JSON.parse(req.params.input);                                         // GETTING CUSTOMER ACCESS TOKEN ENCRYPTED BY JWT

    try {                   
        var token = decodeToken(Jwt.jwt);                                           // DECODE THE ENCRYPTED TOKEN (decodeToken() => Decrypting Function)
        
        request.post({                                                              // POST METHOD FOR ADDING ITEMS TO CUSTOMER CART
            url: magentoServerKey + '/rest/default/V1/carts/mine/items',            // MAGENTO URL FOR ADDING ITEMS TO CART FOR A LOGGED IN CUSTOMER (USER)
            headers: {                                                              // HEADERS
                "Content-Type": "application/json", 
                "Authorization": "Bearer " + token, 
                "cache-control": "no-cache" 
            },
            body: JSON.stringify(Jwt.items)                                         // CARTITEMS DATA (Format - JSON)
        }, 
        function(error, response, body){                                    
            if (response.statusCode == 200) {                                                         // If response status is 200
                try {
                    var token = createToken(body.toString())                        // ENCRYPT RESPONSE DATA USING JWT (SHA - 256) ALGORITHM (createToken() => Encrypting Function)
                    res.status(200).send(token)                                                 // RESPONSE WITH ACTUAL DATA
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);                         // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(400).send(ERROR['400'])                 // IF DATA DATA IS INVALID, SENDING ERROR RESPONSE
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);                                     // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
    }
})



// UPDATE QTY OF AN ITEM IN CUSTOMER CART
router.get('/update_cart_item/:input', (req, res) => {                              // ROUTER FOR UPDATING CART ITEMS FOR A LOGGED IN USER

    var Jwt = JSON.parse(req.params.input);                                         // GETTING CUSTOMER ACCESS TOKEN ENCRYPTED BY JWT

    try {
        var token = decodeToken(Jwt.jwt);                                               // DECODE THE ENCRYPTED TOKEN (decodeToken() => Decrypting Function)
        
        request.put({                                                               // PUT METHOD FOR UPDATING ITEMS IN THE CUSTOMER CART
            url: magentoServerKey + '/rest/default/V1/carts/mine/items/' + Jwt.id.toString(),    // MAGENTO URL FOR UPDATING ITEMS IN THE CART FOR A LOGGED IN CUSTOMER (USER)
            headers: {                                                              // HEADERS
                "Content-Type": "application/json",     
                "Authorization": "Bearer " + token.toString(), 
                "cache-control": "no-cache" 
            },
            body: JSON.stringify(Jwt.items)                                         // CARTITEMS DATA (Format - JSON)
        }, 
        function(error, response, body){
            if (response.statusCode == 200) {                                                         // If response status is 200
                try {
                    var token = createToken(body.toString())                        // ENCRYPT RESPONSE DATA USING JWT (SHA - 256) ALGORITHM (createToken() => Encrypting Function)
                    res.status(200).send(token)                                                 // RESPONSE WITH ACTUAL DATA
                }   
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);                         // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])                 // IF DATA DATA IS INVALID, SENDING ERROR RESPONSE
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);                                     // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
    }
})



// DELETE AN ITEM IN CUSTOMER CART
router.get('/delete_cart_item/:input', (req, res) => {                              // ROUTER FOR DELETING ITEMS IN THE CART OF A LOGGED IN USER

    var Jwt = JSON.parse(req.params.input);                                         // GETTING CUSTOMER ACCESS TOKEN ENCRYPTED BY JWT

    try {
        var token = decodeToken(Jwt.jwt);                                               // DECODE THE ENCRYPTED TOKEN (decodeToken() => Decrypting Function)
        
        request.delete({                                                            // DELETE METHOD FOR DELETING ITEMS IN THE CUSTOMER CART
            url: magentoServerKey + '/rest/default/V1/carts/mine/items/' + Jwt.id.toString(),    // MAGENTO URL FOR DELETING ITEMS IN THE CART OF A LOGGED IN CUSTOMER (USER)
            headers: {                                                              // HEADERS
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token.toString(),
                "cache-control": "no-cache"
            },
        }, 
        function(error, response, body){
            if (response.statusCode == 200) {                                                         // If response status is 200
                try {
                    var token = createToken(body.toString())                        // ENCRYPT RESPONSE DATA USING JWT (SHA - 256) ALGORITHM (createToken() => Encrypting Function)
                    res.status(200).send(token)                                                 // RESPONSE WITH ACTUAL DATA
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);                         // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])                 // IF DATA DATA IS INVALID, SENDING ERROR RESPONSE
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);                                     // IF JWT DATA IS INVALID SENDING ERROR RESPONSE
    }
})





// GUEST CART FUNCTIONALITIES


// CREATE A GUEST CART
router.get('/create_guest_cart', (req, res) => {

    try {
        request.post({
            url: magentoServerKey + '/rest/V1/guest-carts',
            headers: { 
                "Content-Type": "application/json", 
                "cache-control": "no-cache" },
        }, 
        function(error, response, body){
            if (response.statusCode == 200) {
                try {
                    var token = createToken(body.toString())    
                    res.status(200).send(token)
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);
    }
})


// ADD ITEMS TO THE GUEST CART
router.get('/add_guest_cart_items/:input', (req, res) => {

    var Jwt = JSON.parse(req.params.input);

    try {
        var token = decodeToken(Jwt.jwt);
        
        request.post({
            url: magentoServerKey + '/rest/V1/guest-carts/' + token.toString() + '/items',
            headers: { 
                "Content-Type": "application/json", 
                "cache-control": "no-cache" 
            },
            body: JSON.stringify(Jwt.items)
        }, 
        function(error, response, body){
            if (response.statusCode == 200) {
                try {
                    var token = createToken(body.toString())    
                    res.status(200).send(token)
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);
    }
})


// GET GUEST CART ITEMS USING GUEST CART ID (TOKEN)
router.get('/get_guest_cart_items/:id', (req, res) => {

    var Jwt = req.params.id;

    try {
        var token = decodeToken(Jwt).replace(/"/g, '');
        
        request.get({
            headers: { 
                "Content-Type": "application/json", 
                "cache-control": "no-cache" 
            },
            url: magentoServerKey + '/rest/V1/guest-carts/' + token.toString() + '/items',
        }, function(error, response, body){
            if (response.statusCode == 200) {
                try {
                    var token = createToken(body.toString())
                    res.status(200).send(token)
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);
    }
});



// UPDATE QTY IN GUEST CART
router.get('/update_guest_cart_item/:input', (req, res) => {

    var Jwt = JSON.parse(req.params.input);

    try {
        var token = decodeToken(Jwt.jwt).replace(/"/g, '');
        
        request.put({  
            url: magentoServerKey + '/rest/V1/guest-carts/' + token.toString() + '/items/' + Jwt.id.toString(),
            headers: { 
                "Content-Type": "application/json",
                "cache-control": "no-cache" 
            },
            body: JSON.stringify(Jwt.items)
        }, 
        function(error, response, body){
            if (response.statusCode == 200) {
                try {
                    var token = createToken(body.toString())    
                    res.status(200).send(token)
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);
    }
})


// DELETE AN ITEM IN GUEST CART
router.get('/delete_guest_cart_item/:input', (req, res) => {

    var Jwt = JSON.parse(req.params.input);

    try {
        var token = decodeToken(Jwt.jwt).replace(/"/g, '');
        
        request.delete({
            url: magentoServerKey + '/rest/V1/guest-carts/' + token.toString() + '/items/' + Jwt.id.toString(),
            headers: { 
                "Content-Type": "application/json",
                "cache-control": "no-cache"
            },
        }, 
        function(error, response, body){
            if (response.statusCode == 200) {
                try {
                    var token = createToken(body.toString())    
                    res.status(200).send(token)
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);
    }
})





// ADDRESS FUNCTIONALITIES



router.get('/get_shipping_address/:id', (req, res) => {

    var Jwt = req.params.id;

    try {
        var token = decodeToken(Jwt);
        
        request.get({
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": "Bearer " + token,
                "cache-control": "no-cache" 
            },
            url: magentoServerKey + '/rest/V1/customers/me/shippingAddress',
        }, function(error, response, body){
            if (response.statusCode == 200) {
                try {
                    var token = createToken(body.toString())
                    res.status(200).send(token)
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);
    }
});

router.get('/get_billing_address/:id', (req, res) => {

    var Jwt = req.params.id;

    try {
        var token = decodeToken(Jwt);
        
        request.get({
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": "Bearer " + token,
                "cache-control": "no-cache" 
            },
            url: magentoServerKey + '/rest/V1/customers/me/billingAddress',
        }, function(error, response, body){
            if (response.statusCode == 200) {
                try {
                    var token = createToken(body.toString())
                    res.status(200).send(token)
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);
    }
});




// Shipping Functions


router.get('/estimate_shipping_methods/:input', (req, res) => {

    var Jwt = JSON.parse(req.params.input);

    try {
        var token = decodeToken(Jwt.jwt);
        
        request.post({
            url: magentoServerKey + '/rest/default/V1/carts/mine/estimate-shipping-methods',
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": "Bearer " + token.toString(),
                "cache-control": "no-cache" 
            },
            body: JSON.stringify(Jwt.items)
        }, 
        function(error, response, body){
            if (response.statusCode == 200) {
                try {
                    var token = createToken(body.toString())    
                    res.status(200).send(token)
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);
    }
})

router.get('/set_shipping_billing_info/:input', (req, res) => {

    var Jwt = JSON.parse(req.params.input);
 
    try {
        var token = decodeToken(Jwt.jwt);
        
        request.post({
            url: magentoServerKey + '/rest/default/V1/carts/mine/shipping-information',
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": "Bearer " + token.toString(),
                "cache-control": "no-cache" 
            },
            body: JSON.stringify(Jwt.items)
        }, 
        function(error, response, body){
            if (response.statusCode == 200) {
                try {
                    var token = createToken(body.toString())    
                    res.status(200).send(token)
                }
                catch(e) {
                    res.status(400).send(ERROR.JSON_ERROR);
                }
            }
            if(response.statusCode != 200 || error) {
                res.status(500).send(ERROR['500'])
            }
        });
    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);
    }
})







// ADMIN LOGIN ROUTER
router.get('/admin', (req, res) => {
    fs.readFile('./admin/admin.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});

// ADMIN LOGIN ROUTER TO CHECK CREDENTIALS
router.get('/admin_login/:id', (req, res) => {
    var input = JSON.parse(req.params.id);
    
    if(input.un == 'altius' && input.pw == 'altius@123') {
        var data = {
            token: createToken('altius').toString(),
            data: magentoServers
        }
        res.status(200).send(data);

    }
});

// ADMIN LOGIN ROUTER TO CHECK CREDENTIALS
router.get('/change_magento/:id', (req, res) => {
    var input = JSON.parse(req.params.id);

    try {
        var token = decodeToken(input.jwt); 
        var tmp = input.data.replace('-', '/'); 

        magentoServers.forEach(i => {
            if(i.name == tmp) {
                i.value = true
            }
            else {
                i.value = false;
            }
        })
        
        fs.writeFile('serverkey.json', JSON.stringify(magentoServers))
        magentoServer() 
        res.send('success');

    }
    catch(e) {
        res.status(400).send(ERROR.JSON_ERROR);
    }
});

// GET AND SET SECRET KEY FOR JWT
function jsonToken() {
    var data = fs.readFileSync('secretKey.txt');
    jsonSecretkey = data.toString();
}


// CREATE JWT FOR THE INPUT 
function createToken(key) {
        var token = jwt.sign({
        data: key.toString()
      }, jsonSecretkey, { expiresIn: '2d' }); // Eg: 1000, "2 days", "10h", "7d"
    return token;
}

// DECODE JWT USING THE SECRET KEY
function decodeToken(token_) {
    var decoded = jwt.verify(token_, jsonSecretkey);
    return decoded.data;
}

var magentoServers = [];
var searchApi = {};

// GET AND SET MAGENTO SERVER URL
function magentoServer() {
    
    var data = JSON.parse(fs.readFileSync('serverkey.json'));
    magentoServers = data;

    var api = JSON.parse(fs.readFileSync('searchAPI.json'));

    data.forEach(i => {
        if(i.value === true) {
            magentoServerKey = 'http://' + i.name.toString();
            console.log('Current Magento server is ' + magentoServerKey);


            api.forEach(j => {
                if(j.name == i.name) {
                    searchApi = {"api_1": j.api_1, "api_2": j.api_2};
                    console.log('Current search API is ' + JSON.stringify(searchApi));
                }   
            })
        }
    })
}

function wr() {
   
}


// CALLING THE FUNCTIONS AFTER THE NODE JS SERVER STARTS RUNNING
jsonToken();
magentoServer();


module.exports = router;