const { GraphQLString } = require('graphql');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { createJWT } = require('../util/auth');


const register = {
    type: GraphQLString,
    description: 'Register a new user',
    args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },
    async resolve(parent, args){
        const checkUser = await User.findOne({ email: args.email }).exec();
        if (checkUser){
            throw new Error("User with this email address already exists");
        }

        const { username, email, password } = args;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({ username, email, password: passwordHash });

        await user.save();

        const token = createJWT(user);

        return token
    }
}


const login = {
    type: GraphQLString,
    description: 'Login a user',
    args: {
        username: { type: GraphQLString },
        password: { type: GraphQLString }
    },
    async resolve(parent, args){
        const { username, password } = args;
        const user1 = await User.findOne({ email: args.email }).exec();
        if (!user1){
            throw new Error("Email does not exist");
        }


        const passMatch = await bcrypt.compare(password, user1.password);
        if (!passMatch){
            throw new Error("Invalid password");

        }

        const token = createJWT(user1);
        return token
    }
}


module.exports = {
    register, login
}
