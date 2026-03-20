// const express = require("express");
// const router = express.Router();
// const SupportTicket = require("../models/SupportTicket");

// // CREATE TICKET
// router.post("/", async (req, res) => {
//   try {
//     const count = await SupportTicket.countDocuments();
//     const ticket = await SupportTicket.create({
//       ...req.body,
//       ticketId: `TKT-${count + 1}`,
//     });

//     res.json({ success: true, data: ticket });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // GET ALL TICKETS
// router.get("/", async (req, res) => {
//   const tickets = await SupportTicket.find().populate("user", "name email");
//   res.json({ success: true, data: tickets });
// });

// // UPDATE STATUS
// router.put("/:id", async (req, res) => {
//   const ticket = await SupportTicket.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     { new: true }
//   );
//   res.json({ success: true, data: ticket });
// });

// // DELETE
// router.delete("/:id", async (req, res) => {
//   await SupportTicket.findByIdAndDelete(req.params.id);
//   res.json({ success: true });
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const SupportTicket = require("../models/SupportTicket");

/* ================= CREATE ================= */
router.post("/", async (req, res) => {
  try {
    const count = await SupportTicket.countDocuments();

    const ticket = await SupportTicket.create({
      ...req.body,
      ticketId: `TKT-${count + 1}`,
    });

    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ================= LIST ================= */
router.get("/", async (req, res) => {
  const tickets = await SupportTicket.find()
    .populate("user", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: tickets });
});

/* ================= ASSIGN ================= */
router.put("/assign/:id", async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    {
      assignedTo: req.body.assignedTo,
      status: "in_progress",
    },
    { new: true }
  );

  res.json({ success: true, data: ticket });
});

/* ================= RESOLVE ================= */
router.put("/resolve/:id", async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { status: "resolved" },
    { new: true }
  );

  res.json({ success: true, data: ticket });
});

/* ================= DELETE ================= */
router.delete("/:id", async (req, res) => {
  await SupportTicket.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
