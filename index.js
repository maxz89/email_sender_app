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

//const link = 'https://752fa5ab548b2853ffff1fdccc5e1be2:c06eaec5f0217effc29509fe2f4d90a5@rerouted-co-op.myshopify.com/admin/api/2021-04/orders.json'; //shopify 'order' api key. Use fetch to access

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
                from: 'support@rerouted.co',
                to: 'max@rerouted.co',
                // to: 'data.sellerEmail',
                subject: "Congrats! You've sold an item on Rerouted!",
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


//this handles webhook posts from shopify whenever a seller sells an item, and sends an email to the seller with shipping and payment info
app.post('/webhook/order', async (req, res) => {
    const body = await req.body;
    var lineItems = body.line_items;
    const customer = body.customer;
    const customerAddress = body.billing_address;

    //console.log(body.line_items);
    if (lineItems.length = 1) //if there is only one item this order... then we just send one email by calling the sendEmail function once
    {
        var data = { //sets all the important info we need to inject into the email template
            name: customer.first_name,
            street: customerAddress.address1,
            city: customerAddress.city,
            state: customerAddress.province,
            zip: customerAddress.zip,
            customerEmail: customer.email,
            sellerEmail: lineItems.vendor,
            address2: '',
            itemName: lineItems[i].name
        };

        if (customerAddress.address2 != "") {data.address2 = customerAddress.address2;} //sets an address2 if there is an address2        
        if (data.customerEmail == null) {data.customerEmail = body.contact_email;}
        sendEmail(data); //passess data from shopify to our email template to send
    }

    else if (lineItems.length > 1) //if there are more than one item this order...
    {
        for (var i = 0; i < lineItems.length; i++) //iterate through each item in the order
        {
            var emails = []; //temporary array for items with the same seller
            var duplicate = false; //boolean for whether this item's seller sold another item within this order
            for (var j = i + 1; j < lineItems.length; j++) //iterates through rest of items this order to compare to the initial item
            {
                if (lineItems[i].vendor == lineItems[j].vendor) //if the two items are from the same seller...
                {
                    duplicate = true;
                    emails.push(j); //adding same seller items to temporary array
                }
            }

            if (duplicate) //process for handling data if this item shares the same seller with other items in this order
            {
                emails.push(i); //adding same seller items to temp array
                var str = emails[0]; 
                for (var k = 1; k < emails.length; k++) //linking together item names for itemName property
                {
                    str += ` and your ${emails[k]}`;  
                }
                var data = { //sets all the important info we need to inject into the email template
                    name: customer.first_name,
                    street: customerAddress.address1,
                    city: customerAddress.city,
                    state: customerAddress.province,
                    zip: customerAddress.zip,
                    customerEmail: customer.email,
                    sellerEmail: lineItems[i].vendor, //only sends one email to this seller
                    address2: '',
                    itemName: str 
                };
        
                if (customerAddress.address2 != "") {data.address2 = customerAddress.address2;} //sets an address2 if there is an address2        
                if (data.customerEmail == null) {data.customerEmail = body.contact_email;}
                sendEmail(data);
                for (var l = 0; l < emails.length; l++) //deleting all items with same seller so that they aren't detected later in the loop
                {
                    delete lineItems[l];  
                }
            }

            else //process for handling data if this item has a unique seller
            {   
                var data = { //sets all the important info we need to inject into the email template
                    name: customer.first_name,
                    street: customerAddress.address1,
                    city: customerAddress.city,
                    state: customerAddress.province,
                    zip: customerAddress.zip,
                    customerEmail: customer.email,
                    sellerEmail: lineItems[i].vendor,
                    address2: '',
                    itemName: lineItems[i].name
                };
        
                if (customerAddress.address2 != "") {data.address2 = customerAddress.address2;} //sets an address2 if there is an address2        
                if (data.customerEmail == null) {data.customerEmail = body.contact_email;}
                sendEmail(data); 
                delete lineItems[i];  
            }


        }
    }
    else {console.log("Error: line items less than 1");}
})

/*Current problems/questions:
*/







//testing onlyl!!

app.get('/', async (req, res) => {
    const link = 'https://752fa5ab548b2853ffff1fdccc5e1be2:c06eaec5f0217effc29509fe2f4d90a5@rerouted-co-op.myshopify.com/admin/api/2021-04/orders.json';
    const json = await fetch(link);
    var x = await json.json();
    const orders = x.orders;
    const body = orders[13];
    //const body = await req.body;
    //console.log(orders[13].line_items);
    const lineItems = body.line_items;
    //console.log(lineItems);
    
    const customer = body.customer;
    const customerAddress = body.billing_address;

    if (lineItems.length == 1) //if there is only one item this order... then we just send one email by calling the sendEmail function once
    {
        var data = { //sets all the important info we need to inject into the email template
            name: customer.first_name,
            street: customerAddress.address1,
            city: customerAddress.city,
            state: customerAddress.province,
            zip: customerAddress.zip,
            customerEmail: customer.email,
            sellerEmail: lineItems.vendor,
            address2: '',
            itemName: lineItems[0].name
        };

        if (customerAddress.address2 != "") {data.address2 = customerAddress.address2;} //sets an address2 if there is an address2        
        
        sendEmail(data); //passess data from shopify to our email template to send
    }
    
    else if (lineItems.length > 1) //if there are more than one item this order...
    {
        for (var i = 0; i < lineItems.length; i++) //iterate through each item
        {
            var emails = []; //temporary array for items with the same seller
            var duplicate = false; //boolean for whether this item's seller sold another item within this order
            for (var j = i + 1; j < lineItems.length; j++) //iterates through rest of items this order to compare to the initial item
            {
                if (lineItems[i].vendor == lineItems[j].vendor) //if the two items are from the same seller...
                {
                    duplicate = true;
                    emails.push(j); //adding same seller items to temporary array
                }
            }

            if (duplicate) //process for handling data if this item shares the same seller with other items in this order
            {
                emails.push(i); //adding same seller items to temp array
                var str = emails[0]; 
                for (var k = 1; k < emails.length; k++) //linking together item names for itemName property
                {
                    str += ` and your ${emails[k]}`;  
                }
                var data = { //sets all the important info we need to inject into the email template
                    name: customer.first_name,
                    street: customerAddress.address1,
                    city: customerAddress.city,
                    state: customerAddress.province,
                    zip: customerAddress.zip,
                    customerEmail: customer.email,
                    sellerEmail: lineItems[i].vendor, //only sends one email to this seller
                    address2: '',
                    itemName: str 
                };
        
                if (customerAddress.address2 != "") {data.address2 = customerAddress.address2;} //sets an address2 if there is an address2        
                
                sendEmail(data);
            }

            else //process for handling data if this item has a unique seller
            {   
                var data = { //sets all the important info we need to inject into the email template
                    name: customer.first_name,
                    street: customerAddress.address1,
                    city: customerAddress.city,
                    state: customerAddress.province,
                    zip: customerAddress.zip,
                    customerEmail: customer.email,
                    sellerEmail: lineItems[i].vendor,
                    address2: '',
                    itemName: lineItems[i].name
                };
        
                if (customerAddress.address2 != "") {data.address2 = customerAddress.address2;} //sets an address2 if there is an address2        
                
                sendEmail(data);   
            }


        }
    }
})

/*Current problems/questions:
*/