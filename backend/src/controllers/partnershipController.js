const { createPartnershipInquiry } = require("../services/adminService");
const { logActivity } = require("../services/activityLogService");

async function submitPartnershipInquiry(req, res, next) {
  try {
    const companyName = String(req.body?.company_name || "").trim();
    const contactName = String(req.body?.contact_name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const message = String(req.body?.message || "").trim();

    if (!companyName || !contactName || !email) {
      return res.status(400).json({
        message: "company_name, contact_name, and email are required.",
      });
    }

    const inquiry = await createPartnershipInquiry({
      userId: req.user.id,
      companyName,
      contactName,
      email,
      message,
    });

    await logActivity({
      actorType: "user",
      actorId: req.user.id,
      action: "partnership.inquiry.create",
      targetType: "partnership",
      targetId: inquiry.id,
    });

    return res.status(201).json({
      message: "Partnership inquiry submitted.",
      inquiry,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  submitPartnershipInquiry,
};
