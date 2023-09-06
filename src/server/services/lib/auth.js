const validator = require('validator');
const bcrypt = require('bcryptjs');
const {v4} = require('uuid');
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
                            created_at : Date.now(),
                            updated_at : Date.now()
                        };
                        console.log(user);
                        const result = Object.keys(user).map(async k => {
                            return await client.hSet(`users:${user.id}`, k , user[k]);
                        });
                        await this._db.set(`users:email:${user.email}`, user.id);
                        if(result.length === Object.keys(user).length && result !== undefined && result.every(v => v === 1)){
                            let result = {
                                message : "user created successfully",
                                userId : user._id,
                                success : true
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
                        let user = await this._db.getAll(`users:${userId}`);
                        let res = await bcrypt.compare(password, user.hashedPassword);
                        if(res === true) {
                            const [incrReply, setLastLoginReply, setUpdatedAtReply ] = await this._db.multi()
                                .hIncrBy(`users:${userId}`,'loginCount', 1)
                                .hSet(`users:${userId}`, 'lastLoginAt', Date.now())
                                .hSet(`users:${userId}`, 'updatedAt', Date.now())
                                .exec();
                            return resolve({
                                message : "user logged in successfully",
                                success : true,
                                userId : userId
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
    _checkPasswordMatched(pass, confirm) {
        return pass === confirm;
    }
    _validatePassword(pass) {
        return pass !== undefined && pass !== null && pass.length >= 8 ;
    }
    _validateEmail(email) {
        return email != undefined && email !== null && validator.contains(email, '@') && validator.isEmail(email);
    }

}

module.exports = Object.assign({}, {Authentication});