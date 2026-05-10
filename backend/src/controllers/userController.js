function getHealth(req, res) {
  res.status(200).json({
    status: "ok",
    service: "Techno-Mobile-APP-Backend",
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
};
