var express = require('express');
var router = express();
var request = require('request');
var fs = require('fs');
var jwt = require('jsonwebtoken');
//var soap = require('soap');
var url = "./plantdata.wsdl";
var jsonSecretkey;


var ERROR = {
    JSON_ERROR: "USER SESSION IS INVALID", // 400
    '401': "INVALID CREDENTIALS", // HTTP_UNAUTHORIZED
    '403': "ACCESS DENIED", // HTTP_FORBIDDEN
    '404': "RESOURCE NOT FOUND", // HTTP_NOT_FOUND
    '405': "YOU'RE NOT ALLOWED TO ACCESS THIS RESOURCE", // HTTP_METHOD_NOT_ALLOWED
    '406': "THE REQUEST IS NOT ACCEPTABLE", // HTTP_NOT_ACCEPTABLE
    '500': "RESOURCE INTERNAL ERROR", // HTTP_INTERNAL_ERROR
    CUSTOM_ERROR: "IT'S NOT YOU, IT'S US. SORRY FOR THE INCONVENIENCE" // CUSTOM ERROR - 400
}



// Post Data
router.get('/getData', (req, res) => {

    request('http://192.168.0.48:8080/Jasani/api/Product/getallcategories', function (error, response, body) {
        if (response.statusCode == 200) {
            // console.log(body)
            res.status(200).json(JSON.parse(body))
        }
        if (response.statusCode != 200 || error) {
            res.status(500).json({
                msg: ERROR.CUSTOM_ERROR
            })
        }
    })
});


router.post('/postData', (req, res) => {

    request.post({
            url: 'http://13.232.239.52:8090/rest/V1/products',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer r63z1sfkbwiogy33pjoh2d1atyybfbns",
                "cache-control": "no-cache"
            },
            body: JSON.stringify(req.body),
        },
        function (error, response, body) {
            console.log(response)
            if (response.statusCode == 200) {
                res.status(200).send(JSON.parse(body))
            }
            if (response.statusCode != 200 || error) {
                res.status(401).send(ERROR['401'])
            }
        });
})


router.post('/postArrayofProducts', (req, res) => {

    request.post({
            url: 'http://13.232.239.52:8090/rest/V1/inventory/source-items',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer r63z1sfkbwiogy33pjoh2d1atyybfbns",
                "cache-control": "no-cache"
            },
            body: JSON.stringify(req.body),
        },
        function (error, response, body) {
            if (response.statusCode == 200) {
                res.status(200).send(JSON.parse(body))
            }
            if (response.statusCode != 200 || error) {
                res.status(401).send(ERROR['401'])
            }
        });
})

module.exports = router;