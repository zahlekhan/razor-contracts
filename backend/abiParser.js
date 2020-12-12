function getConstructorArgs(abi){
    var constructorInp;
    const typeMapper = {
        'bytes32':{
            'type':'string',
            'array':false
        },
        'bytes32[]':{
            'type':'string',
            'array':true
        },
        'uint':{
            'type':'int',
            'array':false
        },
        'bool':{
            'type':'boolean',
            'array':false
        },
        'address':{
            'type':'id',
            'array':false
        }
    }
    for(let i=0;i<abi.length;++i){
        element=abi[i];
        if(element['type']==='constructor'){
            constructorInp=element['inputs'];
        }
    }
    const constructorArg = [];
    for(let i=0;i<constructorInp.length;++i){
        element=constructorInp[i];
        constructorArg.push({
            name:element['name'],
            type:typeMapper[element['type']]['type'],
            array:typeMapper[element['type']]['array']
        })
    }
    return constructorArg;
}

module.exports = {
    getConstructorArgs:getConstructorArgs
}

// const val = require('./VotingABI.json');
// console.log(getConstructorArgs(val));
