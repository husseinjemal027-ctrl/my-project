const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const cookieOptions = require('../utils/cookieOptions');
const { generateToken } = require('../utils/token');

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: String(email).toLowerCase() });

    if (exists) {
      return next(new ApiError(409, 'User with this email already exists.'));
    }

    const user = await User.create({
      name,
      email: String(email).toLowerCase(),
      password,
    });

    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);

    return res.status(201).json(
      ApiResponse.success('User registered successfully.', {
        user: buildUserPayload(user),
      }, 201)
    );
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });

    if (!user) {
      return next(new ApiError(401, 'Please enter the correct email or password.'));
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return next(new ApiError(401, 'Please enter the correct email or password.'));
    }

    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);

    return res.status(200).json(
      ApiResponse.success('Login successful.', {
        user: buildUserPayload(user),
      })
    );
  } catch (error) {
    return next(error);
  }
};

const logout = (req, res) => {
  const clearOptions = { ...cookieOptions };
  delete clearOptions.maxAge;
  res.clearCookie('token', clearOptions);
  return res.status(200).json(ApiResponse.success('Logged out successfully.'));
};

const getMyProfile = (req, res) => {
  return res.status(200).json(ApiResponse.success('User profile fetched successfully.', {
    user: buildUserPayload(req.user),
  }));
};

module.exports = { register, login, logout, getMyProfile };
