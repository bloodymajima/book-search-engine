const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id })
            } throw AuthenticationError;
        },

        users: async () => {
            return await User.find({});
        }

    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const profile = await User.findOne({ email });

            if (!profile) {
                throw AuthenticationError;
            }

            const correctPassword = await profile.isCorrectPassword(password);

            if (!correctPassword) {
                throw AuthenticationError;
            }

            const token = signToken(profile);
            return { token, profile };
        },

        addUser: async (parent, { username, email, password }) => {
            try {
                const user = await User.create({ username, email, password })
                const token = signToken(user);


                if (!user) {
                    throw new Error('Making user failed');
                }

                return { token, user };
            } catch (error) {
                throw new Error(error);
            }
        },

        saveBook: async (parent, { saveBook }, context) => {
            try {
                console.log(context.user);
                if (context.user) {
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: context.user._id },
                        { $addToSet: { savedBooks: saveBook } },
                        { new: true, runValidators: true }
                    );
                    console.log(updatedUser);
                    return updatedUser;
                }
                throw AuthenticationError('Log in to save a book');
            } catch (error) {
                console.log(error);
            }
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                try {
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: context.user._id },
                        { $pull: { savedBooks: { bookId } } },
                        { new: true }
                    );

                    if (!updatedUser) {
                        throw new Error("Couldn't find user");
                    }

                    return updatedUser;
                } catch (error) {
                    throw new Error(error.message);
                }
            } else {
                throw new AuthenticationError('Log in to remove a book');
            }
        },
    },
};

module.exports = resolvers