import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { searchResults, loading, error } = useSelector((state) => state.shopSearch);
  const { productDetails } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const keywordFromUrl = searchParams.get("keyword");
    if (keywordFromUrl) {
      setKeyword(keywordFromUrl);
    }
  }, []); 

  useEffect(() => {
    const trimmedKeyword = keyword.trim();
    const debounceTimer = setTimeout(() => {
      if (trimmedKeyword !== "" && trimmedKeyword.length > 2) {
        setSearchParams({ keyword: trimmedKeyword });
        dispatch(getSearchResults(trimmedKeyword));
      } else if (trimmedKeyword === "" && searchParams.get("keyword")) {
        setSearchParams({});
        dispatch(resetSearchResults());
      } else if (trimmedKeyword.length > 0 && trimmedKeyword.length <=2) {
        dispatch(resetSearchResults());
      }
    }, 700); 

    return () => clearTimeout(debounceTimer);
  }, [keyword, dispatch, setSearchParams, searchParams]);


  function handleAddtoCart(getCurrentProductId) {
    if (!user?.id) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).unwrap()
     .then((data) => {
      if (data?.success) {
        dispatch(fetchCartItems(user?.id));
        toast.success(data?.message || "Product added to cart!");
      } else {
        toast.error(data?.message || "Failed to add product to cart.");
      }
    }).catch(err => {
      console.error("Add to cart error in SearchProducts:", err);
      toast.error(err?.message || "An error occurred while adding to cart.");
    });
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="w-full md:w-2/3 lg:w-1/2"> 
          <Input
            value={keyword}
            name="keyword"
            onChange={(event) => setKeyword(event.target.value)}
            className="py-3 px-4 text-base" 
            placeholder="Search Products..."
          />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="border rounded-lg p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-red-600">Error Searching Products</h2>
            <p className="text-gray-600">{error}</p>
        </div>
      )}

      {!loading && !error && searchResults && searchResults.length === 0 && keyword.trim().length > 2 && (
         <div className="text-center py-10">
            <h2 className="text-xl font-semibold">No Results Found</h2>
            <p className="text-gray-600">Try a different search term.</p>
        </div>
      )}
      
      {!loading && !error && searchResults && searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {searchResults.map((item) => (
            <ShoppingProductTile
              key={item._id || item.id}
              handleAddtoCart={handleAddtoCart}
              product={item}
              handleGetProductDetails={handleGetProductDetails}
            />
          ))}
        </div>
      )}
      
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default SearchProducts;

