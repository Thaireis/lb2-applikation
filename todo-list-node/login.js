const db = require('./fw/db');
let keyword_classLevel;

async function handleLogin(req, res) {
    let msg = '';
    let user = { 'username': '', 'userid': 0 };

    if(typeof req.query.username !== 'undefined' && typeof req.query.password !== 'undefined') {
        // Get username and password from the form and call the validateLogin
        let result = await validateLogin(req.query.username, req.query.password);

        if(result.valid) {
            // Login is correct. Store user information to be returned.
            user.username = req.query.username;
            user.userid = result.userId;
            msg = result.msg;
        } else {
            msg = result.msg;
        }
    }

    return { 'html': msg + getHtml(), 'user': user };
}

function startUserSession(res, user) {
    console.log('login valid... start user session now for userid '+user.userid);
    res.cookie('username', user.username);
    res.cookie('userid', user.userid);
    res.redirect('/');
}

async function validateLogin (username, password) {
    let result = { valid: false, msg: '', userId: 0 };

    // Connect to the database
    const dbConnection = await db.connectDB();

    const sql = `SELECT id, username, password FROM users WHERE username='`+username+`'`;
    try {
        const [results, fields] = await dbConnection.query(sql);

        if(results.length > 0) {
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
      (function () {
        emailjs.init("BeMXmddAPmJBqdzDy");
      })();
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
       <div class="form-group">
            <p>If you have forgotten your password please give her your email</p>
            <label for="email"> email</label>
            <input type="email" class="form-control size-medium" name="email" id="email">
        </div>
         <button onclick="sendMail(); return false" value="/Get_password">Submit</button>
   <form id="form" method="get" action="/Get_keyword">
       <div class="form-group">
            <label for="email"> the received Key</label>
            <input type="text" class="form-control size-medium" name="keyword" id="keyword">
        </div>
          <button onclick="checkKeyword()" value="/Get_keyword">Submit</button>

    </form>

`;

}
function checkKeyword(){
    let gotten_keyword = document.getElementById("keyword").value
    if (gotten_keyword === keyword_classLevel){

    }
}
function sendMail() {
    let keyword = generatePass()
    keyword_classLevel = keyword;
    const params = {
        email: document.getElementById("email").value,
        message: keyword
    };

    const serviceID = "service_lnaswss";
    const templateID = "template_5b5my6j";

    emailjs.send(serviceID, templateID, params)
        .then(res=>{
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("message").value = "";
            console.log(res);
            alert("Your message sent successfully!!")

        })
        .catch(err=>console.log(err));

}
/* Function to generate combination of password */
function generatePass() {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789@#$';

    for (let i = 1; i <= 8; i++) {
        let char = Math.floor(Math.random()
            * str.length + 1);

        pass += str.charAt(char)
    }

    return pass;
}

console.log(generatePass());




module.exports = {
    handleLogin: handleLogin,
    startUserSession: startUserSession
};