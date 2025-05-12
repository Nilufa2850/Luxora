import { Button } from "@/components/ui/button";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { toast } from "sonner"; 
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        
        toast.success("Product is added to cart"); 
      }
    }).catch(error => {
        console.error("Add to cart error:", error);
        toast.error("An error occurred while adding to cart.");
    });
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    if (featureImageList && featureImageList.length > 0) {
        const timer = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
        }, 4000); 
        return () => clearInterval(timer);
    }
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh", 
      })
    );
    dispatch(getFeatureImages()); 
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Section */}
      <div className="relative w-full h-[550px] overflow-hidden">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((slide, index) => (
              <img
                src={slide?.image}
                key={slide?._id || slide?.id || index} 
                alt={`Banner Image ${index + 1}`} 
                className={`${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                } absolute top-0 left-0 w-full h-full  object-cover transition-opacity duration-1000`}
              />
            ))
          : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><p>Loading Banners...</p></div>
           }
        {featureImageList && featureImageList.length > 1 && (
          <>
            <button
              id="left-slide-btn"
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentSlide(
                  (prevSlide) =>
                    (prevSlide - 1 + featureImageList.length) %
                    featureImageList.length
                )
              }
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 " 
              aria-label="Previous slide" 
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              id="right-slide-btn"
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentSlide(
                  (prevSlide) => (prevSlide + 1) % featureImageList.length
                )
              }
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white" 
              aria-label="Next slide" 
            >
              <ChevronRightIcon className="w-4 h-4 " />
            </button>
          </>
        )}
      </div>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
               
                key={categoryItem.id} 
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <categoryItem.icon className="w-12 h-12 mb-4 text-primary" aria-hidden="true" />
                  <span className="font-bold text-center">{categoryItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandsWithIcon.map((brandItem) => (
              <Card
                // MAIN CHANGE: Added key prop
                key={brandItem.id} 
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brandItem.icon className="w-12 h-12 mb-4 text-primary" aria-hidden="true"/>
                  <span className="font-bold text-center">{brandItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.map((productItem) => (
                  <ShoppingProductTile
                    // MAIN CHANGE: Added key prop
                    key={productItem._id || productItem.id} 
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
              : <p className="col-span-full text-center">Loading products...</p> 
               }
          </div>
        </div>
      </section>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;




// import bannerOne from "../../assets/banner-1.webp";
// import bannerTwo from "../../assets/banner-2.webp";
// import bannerThree from "../../assets/banner-3.webp";
// import {
//   Airplay,
//   BabyIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   CloudLightning,
//   Heater,
//   Images,
//   Shirt,
//   ShirtIcon,
//   ShoppingBasket,
//   UmbrellaIcon,
//   WashingMachine,
//   WatchIcon,
// } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchAllFilteredProducts,
//   fetchProductDetails,
// } from "@/store/shop/products-slice";
// import ShoppingProductTile from "@/components/shopping-view/product-tile";
// import { useNavigate } from "react-router-dom";
// import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";

// import { toast } from "sonner";
// import ProductDetailsDialog from "@/components/shopping-view/product-details";
// import { getFeatureImages } from "@/store/common-slice";

// const categoriesWithIcon = [
//   { id: "men", label: "Men", icon: ShirtIcon },
//   { id: "women", label: "Women", icon: CloudLightning },
//   { id: "kids", label: "Kids", icon: BabyIcon },
//   { id: "accessories", label: "Accessories", icon: WatchIcon },
//   { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
// ];

// const brandsWithIcon = [
//   { id: "nike", label: "Nike", icon: Shirt },
//   { id: "adidas", label: "Adidas", icon: WashingMachine },
//   { id: "puma", label: "Puma", icon: ShoppingBasket },
//   { id: "levi", label: "Levi's", icon: Airplay },
//   { id: "zara", label: "Zara", icon: Images },
//   { id: "h&m", label: "H&M", icon: Heater },
// ];
// function ShoppingHome() {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const { productList, productDetails } = useSelector(
//     (state) => state.shopProducts
//   );
//   const { featureImageList } = useSelector((state) => state.commonFeature);

//   const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

//   const { user } = useSelector((state) => state.auth);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   function handleNavigateToListingPage(getCurrentItem, section) {
//     sessionStorage.removeItem("filters");
//     const currentFilter = {
//       [section]: [getCurrentItem.id],
//     };

//     sessionStorage.setItem("filters", JSON.stringify(currentFilter));
//     navigate(`/shop/listing`);
//   }

//   function handleGetProductDetails(getCurrentProductId) {
//     dispatch(fetchProductDetails(getCurrentProductId));
//   }

//   function handleAddtoCart(getCurrentProductId) {
//     dispatch(
//       addToCart({
//         userId: user?.id,
//         productId: getCurrentProductId,
//         quantity: 1,
//       })
//     ).then((data) => {
//       if (data?.payload?.success) {
//         dispatch(fetchCartItems(user?.id));
//         toast({
//           title: "Product is added to cart",
//         });
//       }
//     });
//   }

//   useEffect(() => {
//     if (productDetails !== null) setOpenDetailsDialog(true);
//   }, [productDetails]);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
//     }, 15000);

//     return () => clearInterval(timer);
//   }, [featureImageList]);

//   useEffect(() => {
//     dispatch(
//       fetchAllFilteredProducts({
//         filterParams: {},
//         sortParams: "price-lowtohigh",
//       })
//     );
//   }, [dispatch]);

//   console.log(productList, "productList");

//   useEffect(() => {
//     dispatch(getFeatureImages());
//   }, [dispatch]);

//   return (
//     <div className="flex flex-col min-h-screen">
//       <div className="relative w-full h-[600px] overflow-hidden">
//         {featureImageList && featureImageList.length > 0
//           ? featureImageList.map((slide, index) => (
//               <img
//                 src={slide?.image}
//                 key={index}
//                 className={`${
//                   index === currentSlide ? "opacity-100" : "opacity-0"
//                 } absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000`}
//               />
//             ))
//           : null}
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={() =>
//             setCurrentSlide(
//               (prevSlide) =>
//                 (prevSlide - 1 + featureImageList.length) %
//                 featureImageList.length
//             )
//           }
//           className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80"
//         >
//           <ChevronLeftIcon className="w-4 h-4" />
//         </Button>
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={() =>
//             setCurrentSlide(
//               (prevSlide) => (prevSlide + 1) % featureImageList.length
//             )
//           }
//           className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
//         >
//           <ChevronRightIcon className="w-4 h-4" />
//         </Button>
//       </div>
//       <section className="py-12 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-8">
//             Shop by category
//           </h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//             {categoriesWithIcon.map((categoryItem) => (
//               <Card
//                 onClick={() =>
//                   handleNavigateToListingPage(categoryItem, "category")
//                 }
//                 className="cursor-pointer hover:shadow-lg transition-shadow"
//               >
//                 <CardContent className="flex flex-col items-center justify-center p-6">
//                   <categoryItem.icon className="w-12 h-12 mb-4 text-primary" />
//                   <span className="font-bold">{categoryItem.label}</span>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="py-12 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             {brandsWithIcon.map((brandItem) => (
//               <Card
//                 onClick={() => handleNavigateToListingPage(brandItem, "brand")}
//                 className="cursor-pointer hover:shadow-lg transition-shadow"
//               >
//                 <CardContent className="flex flex-col items-center justify-center p-6">
//                   <brandItem.icon className="w-12 h-12 mb-4 text-primary" />
//                   <span className="font-bold">{brandItem.label}</span>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="py-12">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-8">
//             Feature Products
//           </h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {productList && productList.length > 0
//               ? productList.map((productItem) => (
//                   <ShoppingProductTile
//                     handleGetProductDetails={handleGetProductDetails}
//                     product={productItem}
//                     handleAddtoCart={handleAddtoCart}
//                   />
//                 ))
//               : null}
//           </div>
//         </div>
//       </section>
//       <ProductDetailsDialog
//         open={openDetailsDialog}
//         setOpen={setOpenDetailsDialog}
//         productDetails={productDetails}
//       />
//     </div>
//   );
// }

// export default ShoppingHome;