const express = require('express');
const nodemailer = require('nodemailer');
const nodemon = require('nodemon');
const fetch = require('node-fetch');
const ejs = require('ejs');
var fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.use(express.json())

const link = 'https://752fa5ab548b2853ffff1fdccc5e1be2:c06eaec5f0217effc29509fe2f4d90a5@rerouted-co-op.myshopify.com/admin/api/2021-04/orders.json';

app.listen(3000, () => {console.log('app listening on port 3000')});

async function sendEmail(data) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'jeromy78@ethereal.email',
            pass: 'cwejPd8rNDWHfpvwqQ'
            }
        });


      ejs.renderFile('C:/Rerouted/views/index.ejs', data, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: 'max@rerouted.co',
                to: 'max@rerouted.co',
                // to: 'data.sellerEmail',
                subject: "Congrats! You've sold an item on Rerouted!",
                // attachments: [{
                //     filename: 'rerouted-compact-RGB-reverse-black-large.png',
                //     path: 'C:/Rerouted/views/rerouted-compact-RGB-reverse-black-large.png',
                //     content: fs.createReadStream('C:/Rerouted/views/rerouted-compact-RGB-reverse-black-large.png'),
                //     //cid: 'unique@nodemailer.com'
                // }],
                html: data
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
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}



app.post('/webhook/order', async (req, res) => {
    const body = await req.body;
    const customer = body.customer;
    const customerAddress = body.billing_address;
    
    var data = {
        name: customer.first_name,
        street: customerAddress.address1,
        city: customerAddress.city,
        state: customerAddress.province,
        zip: customerAddress.zip,
        customerEmail: customer.email,
        sellerEmail: body.line_items.vendor
    };

    if (customerAddress.address2 != "") {data.address2 = customerAddress.address2;}

    res.render('index.ejs', data)

    //res.status(200).send('post request received').end();
    
    sendEmail(data);

})






