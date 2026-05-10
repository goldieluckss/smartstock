const {
  listUsersWithSubscription,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  setUserActive,
  listProductsAdmin,
  createManagedProduct,
  updateManagedProduct,
  deleteProductAdmin,
  listSubscriptions,
  upsertSubscription,
  listPartnerships,
  updatePartnership,
  listActivityLogs,
} = require("../services/adminService");
const { logActivity } = require("../services/activityLogService");

async function users(req, res, next) {
  try {
    const data = await listUsersWithSubscription();
    return res.status(200).json({ users: data });
  } catch (error) {
    return next(error);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const isActive = Boolean(req.body?.is_active);
    const ok = await setUserActive(userId, isActive);
    if (!ok) return res.status(404).json({ message: "User not found." });
    await logActivity({
      actorType: "admin",
      actorId: req.admin.id,
      action: "user.status.update",
      targetType: "user",
      targetId: userId,
      metadata: { is_active: isActive },
    });
    return res.status(200).json({ message: "User status updated." });
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const user = await createManagedUser({
      name: req.body?.name,
      email: req.body?.email,
      password: req.body?.password,
      isActive: req.body?.is_active !== undefined ? Boolean(req.body.is_active) : true,
    });
    await logActivity({
      actorType: "admin",
      actorId: req.admin.id,
      action: "user.create",
      targetType: "user",
      targetId: user.id,
      metadata: { email: user.email },
    });
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const user = await updateManagedUser(userId, req.body || {});
    if (!user) return res.status(404).json({ message: "User not found." });
    await logActivity({
      actorType: "admin",
      actorId: req.admin.id,
      action: "user.update",
      targetType: "user",
      targetId: userId,
      metadata: { email: user.email, is_active: user.is_active },
    });
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}

async function removeUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const ok = await deleteManagedUser(userId);
    if (!ok) return res.status(404).json({ message: "User not found." });
    await logActivity({
      actorType: "admin",
      actorId: req.admin.id,
      action: "user.delete",
      targetType: "user",
      targetId: userId,
    });
    return res.status(200).json({ message: "User deleted." });
  } catch (error) {
    return next(error);
  }
}

async function products(req, res, next) {
  try {
    const data = await listProductsAdmin({ search: req.query.search || "" });
    return res.status(200).json({ products: data });
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await createManagedProduct(req.body || {});
    await logActivity({
      actorType: "admin",
      actorId: req.admin.id,
      action: "product.create",
      targetType: "product",
      targetId: product.id,
      metadata: { name: product.name, owner_email: product.owner_email },
    });
    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const product = await updateManagedProduct(productId, req.body || {});
    if (!product) return res.status(404).json({ message: "Product not found." });
    await logActivity({
      actorType: "admin",
      actorId: req.admin.id,
      action: "product.update",
      targetType: "product",
      targetId: productId,
      metadata: { name: product.name, owner_email: product.owner_email },
    });
    return res.status(200).json({ product });
  } catch (error) {
    return next(error);
  }
}

async function removeProduct(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const ok = await deleteProductAdmin(productId);
    if (!ok) return res.status(404).json({ message: "Product not found." });
    await logActivity({
      actorType: "admin",
      actorId: req.admin.id,
      action: "product.delete",
      targetType: "product",
      targetId: productId,
    });
    return res.status(200).json({ message: "Product deleted." });
  } catch (error) {
    return next(error);
  }
}

async function subscriptions(req, res, next) {
  try {
    const data = await listSubscriptions();
    return res.status(200).json({ subscriptions: data });
  } catch (error) {
    return next(error);
  }
}

async function saveSubscription(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const subscription = await upsertSubscription(userId, req.body || {});
    await logActivity({
      actorType: "admin",
      actorId: req.admin.id,
      action: "subscription.upsert",
      targetType: "user",
      targetId: userId,
      metadata: subscription,
    });
    return res.status(200).json({ subscription });
  } catch (error) {
    return next(error);
  }
}

async function logs(req, res, next) {
  try {
    const data = await listActivityLogs({ limit: req.query.limit || 200 });
    return res.status(200).json({ logs: data });
  } catch (error) {
    return next(error);
  }
}

async function partnerships(req, res, next) {
  try {
    const data = await listPartnerships();
    return res.status(200).json({ partnerships: data });
  } catch (error) {
    return next(error);
  }
}

async function savePartnership(req, res, next) {
  try {
    const partnershipId = Number(req.params.partnershipId);
    const partnership = await updatePartnership(partnershipId, req.body || {});
    if (!partnership) {
      return res.status(404).json({ message: "Partnership inquiry not found." });
    }
    await logActivity({
      actorType: "admin",
      actorId: req.admin.id,
      action: "partnership.update",
      targetType: "partnership",
      targetId: partnershipId,
      metadata: {
        status: partnership.status,
        admin_note: partnership.admin_note || "",
      },
    });
    return res.status(200).json({ partnership });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  users,
  createUser,
  updateUser,
  removeUser,
  updateUserStatus,
  products,
  createProduct,
  updateProduct,
  removeProduct,
  subscriptions,
  saveSubscription,
  partnerships,
  savePartnership,
  logs,
};
