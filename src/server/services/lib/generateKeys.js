const {
    generateKeyPairSync
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
                    modulusLength : 4096,
                    publicKeyEncoding : {
                        type: 'spki',
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs8',
                        format: 'pem',
                        cipher: 'aes-256-cbc',
                        passphrase: process.env.PASS_PHRASE
                    }
                });
                fs.writeFileSync(path.resolve(dest, 'privateKey.pem'), privateKey.toString(), {encoding: 'utf-8', flag: 'w+' });
                fs.writeFileSync(path.resolve(dest, 'publicKey.pem'), publicKey.toString(), {encoding: 'utf-8', flag: 'w+' });
                resolve({ success : true, privateKey, publicKey });
            }else if(fs.existsSync(path.resolve(dest))){
                let priKey = fs.readFileSync(path.resolve(dest, 'privateKey.pem'), { encoding: 'utf-8'});
                let pubKey = fs.readFileSync(path.resolve(dest, 'publicKey.pem'), { encoding: 'utf-8'});
                resolve({ success : true, privateKey: priKey , publicKey: pubKey });
            }
        } catch (error) {
            return reject(new Error(error.message));
        }
    });
}
module.exports = Object.assign({}, {generateRSAKeys});