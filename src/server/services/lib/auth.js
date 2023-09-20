const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {v4} = require('uuid');
const {generateRSAKeys} = require('./generateKeys');
class Authentication {
    constructor({db}) {
        this._db = db;
    }

    register({email, password, passwordConfirmation}) {
        return new Promise(async (resolve, reject) => {
            try {
                // validate email 
                // check password & confirmation matched
                // check email already exists or not 
                // encrypt password 
                // save new user to db
                // create key pair for user and save them in db 
                // create jwt token 
                // return result 
                if(this._validateEmail(email) && this._validatePassword(password) && this._checkPasswordMatched(password, passwordConfirmation)) {
                    let isExists = await this._db.get(`users:email:${email}`);
                    if(isExists) {
                        return reject(new Error("an user already exists in database by provided email"));
                    }else {
                        let generatedSalt = await bcrypt.genSalt(10);
                        let hashedPassword = await bcrypt.hash(password, generatedSalt);
                        let user = {
                            id : v4(),
                            email,
                            hashedPassword,
                            profile : {
                                firstName : null,
                                lastName : null,
                                birthDate: null
                            },
                            isActive : false,
                            loginCount : 0,
                            lastLoginAt: Date.now(),
                            createdAt : Date.now(),
                            updatedAt : Date.now()
                        };
                        console.log(user.id);
                        const keys = Object.keys(user);
                        let result = await this._insertObject(this._db, user, keys);
                        console.log(result);
                        console.log(result.length === Object.keys(user).length);
                        await this._db.set(`users:email:${user.email}`, user.id);
                        const { privateKey, publicKey } = await generateRSAKeys();
                        const keyId = v4();
                        await this._db.set(`keyId:${keyId}`, JSON.stringify({ pub : publicKey, private : privateKey }));
                        const jwtToken = jwt.sign({ exp : Math.floor(Date.now()) + (60 * 60), data : {id: user.id, email: user.email}}, 
                            privateKey,{algorithm: 'RS256', header : { kid : keyId }});
                        if(result.length === Object.keys(user).length && result !== undefined && result.every(v => v === 1)){
                            let result = {
                                message : "user created successfully",
                                userId : user.id,
                                success : true,
                                jwtToken
                            }
                            return resolve(result);
                        }else {
                            let result = {
                                message : "operation was not successful",
                                userId : null,
                                success : false
                            }
                            return reject(new Error(result))
                        }
                    }
                }else {
                  throw new Error("invalid email and password!");
                }
            } catch (error) {
                console.log(error);
                return reject(new Error(error.message));
            }
        });
    }
    login({email, password}) {
        return new Promise(async (resolve, reject) => {
            try {
                // validate email 
                // validate password
                // check email exists in db
                // compare password 
                // update login count 
                // return result 
                if(this._validateEmail(email) && this._validatePassword(password)) {
                    let emailExists = await this._db.get(`users:email:${email}`);
                    if(emailExists) {
                        let userId = await this._db.get(`users:email:${email}`);
                        let user = await this._db.hGetAll(`users:${userId}`);
                        let res = await bcrypt.compare(password, user.hashedPassword);
                        if(res === true) {
                            const [incrReply, setLastLoginReply, setUpdatedAtReply ] = await this._db.multi()
                                .hIncrBy(`users:${userId}`,'loginCount', 1)
                                .hSet(`users:${userId}`, 'lastLoginAt', Date.now())
                                .hSet(`users:${userId}`, 'updatedAt', Date.now())
                                .exec();
                                const { privateKey, publicKey } = await generateRSAKeys();
                                const keyId = v4();
                                await this._db.set(`keyId:${keyId}`, JSON.stringify({ pub : publicKey, private : privateKey }));
                                const jwtToken = jwt.sign({ exp : Math.floor(Date.now()) + (60 * 60), data : {id: user.id, email: user.email}}, 
                        privateKey,{algorithm: 'RS256', header : { kid : keyId }});
                            return resolve({
                                message : "user logged in successfully",
                                success : true,
                                userId : userId,
                                jwtToken
                            });
                        }else {
                            return reject(new Error("invalid email and password!"));
                        }
                    }else {
                        return reject(new Error("user does not exists!"));
                    }
                }else {
                    return reject(new Error("invalid email & password!"));
                }
            } catch (error) {
                return reject(new Error(error.message));
            }
        });
    }
    loginWithToken(token) {
        return new Promise(async (resolve, reject) => {
            try {
                if(token !== null && token !== undefined) {
                    let decodedToken = jwt.decode(token, {complete: true });
                    console.log(decodedToken);
                    if(decodedToken.header.kid !== null && decodedToken.header.kid !== undefined && decodedToken.header.kid) {
                        const keyId = decodedToken.header.kid;
                        let keys = await this._db.get(`keyId:${keyId}`);
                        const {pub} = JSON.parse(keys);
                        const payload = jwt.verify(token, pub, { algorithms: 'RS256'});
                        const userId = await this._db.get(`users:email:${payload.data.email}`);
                        if(userId) {
                            return resolve({
                                payload,
                                success : true
                            });
                        }else {
                            return reject(new Error('user not found!'));
                        }
                    }else {
                        return reject(new Error('invalid Token'));
                    }
                }else {
                    return reject(new Error('invalid token parameter'));
                }
            }catch(error) {
                return reject(error);
            }
        });
    }
    _checkPasswordMatched(pass, confirm) {
        return pass === confirm;
    }
    _validatePassword(pass) {
        return pass !== undefined && pass !== null && pass.length >= 8 ;
    }
    _validateEmail(email) {
        return email != undefined && email !== null && validator.contains(email, '@') && validator.isEmail(email);
    }
    _insertObject(db, obj, keys) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = keys.map(async k => {
                    const setResult = await db.hSet(`users:${obj.id}`, k ,(obj[k]).constructor === ({}).constructor ? JSON.stringify(obj[k]) : obj[k].toString());
                    return setResult;
                });
                Promise.all(result).then(x => {
                    return resolve(x);
                });
            }catch(err) {
                return reject(err);
            }
        });
    }

}

module.exports = Object.assign({}, {Authentication});