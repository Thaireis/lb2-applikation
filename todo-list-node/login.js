const db = require('./fw/db');
let keyword_classLevel;

async function handleLogin(req, res) {
    let msg = '';
    let user = {'username': '', 'userid': 0};

    if (typeof req.query.username !== 'undefined' && typeof req.query.password !== 'undefined') {
        // Get username and password from the form and call the validateLogin
        let result = await validateLogin(req.query.username, req.query.password);

        validatePasswordReset(req.query.password);

        if (result.valid) {
            // Login is correct. Store user information to be returned.
            user.username = req.query.username;
            user.userid = result.userId;
            msg = result.msg;
        } else {
            msg = result.msg;
        }
    }

    return {'html': msg + getHtml(), 'user': user};
}

function startUserSession(res, user) {
    console.log('login valid... start user session now for userid ' + user.userid);
    res.cookie('username', user.username);
    res.cookie('userid', user.userid);
    res.redirect('/');
}

async function validateLogin(username, password) {
    let result = {valid: false, msg: '', userId: 0};

    // Connect to the database
    const dbConnection = await db.connectDB();

    const sql = `SELECT id, username, password
                 FROM users
                 WHERE username = '` + username + `'`;
    try {
        const [results, fields] = await dbConnection.query(sql);

        if (results.length > 0) {
            // Bind the result variables
            let db_id = results[0].id;
            let db_username = results[0].username;
            let db_password = results[0].password;

            // Verify the password
            if (password == db_password) {
                result.userId = db_id;
                result.valid = true;
                result.msg = 'login correct';
            } else {
                // Password is incorrect
                result.msg = 'Incorrect password';
            }
        } else {
            // Username does not exist
            result.msg = 'Username does not exist';
        }

        console.log(results); // results contains rows returned by server
        //console.log(fields); // fields contains extra meta data about results, if available
    } catch (err) {
        console.log(err);
    }

    return result;
}

function getHtml() {
    return `
   <script
      type="text/javascript"
      src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"
    ></script>
    <script type="text/javascript">
    </script>
    <h2>Login</h2>

    <form id="form" method="get" action="/login">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username">
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="text" class="form-control size-medium" name="password" id="password">
        </div>
        <div class="form-group">
            <label for="submit" ></label>
            <input id="submit" type="submit" class="btn size-auto" value="Login" />
        </div>
    </form>
    
    
   <form id="form" method="post" action="/resetPassword">
        <div class="form-group">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" class="form-control size-medium" name="username" id="username">
            </div>
            <div class="form-group">
                <label for="new_password">New Password</label>
                <input type="text" class="form-control size-medium" name="new_password" id="new_password">
            </div>
            <div class="form-group">
                <label for="verify_password">Verify Password</label>
                <input type="text" class="form-control size-medium" name="verify_password" id="verify_password">
            </div>
            <div class="form-group">
                <label for="submit" ></label>
                <input id="submit" type="submit" class="btn size-auto" value="Reset" />
            </div>
        </div>
   </form>
`;
}

async function validatePasswordReset(old_password, new_password) {

    const dbConnection = await db.connectDB();

    const sql = `UPDATE users
                 SET password = new_password
                 FROM users
                 WHERE username = '` + username + ` '`;

    try {
        const results = await dbConnection.executeSql(sql);

        if (results.length > 0) {
            // Bind the result variables
            let db_id = results[0].id;
            let db_username = results[0].username;
            let db_password = results[0].password;

            // Verify the password
            if (new_password === verify_password) {
                result.userId = db_id;
                result.valid = true;
                result.msg = 'login correct';
            } else {
                // Password is incorrect
                result.msg = 'Incorrect password';
            }
        } else {
            // Username does not exist
            result.msg = 'Username does not exist';
        }

        console.log(results); // results contains rows returned by server
        //console.log(fields); // fields contains extra meta data about results, if available
    } catch (err) {
        console.log(err);
    }

    return result;
}

/* Function to generate combination of password */
function generatePass() {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz0123456789@#$';

    for (let i = 1; i <= 8; i++) {
        let char = Math.floor(Math.random() * str.length + 1);

        pass += str.charAt(char)
    }

    return pass;
}

console.log(generatePass());


module.exports = {
    handleLogin: handleLogin, startUserSession: startUserSession
};