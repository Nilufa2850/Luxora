
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription
} from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content"; 

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (parseFloat(currentItem?.salePrice) > 0
              ? parseFloat(currentItem?.salePrice)
              : parseFloat(currentItem?.price)) *
              currentItem?.quantity,
          0
        )
      : 0;

  return (
    <SheetContent className="sm:max-w-md w-full flex flex-col">
      <SheetHeader className="p-6 border-b">
        <SheetTitle className="text-2xl font-semibold text-foreground">Your Cart</SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          Review items in your cart.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-grow overflow-y-auto min-h-0 p-6 space-y-4 -mt-6">
        

        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <UserCartItemsContent 
                key={item.productId?._id || item.productId || item._id || Math.random()}
                cartItem={item} 
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-10">Your cart is empty.</p>
        )}


      </div>

      {cartItems && cartItems.length > 0 && ( 
        <div className="border-t p-6 space-y-4">
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-foreground">${totalCartAmount.toFixed(2)}</span>
          </div>
          <Button
            onClick={() => {
              navigate("/shop/checkout");
              setOpenCartSheet(false);
            }}
            className="w-full text-lg py-3"
            disabled={totalCartAmount === 0}
          >
            Checkout
          </Button>
        </div>
      )}
     
      {(!cartItems || cartItems.length === 0) && (
           <div className="flex-grow flex items-center justify-center">
                <p className="text-center text-muted-foreground py-10"></p>
           </div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;


// import { useNavigate } from "react-router-dom";
// import { Button } from "../ui/button";
// import { 
//     SheetContent, 
//     SheetHeader, 
//     SheetTitle, 
//     SheetDescription 
// } from "../ui/sheet";
// import UserCartItemsContent from "./cart-items-content";

// function UserCartWrapper({ cartItems, setOpenCartSheet }) {
//   const navigate = useNavigate();

//   const totalCartAmount =
//     cartItems && cartItems.length > 0
//       ? cartItems.reduce(
//           (sum, currentItem) =>
//             sum +
//             (parseFloat(currentItem?.salePrice) > 0
//               ? parseFloat(currentItem?.salePrice)
//               : parseFloat(currentItem?.price)) *
//               currentItem?.quantity,
//           0
//         )
//       : 0;

//   return (
//     <SheetContent className="sm:max-w-md"> 
//       <SheetHeader>
//         <SheetTitle>Your Cart</SheetTitle>
        
//         <SheetDescription>
//           Review items in your cart.
//         </SheetDescription>
//       </SheetHeader>
      
//       <div className="mt-8 space-y-4"> 
//         {cartItems && cartItems.length > 0 ? (
//           cartItems.map((item) => (
//             <UserCartItemsContent 
                
//                 key={item.productId?._id || item.productId || item._id || Math.random()}
//                 cartItem={item} 
//             />
//           ))
//         ) : (
//           <p className="text-center text-muted-foreground py-10">Your cart is empty.</p>
//         )}
//       </div>

      
//       {cartItems && cartItems.length > 0 && (
//         <>
//           <div className="mt-8 space-y-4 mx-4">
//             <div className="flex justify-between">
//               <span className="font-bold">Total</span>
//               <span className="font-bold">${totalCartAmount.toFixed(2)}</span>
//             </div>
//           </div>
//           <Button
//             onClick={() => {
//               navigate("/shop/checkout");
//               setOpenCartSheet(false);
//             }}
//             className="w-full mt-6 " 
//             disabled={totalCartAmount === 0}
//           >
//             Checkout
//           </Button>
//         </>
//       )}
//     </SheetContent>
//   );
// }

// export default UserCartWrapper;