const express = require('express');
const nodemailer = require('nodemailer');
const nodemon = require('nodemon');
const fetch = require('node-fetch');
const ejs = require('ejs');
var fs = require('fs');
var cors = require('cors')

const app = express();

app.use(cors())
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.static('public'));

app.listen(3000, () => {console.log('app listening on port 3000')});

/*sendEmail() takes in data like shipping address, customer name, etc from the webhook and injects the data into email template. Then sends template with data to specified user*/
async function sendEmail(data) {

    /*establishes information of the account/host we send the email from */
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'jeromy78@ethereal.email', 
            pass: 'cwejPd8rNDWHfpvwqQ'
            }
        });

        /*injects data into the template and */
      ejs.renderFile('C:/Rerouted/views/lowerPrice.ejs', data, function (err, ejs) { //reads over the empty template and injects the data into the template. Then calls callback function to send finished template
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: 'support@rerouted.co',
                to: 'data.sellerEmail',
                subject: "Sell your gear faster!",
                html: ejs //ejs template with data injected
            };
            console.log("html data ======================>", mainOptions.html);
            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });
        }
    });
}

const baseKey = "https://86d0f10d14f5f92813ef0cfca88c4718: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@rerouted-co-op.myshopify.com/admin/api/2021-07/products.json";


setInterval( async () => {
    var apiKey = getApiKey()
    const json = await fetch(apiKey);
    const temp = await json.json();
    const products = temp.products

    for (var i = 0; i < products.length; i++) {
        var item = products[i];
        var priceStr = item.variants[0].price;
        var discounted = parseInt(priceStr) * 0.9;

        var pageUrl = `https://inventory.reroutedcoop.com/discountProduct.php?pid=${item.variants[0].id}&price=${discounted}`;

        data = {
            sellerEmail: item.vendor,
            variantId: item.variants[0].id,
            productName: item.title,
            productPrice: priceStr,
            discountedPrice: discounted,
            page: pageUrl
        }

        sendEmail(data);
    }
}, 86400000);




function getApiKey() { //creates the filtered shopify API key to grab all products published 2 weeks ago
    minDate = getMinDate();
    maxDate = getMaxDate();
    return `https://86d0f10d14f5f92813ef0cfca88c4718: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@rerouted-co-op.myshopify.com/admin/api/2021-07/products.json?published_at_min=${minDate}&published_at_max=${maxDate}`
}

function getMinDate() { //finds the 2-week-ago min date to filter shopify API

    var d = new Date();

    d.setDate(d.getDate() - 14);

    d = d.toISOString();

    var minDate = d.substring(0, 11) + "00:00:00-06:00";

    return minDate;
}

function getMaxDate() { //finds the 2-week-ago max date to filter shopify API
    var d = new Date();

    d.setDate(d.getDate() - 13);

    d = d.toISOString();

    var maxDate = d.substring(0, 11) + "00:00:00-06:00";

    return maxDate;
}


/*Code for updating price after user clicks button but not needed after Carter's API */
// app.put("/lowerPrice", (req, res) => {
//     var body = req.body;
//     const id = body.id;
//     changePrice(id, "50.0")
//     res.send("success").end();
// })

// app.get("/lowerPrice", (req, res) => {
//     console.log("heyyy");
//     res.send("success").end();
// })
// function changePrice(productId, newPrice){
//     var id = "40244911833282";
//     var data = {
//         "variant": {
//           "id": productId,
//           "price": newPrice
//         }
//       }
//     var key = `https://86d0f10d14f5f92813ef0cfca88c4718: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@rerouted-co-op.myshopify.com/admin/api/2021-07/variants/${id}.json`;
//     fetch(key, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       })
//     console.log("finished");
// }
