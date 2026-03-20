// const mongoose = require("mongoose");

// const SupportTicketSchema = new mongoose.Schema(
//   {
//     ticketId: { type: String, required: true, unique: true },

//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     subject: { type: String, required: true },
//     description: { type: String, required: true },

//     priority: {
//       type: String,
//       enum: ["low", "medium", "high"],
//       default: "medium",
//     },

//     status: {
//       type: String,
//       enum: ["open", "in_progress", "resolved"],
//       default: "open",
//     },

//     assignedTo: { type: String, default: null },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("SupportTicket", SupportTicketSchema);
const mongoose = require("mongoose");

const SupportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: { type: String, required: true },
    description: { type: String, required: true },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },

    assignedTo: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", SupportTicketSchema);
