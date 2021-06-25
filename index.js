const express = require('express');
const nodemailer = require('nodemailer');
const nodemon = require('nodemon');
const fetch = require('node-fetch');
const ejs = require('ejs');
var fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.static("C:/Rerouted/views/styles.css"));

const link = 'https://752fa5ab548b2853ffff1fdccc5e1be2:c06eaec5f0217effc29509fe2f4d90a5@rerouted-co-op.myshopify.com/admin/api/2021-04/orders.json'; //shopify 'order' api key. Use fetch to access

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
      ejs.renderFile('C:/Rerouted/views/index.ejs', data, function (err, ejs) { //reads over the empty template and injects the data into the template. Then calls callback function to send finished template
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
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}



app.post('/webhook/order', async (req, res) => {
    const body = await req.body;
    const customer = body.customer;
    const customerAddress = body.billing_address;
    
    var data = { //sets all the important info we need to inject into the email template
        name: customer.first_name,
        street: customerAddress.address1,
        city: customerAddress.city,
        state: customerAddress.province,
        zip: customerAddress.zip,
        customerEmail: customer.email,
        sellerEmail: body.line_items.vendor,
        address2: ''
    };

    if (customerAddress.address2 != "") {data.address2 = customerAddress.address2;} //sets an address2 if there is an address2

    res.render('index.ejs', data)

    //res.status(200).send('post request received').end();
    
    sendEmail(data);

})

/*Current problems/questions:
How do we create a new html <p> for address 2 if there is one?
image/attachments not working with nodemail but I suspect that has to do with my localhost server not being able to handle it
What's the host if we're running the app on our own web server?
*/






