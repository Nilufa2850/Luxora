// Server/controllers/shop/order-controller.js

const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    // Basic validation (can be more extensive)
    if (!userId || !cartItems || !cartItems.length || !addressInfo || !totalAmount) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields for order creation."
        });
    }

    // For PayPal payments, create the payment object
    if (paymentMethod === 'paypal') {
        const create_payment_json = {
            intent: "sale",
            payer: {
                payment_method: "paypal",
            },
            redirect_urls: {
                return_url: "http://localhost:5173/shop/paypal-return", // Ensure this matches your frontend route
                cancel_url: "http://localhost:5173/shop/paypal-cancel", // Ensure this matches your frontend route
            },
            transactions: [
                {
                    item_list: {
                        items: cartItems.map((item) => ({
                            name: item.title,
                            sku: item.productId, // Assuming productId is unique enough for SKU
                            price: item.price.toFixed(2),
                            currency: "USD", // Consider making currency dynamic if needed
                            quantity: item.quantity,
                        })),
                    },
                    amount: {
                        currency: "USD",
                        total: totalAmount.toFixed(2),
                    },
                    description: "Luxora Order", // More descriptive
                },
            ],
        };

        paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
            if (error) {
                console.error("Error creating PayPal payment:", error.response ? error.response : error);
                return res.status(500).json({
                    success: false,
                    message: "Error while creating PayPal payment. Please try again.",
                });
            } else {
                try {
                    const newlyCreatedOrder = new Order({
                        userId,
                        cartId,
                        cartItems, 
                        addressInfo,
                        orderStatus: orderStatus || 'pending_payment', 
                        paymentMethod,
                        paymentStatus: paymentStatus || 'pending', 
                        totalAmount,
                        orderDate: orderDate || new Date(),
                        orderUpdateDate: orderUpdateDate || new Date(),
                        paymentId: paymentInfo.id, 
                    });

                    await newlyCreatedOrder.save();

                    const approvalURL = paymentInfo.links.find(
                        (link) => link.rel === "approval_url"
                    ).href;

                    res.status(201).json({
                        success: true,
                        approvalURL,
                        orderId: newlyCreatedOrder._id,
                    });
                } catch (dbError) {
                    console.error("Error saving order after PayPal payment creation:", dbError);
                    
                    res.status(500).json({
                        success: false,
                        message: "Order created with payment, but failed to save. Please contact support.",
                    });
                }
            }
        });
    } else {
        
        const newlyCreatedOrder = new Order({
            userId,
            cartId,
            cartItems,
            addressInfo,
            orderStatus: orderStatus || 'processing', 
            paymentMethod,
            paymentStatus: paymentStatus || 'pending',
            totalAmount,
            orderDate: orderDate || new Date(),
            orderUpdateDate: orderUpdateDate || new Date(),
            paymentId, 
            payerId,   
        });

        await newlyCreatedOrder.save();
        

        if (cartId) {
            await Cart.findByIdAndDelete(cartId);
        }
        // Update product stock
        for (let item of cartItems) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { totalStock: -item.quantity } });
        }

        res.status(201).json({
            success: true,
            message: "Order created successfully!",
            orderId: newlyCreatedOrder._id,
            data: newlyCreatedOrder
        });
    }
  } catch (e) {
    console.error("Error in createOrder:", e);
    res.status(500).json({
      success: false,
      message: "Server error while creating order. Please try again.",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, PayerID, orderId } = req.body; // Note: PayPal often returns PayerID (capitalized)

    if (!paymentId || !PayerID || !orderId) {
        return res.status(400).json({
            success: false,
            message: "Missing paymentId, PayerID, or orderId for payment capture."
        });
    }

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order cannot be found",
      });
    }

    if (order.paymentStatus === 'paid') {
        return res.status(400).json({
            success: false,
            message: "This order has already been paid."
        });
    }

    const execute_payment_json = {
      payer_id: PayerID,
      transactions: [
        {
          amount: {
            currency: "USD", 
            total: order.totalAmount.toFixed(2), 
          },
        },
      ],
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        console.error("Error capturing PayPal payment:", error.response ? error.response : error);
        order.paymentStatus = 'failed';
        await order.save();
        return res.status(500).json({
          success: false,
          message: "Error capturing payment. Please try again or contact support.",
        });
      } else {
        // console.log("PayPal Payment Captured:", JSON.stringify(payment));
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed"; // Or 'processing' if further steps needed
        order.paymentId = payment.id; // Update with final payment ID
        order.payerId = PayerID; // Store PayerID
        order.orderUpdateDate = new Date();

        // Deduct stock
        for (let item of order.cartItems) {
          let product = await Product.findById(item.productId);
          if (product) { 
            if (product.totalStock < item.quantity) {
                
                console.error(`Insufficient stock for product ${product.title} (ID: ${item.productId}) during order ${orderId} confirmation.`);
                
            }
            product.totalStock -= item.quantity;
            if (product.totalStock < 0) product.totalStock = 0; 
            await product.save();
          }
        }

        // Delete the cart
        if (order.cartId) {
            await Cart.findByIdAndDelete(order.cartId);
        }
        
        await order.save();

        res.status(200).json({
          success: true,
          message: "Payment successful and order confirmed!",
          data: order,
        });
      }
    });
  } catch (e) {
    console.error("Error in capturePayment:", e);
    res.status(500).json({
      success: false,
      message: "Server error during payment capture. Please try again.",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  console.log("==== getAllOrdersByUser Controller Reached ===="); 
  try {
    const { userId } = req.params;
    console.log(`Fetching orders for userId: ${userId}`); 

    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }); 
    console.log(`Found ${orders.length} orders for userId: ${userId}`); 

    if (!orders.length) {
      console.log("No orders found for this user, returning 200 with empty array."); 
      return res.status(200).json({
        success: true,
        message: "No orders found for this user.", 
        data: [], // Send an empty array
      });
    }
    

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.error("Error in getAllOrdersByUser:", e);
    res.status(500).json({
      success: false,
      message: "Error fetching user orders.",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params; 

    if (!id) {
        return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    
    const order = await Order.findById(id).populate({
        path: 'cartItems.productId',
        select: 'title image price salePrice' 
    });

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
    console.error("Error in getOrderDetails:", e);
    res.status(500).json({
      success: false,
      message: "Error fetching order details.",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
