const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');
const evmAPI = require('./evmAPI.js');
const abiParser = require('./abiParser.js');

const app = express();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
  
app.use(express.json());
app.use(fileUpload({
    tempFileDir : '/tmp/'
}));

app.post('/signup',async (req,res)=>{
    try{
        const doc = db.collection('users').doc(req.body.email);
        const checkDoc = await doc.get();
        if (checkDoc.exists) {
            res.status(400).json('User Exists');
        } else {
            await doc.set({
                password:req.body.password,
                api_key:req.body.email,
                razor_api_key:req.body.razor_api_key
            });
            res.json({
                api_key:req.body.email
            });
        }
    } catch(e){
        console.log(e);
        res.status(500).json('Database error')
    }
});

app.post('/login',async (req,res)=>{
    try{
        const doc = db.collection('users').doc(req.body.email);
        const checkDoc = await doc.get();
        if (!checkDoc.exists) {
            
        } 
        if(req.body.password!==checkDoc.data().password){
            res.status(400).json('Wrong password');
        }
        res.json({
            api_key:checkDoc.data().api_key
        });
    } catch(e){
        res.status(500).json('Database error');
    }
});

app.use('/auth',async (req,res,next)=>{
    const doc = db.collection('users').doc(req.body.api_key);
    const checkDoc = await doc.get();
    if (!checkDoc.exists) {
       res.status(400).json('invalid key');
    }
    next();
});

// async function checkAuth(api_key){
//     const doc = db.collection('users').doc(api_key);
//     const checkDoc = await doc.get();
//     if (!checkDoc.exists) {
//         throw 'Invalid key'
//     }
// }

app.post('/auth/createTemplate',async (req,res)=>{
    try{
        const file = req.files.contract_file.data.toString('ascii')
        const filename = path.parse(req.files.contract_file.name).name;
        evmAPI.createContractTemplate(file,filename)
        .then(async (template)=>{
            const doc = db.collection('contracts').doc(filename);
            const checkDoc = await doc.get();
            if(checkDoc.exists){
                res.status(400).json("Contract exists");
            }else{
                await doc.set({
                    abi:template.abi,
                    bytecode:template.bytecode
                });
                res.json("upload succesful");
            }
        })
    } catch(e){
        res.status(500).json('Error');
    }
});

app.post('/auth/getTemplates',async (req,res)=>{
    try{
        const snapshot = await db.collection('contracts').get();
        const templates = [];
        snapshot.forEach((doc)=>{
            templates.push({
                name:doc.id
            })
        })
        res.json(templates);
    } catch(e){
        res.status(500).json('Error');
    }
});

app.post('/auth/getConstructorArgs',async (req,res)=>{
    try{
        const contract = await db.collection('contracts').doc(req.body.contract_name).get();
        console.log(contract);
        if(!contract.exists){
            res.status(400).json('contract does not exist');
        }else{
            const args = abiParser.getConstructorArgs(contract.data().abi);
            return res.json(args);
        }
        
    }catch(e){
        res.status(500).json(e.toString());
    }
});



const port = 5000;
app.listen(port,()=>console.log(`${port}`));

