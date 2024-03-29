const express = require('express');
const nodemailer = require('nodemailer');
const nodemon = require('nodemon');
const fetch = require('node-fetch');
const ejs = require('ejs');
var fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.use(express.json())

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
      ejs.renderFile('C:/Rerouted/views/received.ejs', data, function (err, ejs) { //reads over the empty template and injects the data into the template. Then calls callback function to send finished template
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: 'support@rerouted.co',
                to: 'data.sellerEmail',
                subject: "We've received your item upload!",
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

app.post('/webhook/upload', async (req, res) => {
    const body = await req.body;
    var data = {
        sellerEmail: body.vendor,
    }

    sendEmail(data);

    res.status(200).end()
})

/*Potential problems/questions:
*/