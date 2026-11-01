class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status; //aggiungo status alla classe Error
  }
}

module.exports = HttpError;