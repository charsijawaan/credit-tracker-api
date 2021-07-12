// Imports
var express = require("express");
var path = require('path');
var multer = require('multer');
var fastcsv = require("fast-csv");
var fs = require("fs");
var nodemailer = require('nodemailer');
var db = require("./database/dbQueries");

// Init Express app
var app = express();

// Middlewares
app.use(express.static('uploads'))
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Multer Settings
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
var upload = multer({ storage: storage, limits: { fieldSize: 2 * 1024 * 1024 }})


// Routes

// Test Route
app.get("/", (req, res) => {
    res.send("Server is Up and Running")
});


app.post("/check_login", async (req, res) => {

    var { username, password } = req.body;

    try {
        var user = await db.checkLogin(username, password);
        user = user.map(v => Object.assign({}, v));
        res.send({
            status: 100,
            user: JSON.stringify(user[0])
        });
    }
    catch(error) {
        console.log(error);
        res.send({
            status: 400,
        });
    }

});


app.post("/create_employee", async (req, res) => {

    var { firstName, lastName, contactNumber, townCity, username, password } = req.body;

    try {
        await db.createEmployee(firstName, lastName, contactNumber, townCity, username, password);
        res.send({
            status: 100
        });
    }
    catch(error) {
        console.log(error);
        res.send({
            status: 400
        });
    }
    
});


app.post("/add_customer", async (req, res) => {

    var { firstName, lastName, contactNumber, addressOne, addressTwo, townCity, customerDetails, isBlocked } = req.body;

    if(isBlocked === true) {
        isBlocked = "true";
    }
    else if(isBlocked === false) {
        isBlocked = "false";
    }

    try {
        await db.addCustomer(firstName, lastName, contactNumber, addressOne, addressTwo, townCity, 0, customerDetails, isBlocked);
        res.send({
            status: 100
        });
    }
    catch(error) {
        console.log(error);
        res.send({
            status: 400
        });
    }
});

app.post("/get_all_customers", async (req, res) => {
    try {
        let customers = await db.getAllCustomers();
        res.send({
            status: 100,
            customers: customers
        });
    }
    catch(error) {
        console.log(error);
        res.send({
            status: 400
        });
    }
});

app.post("/increase_customer_credit", upload.single("image"), async (req, res) => {

    var { customer_id, increase_amount, decrease_amount, changed_by_id, date, auth_name } = req.body;    

    try {
        var customer = await db.getCustomerByID(customer_id);
        var creditBeforeUpdate = customer[0].customer_credit;
        
        var credit_after_update = Number(creditBeforeUpdate) + Number(increase_amount);
    
        await db.insertIntoTransactions(customer_id, increase_amount, decrease_amount, changed_by_id, date, credit_after_update, req.file.originalname, auth_name);        
        await db.updateCreditInCustomersTable(credit_after_update, customer_id);

        // if(Number(credit_after_update) === 0) {
        //     await db.updateCustomerArchiveStatus("true", customer_id);
        // }
        
        res.send({
            status: 100,
            newCredit: credit_after_update
        });
    }
    catch(error) {
        console.log(error);
        res.send({
            status: 400
        });
    }

});

app.post("/decrease_customer_credit", upload.single("image"), async (req, res) => {

    var { customer_id, increase_amount, decrease_amount, changed_by_id, date, auth_name } = req.body;

    try {
        var customer = await db.getCustomerByID(customer_id);
        var creditBeforeUpdate = customer[0].customer_credit;
        
        var credit_after_update = Number(creditBeforeUpdate) - Number(decrease_amount);
    
        await db.insertIntoTransactions(customer_id, increase_amount, decrease_amount, changed_by_id, date, credit_after_update, req.file.originalname, auth_name);        
        await db.updateCreditInCustomersTable(credit_after_update, customer_id);

        // if(Number(credit_after_update) === 0) {
        //     await db.updateCustomerArchiveStatus("true", customer_id);
        // }

        res.send({
            status: 100,
            newCredit: credit_after_update
        });
    }
    catch(error) {
        console.log(error);
        res.send({
            status: 400
        });
    }

});

app.post("/search_customer_by_name", async (req, res) => {
    var name = req.body.name;
    var customers = await db.getCustomersByNameLike(name);
    res.send({
        customers: customers
    });
});

app.post("/search_customer_by_phone", async (req, res) => {
    var phone = req.body.phone;
    var customers = await db.getCustomersByPhoneLike(phone);
    res.send({
        customers: customers
    });
});

app.post("/update_blocked_and_archived", async (req, res) => {

    var { customer_id, is_blocked, is_archived } = req.body;

    if(is_blocked === true) {
        is_blocked = "true";
    }
    else if(is_blocked === false){
        is_blocked = "false";
    }

    if(is_archived === true) {
        is_archived = "true";
    }
    else if(is_archived === false){
        is_archived = "false";
    }

    try {
        await db.updateBlockedAndArchived(customer_id, is_blocked, is_archived);
        res.send({
            status: 100
        });
    }
    catch(error) {
        console.log(error);
        res.send({
            status: 400
        });
    }
    
});

app.post("/generate_csv_file", async (req, res) => {

    var customer_id = req.body.customer_id;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var baseURL = req.protocol + '://' + req.get('host');

    try {
        var data = await db.getTransactionsByCustomerID(customer_id, startDate, endDate);

        for(var i = 0; i < data.length; i++)
            data[i].receipt = baseURL + "/" + data[i].receipt;

        var fileName = "temp_" + Date.now() + ".csv";
    
        var ws = fs.createWriteStream(path.join("uploads", fileName));
    
        var jsonData = JSON.parse(JSON.stringify(data));
    
        fastcsv.write(jsonData, {headers: true}).on("end", () => {
            res.send({
                status: 100,
                fileName: fileName
            });
        }).pipe(ws);
    }
    catch(error) {
        console.log(error);
        res.send({
            status: 400
        });
    }

});


app.post("/send_csv_file", async (req, res) => {

    var customer_id = req.body.customer_id;
    var email = req.body.email;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    var baseURL = req.protocol + '://' + req.get('host');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'shakeelusama3@gmail.com',
          pass: 'Createyour2'
        }
    });

    try {
        var data = await db.getTransactionsByCustomerID(customer_id, startDate, endDate);

        for(var i = 0; i < data.length; i++)
            data[i].receipt = baseURL + "/" + data[i].receipt;

        var fileName = "temp_" + Date.now() + ".csv";
    
        var ws = fs.createWriteStream(path.join("uploads", fileName));
    
        var jsonData = JSON.parse(JSON.stringify(data));
    
        fastcsv.write(jsonData, {headers: true}).on("end", () => {

            var mailOptions = {
                from: 'shakeelusama3@gmail.com',
                to: email,
                subject: 'CSV File',
                attachments: [
                    {
                        filename: fileName,
                        path: path.join("uploads", fileName)
                    }
                ]
            };      

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                    res.send({
                        status: 100,
                    });
                }
            });
        }).pipe(ws);
    }
    catch(error) {
        console.log(error);
        res.send({
            status: 400
        });
    }

})

// Start Server
app.listen(process.env.PORT || 3000, () => {
    console.log("Server Started");
})