class ApiResponse {
  static success(message = 'Success', data = null, statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  static error(message = 'Error', statusCode = 400, data = null) {
    return {
      success: false,
      statusCode,
      message,
      data,
    };
  }
}

module.exports = ApiResponse;
