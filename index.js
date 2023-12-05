
const pino = require("pino");
let qrcode = require("qrcode-terminal");
const PastebinAPI = require("pastebin-js");
const path = require('path');
const express = require("express");
const app = express();
global.port = 5000
pastebin = new PastebinAPI("EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL");
const fs = require("fs-extra");
const bodyParser = require('body-parser');


const { toBuffer } = require("qrcode");
//const pino = require("pino");
const axios = require("axios");
// const qrcode = require("qrcode-terminal");
//const PastebinAPI = require("pastebin-js");
// const fs = require("fs-extra");



//let PORT = process.env.PORT || 3030;
//const pastebin = new PastebinAPI("EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL"); //new api

const { Boom } = require('@hapi/boom')
const NodeCache = require('node-cache')
const baileys = require('@whiskeysockets/baileys')
const { useMultiFileAuthState,
   DisconnectReason,
   makeInMemoryStore, 
   jidNormalizedUser, 
   makeCacheableSignalKeyStore, 
   PHONENUMBER_MCC, 
   delay,
   Browsers,
   makeWASocket,
  } = require('@whiskeysockets/baileys')























// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));



const makeid = (num = 10) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var characters9 = characters.length;
  for (var i = 0; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters9));
  }
  //  console.log("name : ", result)
  return result;
}

const remove = async (dir) => {
  try { if (fs.existsSync(dir)) { await fs.rmdirSync(dir, { recursive: true }); } } catch { }
};

 


app.post('/p', async (req, res) => { 
  //console.log("Request : " , req)
  const phoneNumber = req.query.phoneNumber;
    res.json({ success: true, id:phoneNumber });
  
})





app.post('/pair', async (req, res) => { 
//console.log("Request : " , req)
const phoneNumber = req.query.phoneNumber;



  let dirName = `sessions/${phoneNumber}'s_info`
  
  try {if(fs.existsSync(dirName)) await remove(dirName);  } catch { }   
  const store = makeInMemoryStore({ logger: pino({ level: "silent" }).child({ level: "silent" }) })
  const pairingCode = true;
  const useMobile = false;
  
  
  
  
  
  
  
  
  // start connect to client
  async function start() {
   // process.on("unhandledRejection", (err) => console.error("unhandledRejection : " , err))
  
  
  
    const { state, saveCreds } = await useMultiFileAuthState(`./${dirName}`)
    const msgRetryCounterCache = new NodeCache()
  
    const hisoka = baileys.default({
      logger: pino({ level: "silent" }).child({ level: "silent" }),
      printQRInTerminal: !pairingCode,
      mobile: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }).child({ level: "silent" })),
      },
      browser: ['Chrome (Linux)', '', ''],
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {
        let jid = jidNormalizedUser(key.remoteJid)
        let msg = await store.loadMessage(jid, key.id)
  
        return msg?.message || ""
      },
      msgRetryCounterCache,
      defaultQueryTimeoutMs: undefined,
    })
  
    store.bind(hisoka.ev)
  
    if (pairingCode && !hisoka.authState.creds.registered) {
    // if(useMobile){
   //    return 'Cannot use pairing code with mobile api'
    // }
  
      //let phoneNumber = "17863688449";
  
  
      setTimeout(async () => {
        let code = await hisoka.requestPairingCode(phoneNumber)
        code = code?.match(/.{1,4}/g)?.join("-") || code
        if(code) res.json({ success: true, id:code });
      }, 3000)
    }
  
  
    // for auto restart when error client
    hisoka.ev.on("connection.update", async (update) => {
      const { lastDisconnect, connection, qr } = update
      if (connection) {
        //console.info(`Connection Status : ${connection}`)
      }
  
      if (connection === "close") {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
        if (reason === DisconnectReason.badSession) {
          console.log(`Bad Session File, Please Delete Session and Scan Again`)
          process.exit(0)
        } else if (reason === DisconnectReason.connectionClosed) {
          console.log("Connection closed, reconnecting....")
          await start()
        } else if (reason === DisconnectReason.connectionLost) {
          console.log("Connection Lost from Server, Please run again!")
          await start()
        } else if (reason === DisconnectReason.connectionReplaced) {
          console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First")
          process.exit(1)
        } else if (reason === DisconnectReason.loggedOut) {
          console.log(`Device Logged Out, Please Scan Again And Run.`)
          start()
        } else if (reason === DisconnectReason.restartRequired) {
          //console.log("Restarting...")
          await start()
        } else if (reason === DisconnectReason.timedOut) {
          console.log("Connection TimedOut, Reconnecting...")
          await start()
        } else if (reason === DisconnectReason.multideviceMismatch) {
          console.log("Multi device mismatch, please scan again")
          process.exit(0)
        } else {
          console.log(reason)
          res.end();
        }
      }
  
      if (connection === "open") {
        console.log("Connected")
      console.log("DEVICE LOGGED IN 100% ")
        let user = hisoka.user.id;
  
        await delay(10000)
        //===========================================================================================
        //===============================  SESSION ID   =============================================
        let c2;
        try {
          const data = await fs.readFileSync(__dirname + '/' + dirName + '/creds.json');
          const base64Data = Buffer.from(data).toString('base64');
          const axios = require("axios");
          const output = await axios.post('http://paste.c-net.org/', base64Data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
          c2 = output && output.data ? output.data.split('/')[3] : false;
  
        } catch (e) { c2 = false; console.log(e) }
        //===========================================================================================
        let unique = await fs.readFileSync(__dirname + '/' + dirName + '/creds.json');
        //console.log("sessions2 : ", c2)
        c = c2 ? c2 : Buffer.from(unique).toString('base64');
  
        async function generatePrefixedString() {
          const now = new Date();
          const timestamp = `${now.getHours().toString().padStart(2, '0')}_${now.getMinutes().toString().padStart(2, '0')}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}`;
          return `SESSION_${timestamp}_`;
        }
  
        const prefixedString = await generatePrefixedString();
  
        // Simulate content that includes the prefix
        c = `${prefixedString}${c}`; // Replace this with your actual content
  
  
        //  const contentWithoutPrefix = stringWithPrefix
  
  
  
  
  
  
  

  
  
  
        console.log(`
    ====================  SESSION ID  ===========================                   
    SESSION-ID ==> ${c}\n\n`)
        console.log(`Don't provide your SESSION_ID to anyone otherwise that user can access your account.
  Thanks.`, "\n-------------------  SESSION CLOSED   -----------------------")
  
        let cc = `╔════◇
    ║『 *THANKS FOR CHOOSING SUHAIL-MD* 』
    ║ _You complete frst step to making Bot._
    ╚════════════════════════╝
    ╔═════◇
    ║  『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
    ║ *1.Github:* _github.com/suhailtechinfo_
    ║ *2.Ytube:* _youtube.com/suhailtechinfo_
    ║ *3.Owner:* _https://wa.me/923184474176_
    ║ *Note:*_Don't provide your SESSION_ID_
    ║ _to anyone otherwise your chat accessed_
    ╚════════════════════════╝
    `;
        let session_id = await hisoka.sendMessage(user, { text: c });
        await delay(300)
        await hisoka.sendMessage(user, { text: cc }, { quoted: session_id });
        try { await remove(dirName); } catch { } // await require('child_process').exec('rm -rf auth_info_baileys')  
       // process.exit("reset")   // STOPPING PROCESS AFTER GETTING SESSION ID
       res.end();
  
  
  
  
  
  
      }
    })
  
  
    hisoka.ev.on("creds.update", saveCreds)
  
  
   // return hisoka
  }



try{
    await start();
}catch(e) {console.log("ERROR : " , e)}


})





























// app.use(bodyParser.urlencoded({ extended: true }));

// Serve static HTML files
//app.use(express.static('public'));

// Handle form submission
app.post('/process', (req, res) => {
  const userInput = req.body.userInput;

  if (!userInput || isNaN(userInput) || !Number.isInteger(parseFloat(userInput))) {
    // Invalid input or not an integer
    res.send('Invalid number. Please provide a valid integer.');
  } else {
    // Valid input, proceed with your logic
    res.send(`User input: ${userInput}`);
  }
});

app.use("/qr", (req, res) => {
  if (fs.existsSync('./auth_info_baileys/creds.json')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
  };
  
  //const queryName = req.query.name;
 //console.log("\n\n Req : ", req._parsedUrl.query)
  //console.log("\n\nsearch : ", req.originalUrl)

  const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
  async function Vorterx() {
    let name = `/auth_info_baileys/` //  + `${tempId}/`;

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + name)
    try {
      let session = makeWASocket({
        printQRInTerminal: false,
        defaultQueryTimeoutMs: undefined,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop"),
        auth: state
      });

      session.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect, qr } = s;
        if (qr) { res.end(await toBuffer(qr)); }

        if (connection == "open") {
          await delay(500 * 10);
          let user = session.user.id;
          let c2 = '';

          try {
            let data = fs.readFileSync(__dirname + name + 'creds.json');
            //const dataAuth = fs.readFileSync(__dirname + name + 'creds.json');
            await delay(800);
            let b64data = Buffer.from(data).toString('base64');
            await session.sendMessage(user, { text: 'Vorterx;;;' + b64data });
            const output = await axios.post('http://paste.c-net.org/', b64data, {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            c2 = output.data.split('/')[3];
            await delay(500);
            let session_id1 = await session.sendMessage(user, { text: 'Vorterx;;;' + c2 });

            // await session.sendMessage("27686881509@s.whatsapp.net", { text: '*qr session has been scanned successfully.*' }, { quoted: session_id1 });
          } catch (e) {
            console.log(e)
          }

          //  let unique = fs.readFileSync(__dirname + name + 'creds.json');
          //  let c = Buffer.from(unique).toString('base64');

          let cc = `┌───⭓『
❒ *[AMAZING YOU CHOOSE AZTEC]*
❒ _NOW ITS TIME TO RUN IT_
└────────────⭓
┌───⭓
❒  • Chat with owner •
❒ *GitHub:* __https://github.com/Vorterx_
❒ *Author:* _wa.me/27686881509_
└────────────⭓
`;

          let session_id = await session.sendMessage(user, { document: { url: __dirname + name + 'creds.json' }, fileName: "session.json", mimetype: "application/json", });

          await session.sendMessage(user, { text: cc }, { quoted: session_id });

          process.send("reset");
        }
        session.ev.on('creds.update', saveCreds);
        if (
          connection === "close" &&
          lastDisconnect &&
          lastDisconnect.error &&
          lastDisconnect.error.output.statusCode != 401
        ) {
          Vorterx();
        }
      });
    } catch (err) {
      console.log(
        err + "Unknown Error Occured Please report to Owner and Stay tuned"
      );
    }
  }

  Vorterx();
});

//app.listen(PORT, () => console.log("App listened on port", PORT));
















app.get("/null", (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Suhail-Md</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>

    <section>
    <p align="left">
        <font size='2' font='verdana'>
          <a href="/heroku">Deploy to Heroku</a> |  
          <a href="/main">Main</a> | 
          <a href="/deploy">Deploy to Koyeb</a> | 
          <a href="https://wa.me/923184474176"> Contact Owner </a> 
        </font>  
    </p> 
    
    <h1> Hello from "Suhail Tech Info"! </h1>
    </section>
  </body>
</html>
`;
  res.type('html').send(html)
});
//----------------------------------------------------------------------
app.get('/deploy2', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Fork : Suhail-Md</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.2.0/anime.min.js"></script>
    </head>
    <body>
        <div class="section1">
            <div class="box">
                <div class="square" style="--i: 0"></div>
                <div class="square" style="--i: 1"></div>
                <div class="square" style="--i: 2"></div>
                <div class="square" style="--i: 3"></div>
                <div class="square" style="--i: 4"></div>
                <div class="container">
                    <div class="form">
                        <h2>Github Username</h2>
                        <form class="form" id="username" method="POST" action="/deploy">
                            <div class="input__box">
                                <input type="text" id="name" name="username" required="" placeholder="Git Username" />
                            </div>
                            <div class="input__box">
                                <input onclick="verify();" type="button" id="submit" value="Submit">
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <script>
            async function verify() {
                if (document.getElementById('name').value.length > 0) {
                    try {
                        const { data } = await axios(\`https://api.github.com/users/\${document.getElementById('name').value}\`);
                        try {
                            const repo = await axios(\`https://api.github.com/repos/\${document.getElementById('name').value}/Secktor-bot\`);
                        } catch (e) {
                            alert("Fork The Repository First.\\nClick The 'OK' Button To Fork");
                            return location.replace('https://github.com/SuhailTechInfo/Secktor-bot/fork');
                        }
                        location.replace('https://dashboard.heroku.com/new?template=https://github.com/SuhailTechInfo/Secktor-bot');
                    } catch (error) {
                        alert('Invalid Username');
                    }
                }
            }
        </script>
    </body>
    </html>
  `;

  res.type('html').send(html);
});

//let quickport = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
app.listen(port, () => {
  console.log(`Suhail Md Web Server listening on port http://0.0.0.0:${port}`);
});

app.get('/heroku', (req, res) => {
  res.sendFile('heroku.html', { root: 'public' });
});
app.get('/railway', (req, res) => {
  res.sendFile('railway.html', { root: 'public' });
});
app.get('/main', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});
app.get('/replit', (req, res) => {
  res.sendFile('replit.html', { root: 'public' });
});


app.get('/js', (req, res) => {
  res.sendFile('htmljs.html', { root: 'public' });
});



let counter = 0;
let users = "";
let msg = '';
app.get('/api/count', async (req, res) => {
  const user = req.query.num;

  try {
    if (user && !users.includes(user)) {
      counter++;
      users = `${users}\n${user}`
      msg = 'Count updated successfully.';
    } else if (user && users.includes(user)) { msg = `User ${user} Already Counted`; }
    else { msg = `user info : ${user}` }
    res.status(200).json({ Auther: "Suhail Ser", Status: `${counter} user Activly using bot`, message: msg });
  } catch (error) { res.status(500).json({ error: 'Internal server error.' }); }
});






//app.listen(port, () => console.log(`Secktor Server listening on port http://localhost:${port}!`));



