const {Router} = require('express');
const httpStatus = require('http-status');
const {Authentication} = require('../../services');

let accountsRouter = Router();
accountsRouter.post('/accounts/users/signup', async (req,res,next) => {
    try {
        const {email, password, confirmation} = req.body;
        let auth = new Authentication({ db : req.cache });
        let result = await auth.register({email, password, passwordConfirmation: confirmation });
        if(result.success === true) {
            return res.status(httpStatus.OK).json({ success : true, message: result.message });
        }else {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success : false, message: result.message });
        }
    }catch(err) {
        return next(err);
    }
});
accountsRouter.post('/accounts/users/login', async (req,res,next) => {
    try {
        const {email, password} = req.body;
        let auth = new Authentication({ db : req.cache });
        let result = await auth.login({ email, password });
        if(result.success === true) {
            return res.status(httpStatus.OK).json({ success: true, message : result.message });
        }else {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success : false, message: result.message });
        }
    }catch(err) {
        return next(err);
    }
});
accountsRouter.get('/accounts/users', (req,res,next) => {
    try{
        const selectStmt = `select id,username,socketid,joinat from users;`;
        req.db.all(selectStmt, [username], (err,rows) => {
            if(err) {
                return next(err);
            }
            return res.status(httpStatus.OK).json({ users: rows });
        });
    }catch(err) {
        return next(err);
    }
});
accountsRouter.post('/accounts/users/get/username', (req,res,next) => {
    try{
        const {username} = req.body;
        const selectStmt = `select username from users where username = ?`;
        req.db.get(selectStmt, [username], (err,row) => {
            if(err) {
                return next(err);
            }
            return row && row.username === username ?
                res.status(httpStatus.CONFLICT).json({success:false, message: 'user name already exists!' }) :
                res.status(httpStatus.OK).json({ success : true , message : 'user name is valid!' });
            
        });
    }catch(err) {
        return next(err);
    }
});
module.exports = Object.assign({}, {accountsRouter})