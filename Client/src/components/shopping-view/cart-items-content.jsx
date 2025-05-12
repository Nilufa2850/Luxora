import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity, fetchCartItems } from "@/store/shop/cart-slice";

import { toast } from "sonner";

function UserCartItemsContent({ cartItem, isCheckout = false }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction === "plus") {
      
    }

    const newQuantity = typeOfAction === "plus"
        ? getCartItem?.quantity + 1
        : getCartItem?.quantity - 1;

    if (newQuantity < 1 && typeOfAction === "minus") {
        return;
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId?._id || getCartItem?.productId,
        quantity: newQuantity,
      })
    )
    .unwrap()
    .then((data) => {
      if (data?.success) {
        toast.success("Cart item quantity updated!");
        dispatch(fetchCartItems(user?.id));
      } else {
        toast.error(data?.message || "Failed to update quantity.");
      }
    })
    .catch(error => {
        console.error("Error updating cart quantity:", error);
        toast.error(error?.message || "An error occurred while updating quantity.");
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId?._id || getCartItem?.productId })
    )
    .unwrap()
    .then((data) => {
      if (data?.payload?.success) {
        toast.success("Cart item deleted successfully!");
        dispatch(fetchCartItems(user?.id));
      } else {
        toast.error(data?.payload?.message || "Failed to delete item.");
      }
    })
    .catch(error => {
        console.error("Error deleting cart item:", error);
        toast.error(error?.message || "An error occurred while deleting item.");
    });
  }

  if (!cartItem || !cartItem.productId) {
    return null; 
  }

  const displayItem = cartItem.productId && typeof cartItem.productId === 'object' 
    ? cartItem.productId 
    : cartItem;

  return (
    <div className="flex items-center space-x-3 sm:space-x-4 p-3 bg-card rounded-md shadow-sm">
      <img
        src={displayItem?.image || cartItem?.image}
        alt={displayItem?.title}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{displayItem?.title}</h3>
        {!isCheckout && (
            <div className="flex items-center gap-2 mt-1">
            <Button
                variant="outline"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0"
                size="icon"
                disabled={cartItem?.quantity === 1}
                onClick={() => handleUpdateQuantity(cartItem, "minus")}
            >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="sr-only">Decrease quantity</span>
            </Button>
            <span className="font-medium text-sm sm:text-base w-6 text-center">{cartItem?.quantity}</span>
            <Button
                variant="outline"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0"
                size="icon"
                onClick={() => handleUpdateQuantity(cartItem, "plus")}
            >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="sr-only">Increase quantity</span>
            </Button>
            </div>
        )}
        {isCheckout && (
             <p className="text-sm text-muted-foreground mt-1">Quantity: {cartItem?.quantity}</p>
        )}
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <p className="font-semibold text-sm sm:text-base text-foreground">
          $
          {(
            (parseFloat(displayItem?.salePrice) > 0 ? parseFloat(displayItem?.salePrice) : parseFloat(displayItem?.price)) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        {!isCheckout && (
            <Button 
                variant="" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive h-7 w-7 sm:h-8 sm:w-8 mt-1"
                onClick={() => handleCartItemDelete(cartItem)}
            >
                <Trash className="cursor-pointer w-4 h-4 sm:w-5 sm:h-5 text-white " />
                <span className="sr-only">Delete item</span>
            </Button>
        )}
        
      </div>
    </div>
  );
}

export default UserCartItemsContent;
