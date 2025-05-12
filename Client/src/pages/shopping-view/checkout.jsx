
import Address from "@/components/shopping-view/address";
import img from "../../assets/account.png";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createNewOrder, clearApprovalURL } from "@/store/shop/order-slice";

import { toast } from "sonner";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL, loading: orderLoading, error: orderError } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const dispatch = useDispatch();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleInitiatePaypalPayment() {
    if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
      toast.error("Your cart is empty. Please add items to proceed.");
      return;
    }
    if (currentSelectedAddress === null) {
      toast.error("Please select an address to proceed.");
      return;
    }

    setIsPaymentStart(true);

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId?._id || singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending_payment",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
    };

    dispatch(createNewOrder(orderData))
      .unwrap()
      .then((data) => {
        if (data?.success && data.approvalURL) {
          
        } else {
          toast.error(data?.message || "Failed to initiate PayPal payment. Please try again.");
          setIsPaymentStart(false);
        }
      })
      .catch((error) => {
        console.error("Error initiating PayPal payment:", error);
        toast.error(error?.message || "An unexpected error occurred. Please try again.");
        setIsPaymentStart(false);
      });
  }

  useEffect(() => {
    if (approvalURL) {
      window.location.href = approvalURL;
      dispatch(clearApprovalURL()); 
    }
  }, [approvalURL, dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <div className="relative h-[200px] sm:h-[250px] md:h-[300px] w-full overflow-hidden">
        <img 
            src={img} 
            alt="Checkout banner" 
            className="h-full w-full object-cover object-center" 
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Checkout</h1>
        </div>
      </div>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          <div className="md:col-span-7 lg:col-span-8">
            <Address
              selectedId={currentSelectedAddress?._id}
              setCurrentSelectedAddress={setCurrentSelectedAddress}
            />
          </div>

          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-card p-6 rounded-lg shadow-lg sticky top-24">
              <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-card-foreground">Order Summary</h2>
              {cartItems && cartItems.items && cartItems.items.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 mb-4 ">
                  {cartItems.items.map((item) => (
                    <UserCartItemsContent key={item.productId?._id || item.productId} cartItem={item} isCheckout={true} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              )}
              <div className="mt-6 space-y-3 border-t pt-6">
                <div className="flex justify-between text-lg">
                  <span className="font-medium text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">${totalCartAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-3 mt-3">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">${totalCartAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-8 w-full">
                <Button 
                    onClick={handleInitiatePaypalPayment} 
                    className="w-full text-lg py-3"
                    disabled={isPaymentStart || orderLoading || (!cartItems || !cartItems.items || cartItems.items.length === 0) || !currentSelectedAddress}
                >
                  {isPaymentStart || orderLoading
                    ? "Processing Payment..."
                    : "Checkout with PayPal"}
                </Button>
                {orderError && <p className="text-red-500 text-sm mt-2 text-center">{orderError}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
