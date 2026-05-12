const productService = require("../services/productService");

function getAuthUserId(req) {
  return req.user?.userId || req.user?.id;
}

function listProducts(req, res, next) {
  const userId = getAuthUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const { search, category } = req.query;

  productService
    .listProducts(userId, { search, category })
    .then((products) => res.status(200).json({ products }))
    .catch(next);
}

function getProduct(req, res, next) {
  const userId = getAuthUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const productId = Number(req.params.id);

  productService
    .getProductById(userId, productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }

      return res.status(200).json({ product });
    })
    .catch(next);
}

function getProductByQr(req, res, next) {
  const userId = getAuthUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const qrCode = req.params.qrCode;

  productService
    .getProductByQrCode(userId, qrCode)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }

      return res.status(200).json({ product });
    })
    .catch(next);
}

async function createProduct(req, res, next) {
  const userId = getAuthUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const { name, category, selling_price } = req.body || {};

    if (!name || !category || selling_price === undefined) {
      return res.status(400).json({
        message: "Name, category, and selling price are required.",
      });
    }

    const product = await productService.createProduct(userId, req.body);

    return res.status(201).json({
      message: "Product created.",
      product,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "QR code already exists for your account.",
      });
    }

    if (
      error.code === "ER_DATA_TOO_LONG" ||
      error.code === "ER_NET_PACKET_TOO_LARGE"
    ) {
      return res.status(413).json({
        message: "Image is too large. Please use a smaller image.",
      });
    }

    return next(error);
  }
}

async function updateProduct(req, res, next) {
  const userId = getAuthUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const productId = Number(req.params.id);

  try {
    const product = await productService.updateProduct(
      userId,
      productId,
      req.body || {}
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({
      message: "Product updated.",
      product,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "QR code already exists for your account.",
      });
    }

    if (
      error.code === "ER_DATA_TOO_LONG" ||
      error.code === "ER_NET_PACKET_TOO_LARGE"
    ) {
      return res.status(413).json({
        message: "Image is too large. Please use a smaller image.",
      });
    }

    return next(error);
  }
}

function deleteProduct(req, res, next) {
  const userId = getAuthUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const productId = Number(req.params.id);

  productService
    .deleteProduct(userId, productId)
    .then((ok) => {
      if (!ok) {
        return res.status(404).json({ message: "Product not found." });
      }

      return res.status(200).json({ message: "Product deleted." });
    })
    .catch(next);
}

async function listMovements(req, res, next) {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const productId = Number(req.params.id);
    const product = await productService.getProductById(userId, productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const movements = await productService.listMovements(userId, productId);

    return res.status(200).json({ movements });
  } catch (error) {
    return next(error);
  }
}

function listAllMovements(req, res, next) {
  const userId = getAuthUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const movementType = req.query.type;

  productService
    .listAllMovements(userId, { movementType })
    .then((movements) => res.status(200).json({ movements }))
    .catch(next);
}

async function recordMovement(req, res, next) {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const productId = Number(req.params.id);

    const product = await productService.recordMovement(
      userId,
      productId,
      req.body || {}
    );

    return res.status(201).json({
      message: "Movement recorded.",
      product,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    return next(error);
  }
}

function recentMovements(req, res, next) {
  const userId = getAuthUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const limit = req.query.limit;

  productService
    .listRecentMovements(userId, limit)
    .then((movements) => res.status(200).json({ movements }))
    .catch(next);
}

function alertsSummary(req, res, next) {
  const userId = getAuthUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  productService
    .getAlertsSummary(userId)
    .then((summary) => res.status(200).json(summary))
    .catch(next);
}

module.exports = {
  listProducts,
  getProduct,
  getProductByQr,
  createProduct,
  updateProduct,
  deleteProduct,
  listMovements,
  listAllMovements,
  recordMovement,
  recentMovements,
  alertsSummary,
};