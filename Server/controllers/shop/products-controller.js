
const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    
    const categoryQuery = req.query.category || [];
    const brandQuery = req.query.brand || [];
    const sortBy = req.query.sortBy || "price-lowtohigh"; 

    let filters = {};

    
    if (categoryQuery.length > 0) {
      filters.category = { $in: Array.isArray(categoryQuery) ? categoryQuery : categoryQuery.split(",") };
    }

    
     if (brandQuery.length > 0) {
      filters.brand = { $in: Array.isArray(brandQuery) ? brandQuery : brandQuery.split(",") };
    }

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort = { price: 1 };
        break;
      case "price-hightolow":
        sort = { price: -1 };
        break;
      case "title-atoz":
        sort = { title: 1 };
        break;
      case "title-ztoa":
        sort = { title: -1 };
        break;
      default:
        sort = { price: 1 }; 
        break;
    }

    const products = await Product.find(filters).sort(sort);

    res.status(200).json({
      success: true,
      data: products,
    });

  } catch (e) {
    console.error("Error in getFilteredProducts:", e); 
    res.status(500).json({
      success: false,
      message: "Error filtering products!",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }
     
    res.status(200).json({
      success: true,
      data: product,
    });

  } catch (e) { 
    console.error("Error in getProductDetails:", e); 
    res.status(500).json({
      success: false,
      message: "Error getting product details!", 
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };