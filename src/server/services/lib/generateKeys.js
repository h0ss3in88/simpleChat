const {
    generateKeyPairSync,
    randomBytes
} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const generateRSAKeys = () => {
    return new Promise((resolve, reject) => {
        try {
            const dest = path.resolve(__dirname, '../','../','../','../','keys');
            if(!fs.existsSync(dest)) {
                fs.mkdirSync(dest);
                const {privateKey, publicKey} = generateKeyPairSync('rsa', {
                    modulusLength : 2048,
                    publicKeyEncoding : {
                        type: 'pkcs1',
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    }
                });
                fs.writeFileSync(path.resolve(dest, 'privateKey.pem'), privateKey, {encoding: 'utf8', flag: 'w+' });
                fs.writeFileSync(path.resolve(dest, 'publicKey.pem'), publicKey, {encoding: 'utf8', flag: 'w+' });
                resolve({ success : true, privateKey, publicKey });
            }else if(fs.existsSync(path.resolve(dest))){
                let priKey = fs.readFileSync(path.resolve(dest, 'privateKey.pem'), { encoding: 'utf8'});
                let pubKey = fs.readFileSync(path.resolve(dest, 'publicKey.pem'), { encoding: 'utf8'});
                resolve({ success : true, privateKey: priKey , publicKey: pubKey });
            }
        } catch (error) {
            return reject(new Error(error.message));
        }
    });
}
module.exports = Object.assign({}, {generateRSAKeys});