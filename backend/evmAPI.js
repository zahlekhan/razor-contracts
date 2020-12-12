const Web3 = require('web3');
const solc = require('solc');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7410"));

function preload(acc){
    web3.eth.personal.sendTransaction({
        from:"0x9350441a177bdf129b1c02eaa007a1a41010db97",
        to:acc,
        value:"10000000000000"
    },"password");
}
async function createAccount(){
    const acc = await web3.eth.personal.newAccount("password");
    preload(acc);
    return acc;
}

// async function createContractTemplate(file){
//     const input = {
//         language: 'Solidity',
//         sources: {
//             'name' :{
//                 content: file.toString()
//             }
//         },
//         settings: {
//             outputSelection: {
//               '*': {
//                 '*': ['*']
//               }
//             }
//         }
//     };

//     const res = await new Promise((resolve, reject) => {
//         resolve(solc.compile(JSON.stringify(input)));
//     });
//     return JSON.parse(res);

// }

async function createContractTemplate(file,fileName){

    const input = {
        language: 'Solidity',
        sources: {
            'name' :{
                content: file.toString()
            }
        },
        settings: {
            outputSelection: {
              '*': {
                '*': ['*']
              }
            }
        }
    };


    const res = await new Promise((resolve, reject) => {
        resolve(
            JSON.parse(solc.compile(JSON.stringify(input))
            )
        );
    });
    try{
        return {
            'abi': res.contracts['name'][fileName].abi,
            'bytecode': res.contracts['name'][fileName].evm.bytecode.object
        };
    }catch(e){
        throw 'failed to compile';
    }
}

function convertToHex(args){
    return args.map((ele)=>{
        if(Array.isArray(ele)){
            return ele.map((x)=>{
                return web3.utils.toHex(x)
            });
        }else{
            return web3.utils.toHex(ele)
        }
    })
}

// async function uploadContract(account,fileName,template,constructorArgs){
//     const abi=template.contracts['name'][fileName].abi;
//     const bytecode=template.contracts['name'][fileName].evm.bytecode.object;
//     const contract = new web3.eth.Contract(abi);
//     const hexConstructorArgs = convertToHex(constructorArgs);
//     const address = await web3.eth.personal.unlockAccount(account, 'password')
//     .then(()=>{
//         return contract.deploy({
//             data:"0x"+bytecode,
//             arguments: hexConstructorArgs
//         }).send({
//             from:account
//         }).then(function(newContractInstance){
//             return newContractInstance.options.address; // instance with the new contract address
//         })
//     }).then((res)=>{
//         return res; 
//     });
//     return address
// }

async function uploadContract(account,template,constructorArgs){
    const abi=template.abi;
    const bytecode=template.bytecode;
    const contract = new web3.eth.Contract(abi);
    const hexConstructorArgs = convertToHex(constructorArgs);
    const address = await web3.eth.personal.unlockAccount(account, 'password')
    .then(()=>{
        return contract.deploy({
            data:"0x"+bytecode,
            arguments: hexConstructorArgs
        }).send({
            from:account
        }).then(function(newContractInstance){
            return newContractInstance.options.address; // instance with the new contract address
        })
    }).then((res)=>{
        return res; 
    });
    return address
}

function checkStatic(abi,methodName){
    for(let i=0;i<abi.length;++i){
        element=abi[i];
        if(element['name']==methodName){
            return element['stateMutability']=='view'||element['stateMutability']=='pure';
        }
    }
}

// function transaction(account,fileName,template,address,methodName,methodArgs){
    
//     const abi=template.contracts['name'][fileName].abi;
//     //console.log(abi);
//     const contract = new web3.eth.Contract(abi,address);
//     const hexArgs = convertToHex(methodArgs);
//     if(checkStatic(abi,methodName)){
//         web3.eth.personal.unlockAccount(account, 'password')
//         .then(()=>{
//             if(hexArgs.length==0){
//                 return contract.methods[methodName].call(this).call({from: account})
//             }else{
//                 return contract.methods[methodName].call(this,...hexArgs).call({from: account})
//             }
            
//         })
//         .then((res)=>{
//             console.log(res);
//         });
//     } else{
//         web3.eth.personal.unlockAccount(account, 'password',)
//         .then(()=>{
//             if(hexArgs.length==0){
//                 console.log(contract.methods[methodName]);
//                 return contract.methods[methodName].call(this).send({from: account})
//                 .on('receipt',(receipt)=>{
//                     console.log(receipt)
//                 })
//                 .on('error',(error,receipt)=>{
//                     console.log(error.toString().split('\n',1)[0])
//                 })
//             }else{
//                 return contract.methods[methodName].call(this,...hexArgs).send({from: account})
//                 .on('receipt',(receipt)=>{
//                     console.log(receipt)
//                 })
//                 .on('error',(error,receipt)=>{
//                     console.log(error.toString().split('\n',1)[0])
//                 })
//             }
//         })
//         .catch((e)=>{console.log(e)});
//     }
// }

function transaction(account,template,address,methodName,methodArgs){
    
    const abi=template.abi;
    //console.log(abi);
    const contract = new web3.eth.Contract(abi,address);
    const hexArgs = convertToHex(methodArgs);
    if(checkStatic(abi,methodName)){
        web3.eth.personal.unlockAccount(account, 'password')
        .then(()=>{
            if(hexArgs.length==0){
                return contract.methods[methodName].call(this).call({from: account})
            }else{
                return contract.methods[methodName].call(this,...hexArgs).call({from: account})
            }
            
        })
        .then((res)=>{
            console.log(res);
        });
    } else{
        web3.eth.personal.unlockAccount(account, 'password',)
        .then(()=>{
            if(hexArgs.length==0){
                console.log(contract.methods[methodName]);
                return contract.methods[methodName].call(this).send({from: account})
                .on('receipt',(receipt)=>{
                    console.log(receipt)
                })
                .on('error',(error,receipt)=>{
                    console.log(error.toString().split('\n',1)[0])
                })
            }else{
                return contract.methods[methodName].call(this,...hexArgs).send({from: account})
                .on('receipt',(receipt)=>{
                    console.log(receipt)
                })
                .on('error',(error,receipt)=>{
                    console.log(error.toString().split('\n',1)[0])
                })
            }
        })
        .catch((e)=>{console.log(e)});
    }
}

module.exports = {
    createAccount:createAccount,
    createContractTemplate:createContractTemplate,
    uploadContract:uploadContract,
    transaction:transaction,
}

// const fs = require('fs');
// const file = fs.readFileSync('Ballot.sol');
// const fileName = 'Ballot';
// const arg = [["ram","shyam"]];
// const acc = '0x9350441a177bdf129b1c02eaa007a1a41010db97'

// const template = createContractTemplate(file,fileName).then((res)=>{
//     console.log(res);
// })

// const add = createContractTemplate(file,fileName)
// .then((template)=>{
//     return uploadContract(acc,template,arg)
// }).then((res)=>{
//     console.log(res);
// })

// async function t(){
//     const template = await createContractTemplate(file,fileName);
//     const address = await uploadContract(acc,template,arg);
//     const txn1 = await transaction(acc,template,address,'vote',[1]);
//     setTimeout(function(){ const txn2 = transaction(acc,template,address,'vote',[1]); }, 5000);
//     setTimeout(function(){ const txn3 = transaction(acc,template,address,'winnerName',[]); }, 15000);
// }

// t();
