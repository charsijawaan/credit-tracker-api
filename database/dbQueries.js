let conn = require("./connection");

module.exports = {

    checkLogin: (username, password) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `SELECT * FROM users WHERE username = ? AND password = ?`;
            conn.query(sqlQuery, [username, password], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    createEmployee: (firstName, lastName, contactNumber, townCity, username, password) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `INSERT INTO users(first_name, last_name, contact_number, city, username, password, user_type) VALUES(?,?,?,?,?,?,?)`;
            conn.query(sqlQuery, [firstName, lastName, contactNumber, townCity, username, password, 'employee'], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    addCustomer: (firstName, lastName, contactNumber, addressOne, addressTwo, townCity, credit, customerDetails, isBlocked) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `INSERT INTO customers(first_name, last_name, contact_number, address_one, address_two, town_city, customer_credit, customer_details, is_blocked)
                            VALUES(?,?,?,?,?,?,?,?,?)`;
            conn.query(sqlQuery, [firstName, lastName, contactNumber, addressOne, addressTwo, townCity, credit, customerDetails, isBlocked], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    getAllCustomers: () => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `SELECT * FROM customers`;
            conn.query(sqlQuery, [], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    getCustomerByID: (customer_id) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `SELECT * FROM customers WHERE customer_id = ?`;
            conn.query(sqlQuery, [customer_id], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    insertIntoTransactions: (customer_id, increase_amount, decrease_amount, changed_by_id, date, credit_after_update, receipt, auth_name) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `INSERT INTO transactions(customer_id, increase_amount, decrease_amount, changed_by_id, date, credit_after_update, receipt, auth_name) VALUES(?,?,?,?,?,?,?,?)`;
            conn.query(sqlQuery, [customer_id, increase_amount, decrease_amount, changed_by_id, date, credit_after_update, receipt, auth_name], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    updateCreditInCustomersTable: (customer_credit, customer_id) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `UPDATE customers SET customer_credit = ? WHERE customer_id = ?`;
            conn.query(sqlQuery, [customer_credit, customer_id], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    getCustomersByNameLike: (name) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `SELECT * FROM customers WHERE first_name LIKE '${name}%' OR last_name LIKE '${name}%'`;
            conn.query(sqlQuery, [], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    getCustomersByPhoneLike: (phone) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `SELECT * FROM customers WHERE contact_number LIKE '${phone}%'`;
            conn.query(sqlQuery, [], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    updateBlockedAndArchived: (customer_id, is_blocked, is_archived) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `UPDATE customers SET is_blocked = ?, is_archived = ? WHERE customer_id = ?`;
            conn.query(sqlQuery, [is_blocked, is_archived, customer_id], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    getTransactionsByCustomerID: (customer_id, startDate, endDate) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `SELECT transactions.transaction_id, CONCAT(customers.first_name, " ", customers.last_name) AS customer_name, 
            transactions.increase_amount, transactions.decrease_amount, transactions.credit_after_update, 
            DATE_FORMAT(transactions.date, "%Y-%m-%d::%H:%i") AS transaction_date, transactions.receipt, 
            CONCAT(users.first_name, " ", users.last_name) AS processed_by , transactions.auth_name FROM transactions 
            INNER JOIN customers ON transactions.customer_id = customers.customer_id INNER JOIN users ON 
            transactions.changed_by_id = users.user_id WHERE transactions.customer_id = ? AND 
            DATE_FORMAT(transactions.date, "%Y-%m-%d") >= ? AND DATE_FORMAT(transactions.date, "%Y-%m-%d") <= ?`;
            conn.query(sqlQuery, [customer_id, startDate, endDate], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

    updateCustomerArchiveStatus: (is_archived, customer_id) => {
        return new Promise((resolve, reject) => {
            let sqlQuery = `UPDATE customers SET is_archived = ? WHERE customer_id = ?`;
            conn.query(sqlQuery, [is_archived, customer_id], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            })
        });
    },

};