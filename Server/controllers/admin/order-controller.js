// controllers/admin/order-controller.js

const Order = require("../../models/Order");

const getAllOrdersOfAllUsers = async (req, res) => {
  console.log("==== getAllOrdersOfAllUsers Controller Reached ===="); // Keep for debugging
  try {
    const orders = await Order.find({});
    console.log("Orders found in DB:", orders); // Keep for debugging

    // --- MODIFIED BLOCK ---
    if (!orders.length) { 
      console.log("No orders found in DB, returning 200 with empty array."); // Keep for debugging
      // Changed from 404 to 200 and added data: []
      return res.status(200).json({ 
        success: true,
        message: "No orders found!", 
        data: [] // Return empty array
      });
    }
    // --- END MODIFIED BLOCK ---

    // This part runs if orders ARE found
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.error("Error fetching all orders:", e); // Changed to console.error
    res.status(500).json({
      success: false,
      message: "Error fetching all orders!", 
    });
  }
};

// --- Other functions remain the same ---

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e); // Consider changing to console.error(e)
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Ensure you have validation for valid orderStatus values if needed
    await Order.findByIdAndUpdate(id, { orderStatus }, { new: true }); // Added {new: true} optionally

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e); // Consider changing to console.error(e)
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// --- Exports remain the same ---
module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};




// const Order = require("../../models/Order");

// const getAllOrdersOfAllUsers = async (req, res) => {
//   console.log("==== getAllOrdersOfAllUsers Controller Reached ====");
//   try {
//     const orders = await Order.find({});
//     console.log("Orders found in DB:", orders);

//     if (!orders.length) {
//       console.log("No orders found in DB, returning 404.");
//       return res.status(404).json({
//         success: false,
//         message: "No orders found!",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: orders,
//     });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching all orders!",
//     });
//   }
// };

// const getOrderDetailsForAdmin = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found!",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured!",
//     });
//   }
// };

// const updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { orderStatus } = req.body;

//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found!",
//       });
//     }

//     await Order.findByIdAndUpdate(id, { orderStatus });

//     res.status(200).json({
//       success: true,
//       message: "Order status is updated successfully!",
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured!",
//     });
//   }
// };

// module.exports = {
//   getAllOrdersOfAllUsers,
//   getOrderDetailsForAdmin,
//   updateOrderStatus,
// };