const validator = require("validator");
const bcrypt = require("bcryptjs");
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
                    let isExists = await this._db.users.isEmailExists({email});
                    if(isExists) {
                        return reject(new Error("an user already exists in database by provided email"));
                    }else {
                        let generatedSalt = await bcrypt.genSalt(10);
                        let hashedPassword = await bcrypt.hash(password, generatedSalt);
                        let user = {
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
                        let createdUser = await this._db.users.createNewUser(user);
                        if(createdUser !== undefined && createdUser !== null && validator.isMongoId(createdUser._id)){
                            let result = {
                                message : "user created successfully",
                                userId : createdUser._id,
                                success : true
                            }
                            return resolve(result);
                        }else {
                            let result = {
                                message : "user created successfully",
                                userId : createdUser._id,
                                success : true
                            }
                            return reject(new Error(result))
                        }
                    }
                }else {
                    return reject(new Error("invalid email and password!"));
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
                    let emailExists = await this._db.users.isEmailExists({email});
                    if(emailExists) {
                        let user = await this._db.users.findUserByEmail({email});
                        let res = await bcrypt.compare(password, user.hashedPassword);
                        if(res === true) {
                            user.loginCount++;
                            user.lastLoginAt = Date.now();
                            user.updated_at = Date.now();
                            let updatedUser = await this._db.users.updateUser({user});
                            return resolve({
                                message : "user logged in successfully",
                                success : true,
                                userId : updatedUser._id
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