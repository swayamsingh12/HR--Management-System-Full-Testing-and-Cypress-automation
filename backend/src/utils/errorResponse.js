export const sendError = (res, error) => {

  if (error?.name === "ValidationError") {
    const messages = Object.values(error.errors || {}).map((e) => e.message);
    return res.status(400).json({
      message: messages.length ? messages.join(", ") : "Validation failed",
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({ message: `Invalid value for ${error.path}` });
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    return res
      .status(400)
      .json({ message: `A record with this ${field} already exists` });
  }

  console.error(error);
  return res
    .status(500)
    .json({ message: "Something went wrong. Please try again later." });
};
