//////////////////////////////////
// Dependencies
/////////////////////////////////
// get .env variables
require("dotenv").config()
// pull PORT from .env, give it a default of 3000 (object destructuring)
const {PORT = 3001, DATABASE_URL} = process.env
// import express
const express = require("express")
// create the application object
const app = express()

// import mongoose
const mongoose = require("mongoose")

// import middleware
const cors = require("cors")
const morgan = require("morgan")

/////////////////////////////////
//Middleware
//////////////////////////////////
app.use(cors()) // prevent cors errors, opens up access for frontend
app.use(morgan("dev")) //logging
app.use(express.json()) // parse json bodies

//////////////////////////////
// Environment
//////////////////////////////
const config = { 
    apiBaseUrl: process.env.API_BASE_URL, 
    oauth2BaseUrl: process.env.OAUTH2_BASE_URL, 
    clientId: process.env.CLIENT_ID, 
    redirectUrl: process.env.REDIRECT_URL,
    clientSecret: process.env.CLIENT_SECRET
}

/////////////////////////////////
// Database Connection
////////////////////////////////
// establish connection
mongoose.connect(DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

// Connection Events
mongoose.connection
.on("open", () => console.log("You are connected to Mongo"))
.on("close", () => console.log("You are disconnected from Mongo"))
.on("error", (error) => console.log(error))

//////////////////////////////
// Models
//////////////////////////////
// the user schema
const UserSchema = new mongoose.Schema({
    authCode: String
}, {timestamps: true})

const Users = mongoose.model("Users", UserSchema)

// the product schema
const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    department: String,
    aisle: String,
    image: String,
    location: String
}, {timestamps: true})

const Products = mongoose.model("Products", ProductSchema)

////////////////////////////////
// Authorization
////////////////////////////////
// Authorization code redirect initiated by 'login' event from Sign In button
function redirectToLogin() {
    // Must define all scopes needed for application
    const scope = encodeURIComponent('product.compact cart.basic:write profile.compact');
    // Build authorization URL
    const url =
        // Base URL (https://api.kroger.com/v1/connect/oauth2)
        `${config.oauth2BaseUrl}/authorize?` +
        // ClientId (specified in .env file)
        `client_id=${encodeURIComponent(config.clientId)}` +
        // Pre-configured redirect URL (http://localhost:3000/callback)
        `&redirect_uri=${encodeURIComponent(config.redirectUrl)}` +
        // Grant type
        `&response_type=code` +
        // Scope specified above
        `&scope=${scope}`;
    // Browser redirects to the OAuth2 /authorize page
    // window.location.href = url;
    return url
}

async function authorize() {

    let headersList = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded"
    }
   
    await fetch(redirectToLogin(), { 
        method: "GET",
        headers: headersList
    }).then(function(response) {
        return response.text();
    }).then(function(data) {
        console.log(data);
    })
}

////////////////////////////////
// Routes
////////////////////////////////
// create a test route
app.get("/", (req, res) => {
    res.redirect(redirectToLogin())
})

app.get('/test', (req, res) => {
    const authCode = req.originalUrl.slice(req.originalUrl.indexOf('=')+1)
    req.body = {id: "yes"}
    res.send(req.body)
})

// app.route('/test')
//     .get((req, res, next) => {
//         const authCode = req.originalUrl.slice(req.originalUrl.indexOf('=')+1)
//         localStorage.setItem('authCode', authCode)
//         res.send(localStorage.getItem('authCode'))
//     })
    // .post((req, res, next) => {
    //     console.log('post')
    //     const tokenURL = 'https://kweb-project3.herokuapp.com/token'
    //     req.body = `grant_type=authorization_code&code=${localStorage.getItem('authCode')}&redirect_uri=${tokenURL}`
    //     res.set({
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Authorization': `Basic ${base64(config.clientId+':'+config.clientSecret)}`
    //     })
    //     res.redirect(config.oauth2BaseUrl+'/token')
    // })

app.get('/token', (req, res) => {
    res.send('made it')
})


// app.post('/test?code=:id', (req, res) => {
//     const authCode = req.params.id
//     res.send(authCode)
// })



// // index route
// app.get("/products", async (req, res) => {
//   try {
//     // send all products
//     res.json(await Products.find({}));
//   } catch (error) {
//     res.status(400).json({ error });
//   }
// });


// // create route
// app.post("/products", async (req, res) => {
//   try {
//     // create a new product
//     res.json(await Products.create(req.body));
//   } catch (error) {
//     res.status(400).json({ error });
//   }
// });


// // update  route
// app.put("/products/:id", async (req, res) => {
//   try {
//       // update a product
//       res.json(await Products.findByIdAndUpdate(req.params.id, req.body, {new: true}));
//     } catch (error) {
//       res.status(400).json({ error });
//     }
// })  

// // Destroy Route 
// app.delete("/products/:id", async (req, res) => {
//   try {
//       // delete a products
//       res.json(await Products.findByIdAndRemove(req.params.id));
//     } catch (error) {
//       res.status(400).json({ error });
//     }
// })

  


/////////////////////////////////
// Server Listener
/////////////////////////////////
app.listen(PORT, () => {console.log(`listening on PORT ${PORT}`)})