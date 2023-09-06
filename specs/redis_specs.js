const {createClient} = require('redis');
const {v4} = require('uuid');
const should = require('should');

describe('redis key-value store', () => { 
    describe('set and get operation', () => {
        it('save x = 5 ', async () => {
            try {
                const client = createClient();
                await client.connect();
                client.on('error', err => console.log('Redis Client Error', err));
                let result = await client.set('x',5);
                should(result).not.null();
                should(result).not.undefined();
                should(result).be.eql('OK');
                client.disconnect();
            }catch(err) {
                should(err).be.null();
            }
        });
        it('retrieved x successfully', async () => {
            try {
                const client = createClient();
                await client.connect();
                client.on('error', err => console.log('Redis Client Error', err));
                let result = parseInt(await client.get('x'), 10);
                should(result).not.null();
                should(result).not.undefined();
                should(result).be.eql(5);
                client.disconnect();
            }catch(err) {
                should(err).be.null();
            }
        });
        it('saved and retrieved user object successfully', async () => {
            try {
                const client = createClient();
                await client.connect();
                client.on('error', err => console.log('Redis Client Error', err));
                const user = { id : v4(), first_name : 'x', last_name : 'y', created_at: Date.now() };
                Object.keys(user).forEach(async k => {
                    let saveResult = await client.hSet(`user:${user.id}`, k , user[k]);
                    console.log(saveResult);
                    console.log(should(saveResult).be.eql('OK'));
                    should(saveResult).be.eql(1);
                });
                const savedUser = await client.hGetAll(`user:${user.id}`);
                should(savedUser).has.properties(['id','first_name','last_name','created_at']);
                console.log(savedUser);
                should(savedUser).has.property('id', user.id);
            } catch (error) {
                console.log(error);
                should(error).be.null();
            }
        });
    });
}); 
