const ContactMessage = require('../models/ContactMessage');
const ApiResponse = require('../utils/ApiResponse');

const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    const savedMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json(ApiResponse.success(
      'Your message has been saved. Email delivery is not configured, so it has not been emailed.',
      { id: savedMessage._id, status: savedMessage.status },
      201,
    ));
  } catch (error) {
    return next(error);
  }
};

module.exports = { submitContactMessage };
