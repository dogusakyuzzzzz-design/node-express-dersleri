const notFound = (req, res) => {
  res.status(404).json({
    hata: "Sayfa bulunamadı",
  });
};

module.exports = notFound;