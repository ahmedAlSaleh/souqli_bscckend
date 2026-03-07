const sendResponse = (res, { success, message, data, errors, status }) => {
  res.status(status).json({
    success,
    message,
    data,
    errors
  });
};

const ok = (res, message, data, status = 200) =>
  sendResponse(res, { success: true, message, data, errors: null, status });

const fail = (res, message, errors = null, status = 400) =>
  sendResponse(res, { success: false, message, data: null, errors, status });

module.exports = { sendResponse, ok, fail };
