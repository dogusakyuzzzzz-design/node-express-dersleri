const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    hata: "Sunucuda beklenmeyen bir hata oluştu",
  });
};

module.exports = errorHandler;