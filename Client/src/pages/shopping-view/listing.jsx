

import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }
  return queryParams.join("&");
}

function ShoppingListing() {
  const dispatch = useDispatch();
  const { productList, productDetails, loading, error } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [currentSortBy, setCurrentSortBy] = useState("price-lowtohigh");
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const categorySearchParam = searchParams.get("category");
  const brandSearchParam = searchParams.get("brand");

  function handleSort(value) {
    setCurrentSortBy(value);
  }

  function handleFilter(sectionId, optionId, isChecked) {
    setFilters((prevFilters) => {
      const updatedSectionFilters = prevFilters[sectionId] ? [...prevFilters[sectionId]] : [];
      if (isChecked) {
        if (!updatedSectionFilters.includes(optionId)) {
          updatedSectionFilters.push(optionId);
        }
      } else {
        const index = updatedSectionFilters.indexOf(optionId);
        if (index > -1) {
          updatedSectionFilters.splice(index, 1);
        }
      }
      const newFilters = {
        ...prevFilters,
        [sectionId]: updatedSectionFilters,
      };
      sessionStorage.setItem("filters", JSON.stringify(newFilters));
      return newFilters;
    });
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

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
        console.error("Add to cart error:", err);
        toast.error(err?.message || "An error occurred while adding to cart.");
    });
  }

  useEffect(() => {
    const initialFiltersFromSession = JSON.parse(sessionStorage.getItem("filters")) || {};
    let initialFilters = { category: [], brand: [] };

    if (categorySearchParam) {
      initialFilters.category = categorySearchParam.split(',');
    } else if (initialFiltersFromSession.category) {
      initialFilters.category = initialFiltersFromSession.category;
    }

    if (brandSearchParam) {
        initialFilters.brand = brandSearchParam.split(',');
    } else if (initialFiltersFromSession.brand) {
        initialFilters.brand = initialFiltersFromSession.brand;
    }
    
    setFilters(initialFilters);
  }, [categorySearchParam, brandSearchParam]);

  useEffect(() => {
    const queryString = createSearchParamsHelper(filters);
    setSearchParams(new URLSearchParams(queryString));
  }, [filters, setSearchParams]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0 && currentSortBy) {
      dispatch(
        fetchAllFilteredProducts({ filterParams: filters, sortParams: currentSortBy })
      );
    } else if (currentSortBy && (!filters || Object.keys(filters).length === 0)) {
      dispatch(
        fetchAllFilteredProducts({ filterParams: {}, sortParams: currentSortBy })
      );
    }
  }, [dispatch, currentSortBy, filters]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    
    <div className="p-4 md:p-6"> 
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6"> 
        <aside> 
            <ProductFilter filters={filters} handleFilter={handleFilter} />
        </aside>
        <div className="bg-background w-full rounded-lg shadow-sm border">
            <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold">All Products</h2> 
            <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                {productList?.length || 0} Products
                </span>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                    
                    size="sm"
                    className="flex items-center gap-1" 
                    >
                    <ArrowUpDownIcon className="h-4 w-4" />
                    <span>Sort by</span> 
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuRadioGroup value={currentSortBy} onValueChange={handleSort}>
                    {sortOptions.map((sortItem) => (
                        <DropdownMenuRadioItem
                        value={sortItem.id}
                        key={sortItem.id}
                        >
                        {sortItem.label}
                        </DropdownMenuRadioItem>
                    ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
            </div>
            {loading && <p className="text-center text-muted-foreground py-10">Loading products...</p>}
            {error && <p className="text-center text-red-500 py-10">Error loading products: {error}</p>}
            {!loading && !error && (
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"> 
                {productList && productList.length > 0
                    ? productList.map((productItem) => (
                        <ShoppingProductTile
                            key={productItem._id || productItem.id}
                            handleGetProductDetails={handleGetProductDetails}
                            product={productItem}
                            handleAddtoCart={handleAddtoCart}
                        />
                    ))
                    : <p className="col-span-full text-center text-muted-foreground py-10">No products match your current filters.</p>
                }
                </div>
            )}
        </div>
        <ProductDetailsDialog
            open={openDetailsDialog}
            setOpen={setOpenDetailsDialog}
            productDetails={productDetails}
        />
        </div>
    </div>
  );
}

export default ShoppingListing;
