// Centralised, user-friendly error responder.
// Converts noisy Mongoose / Mongo errors into clean messages and avoids
// leaking raw stack traces or internal error strings to API clients.
export const sendError = (res, error) => {
  // Mongoose schema validation failure -> 400 with a readable summary
  if (error?.name === "ValidationError") {
    const messages = Object.values(error.errors || {}).map((e) => e.message);
    return res.status(400).json({
      message: messages.length ? messages.join(", ") : "Validation failed",
    });
  }

  // Invalid ObjectId / type cast -> 400
  if (error?.name === "CastError") {
    return res.status(400).json({ message: `Invalid value for ${error.path}` });
  }

  // Duplicate key (unique index) -> 400 with the offending field
  if (error?.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    return res
      .status(400)
      .json({ message: `A record with this ${field} already exists` });
  }

  // Anything else is an unexpected server error: log the detail, return a
  // generic message so internals are not exposed to the client.
  console.error(error);
  return res
    .status(500)
    .json({ message: "Something went wrong. Please try again later." });
};
