const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;
const should = require('should');

describe.only('Encryption ', function() {
    this.timeout(150000);
    describe('JSON WEB TOKEN', function() {
        const subject = {
            email : 'tets@test.com',
            id : uuid(),
            time : Date.now()
        };
        let pKey;
        let pubKey;
        const cipher = crypto.createCipheriv('aes-256-cbc',Buffer.from(crypto.randomBytes(32)),crypto.randomBytes(16)).setAutoPadding();
        before(function(done) {
            const passPhrase = crypto.randomBytes(256).toString('hex');
            console.log(`passPhrase : ${passPhrase}`);
            const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa',{ modulusLength : 2048});
            pKey = privateKey.export({ type: 'pkcs1', format: 'pem',cipher: cipher,passphrase: passPhrase});
            pubKey = publicKey.export({ type: 'pkcs1', format: 'pem' });
            done();
        });
        it('private & public keys generated successfully', () => {
            should(pKey).not.be.null();
            should(pubKey).not.be.null();
        });
        it('sign json web token successfully', () => {
            // PS256
            singedJwt = jwt.sign(subject, pKey, { algorithm : 'RS256'});
            console.log(singedJwt); 
            payload = jwt.verify(singedJwt, pubKey, { algorithms: 'RS256'});
            console.log(payload);
        });
    });
});
const generateKeys = function () {
    crypto.generateKeyPair('rsa-pss', {
        modulusLength : 2048 ,
        publicKeyEncoding : {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: passPhrase
        }
    }, function(err, privateKey, publicKey) {
        console.error(err);
        console.log(privateKey);
        console.log(publicKey);
        if(err) done(err);
        
    });
}