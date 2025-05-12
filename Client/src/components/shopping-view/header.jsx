import { Slack, LogOut, Menu, ShoppingCart, User } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { 
    Sheet, 
    SheetContent, 
    SheetTrigger, 
    SheetHeader, 
    SheetTitle,   
    SheetDescription 
} from "../ui/sheet"; 
import { Button } from "../ui/button"; 
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"; 
import { Avatar, AvatarFallback } from "../ui/avatar"; 
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper"; 
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label"; 

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    if (location.pathname.includes("listing") && currentFilter !== null) {
      setSearchParams(
        new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
      );
    } else {
      navigate(getCurrentMenuItem.path);
    }
  }

  return (
    
    <nav className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-md font-medium cursor-pointer hover:opacity-50" 
          key={menuItem.id}
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    if (user?.id) { 
        dispatch(fetchCartItems(user?.id));
    }
  }, [dispatch, user?.id]); 


  return (
    
    <div className="flex flex-col items-start lg:flex-row lg:items-center gap-4 mt-4 lg:mt-0">
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}> 
        <button
          onClick={() => setOpenCartSheet(true)}
          className="relative p-1" 
          id="cart-btn"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-6 w-6 left-10" /> 
          {cartItems?.items?.length > 0 && ( 
            <span className="absolute top-[-3px] right-[8px] font-bold text-sm">
              {cartItems.items.length}
            </span>
          )}
          <span className="sr-only">User cart</span>
        </button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          }
        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-black cursor-pointer h-8 w-8"> 
            <AvatarFallback className="bg-black text-white font-extrabold cursor-pointer text-sm"> 
              {user?.userName ? user.userName[0].toUpperCase() : <User className="h-4 w-4"/>}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56" align="end">
          <DropdownMenuLabel>Logged in as {user?.userName || "Guest"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <User className="mr-2 h-4 w-4" />
            <span>Account</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        
        <Link to="/shop/home" className="flex items-center gap-2 text-2xl pl-2">
          <Slack className="h-6 w-6 text-black "  /> 
          <span className="font-bold text-black">Luxora</span>
        </Link>
        
        <div className="hidden lg:flex flex-1 justify-center"> 
          <MenuItems />
        </div>

        
        <div className="flex items-center"> 
            <div className="hidden lg:flex"> 
                <HeaderRightContent />
            </div>

            <div className="lg:hidden"> 
            <Sheet>
                <SheetTrigger asChild>
                
                <button variant="outline" size="icon" className="lg:hidden" style={{border:"none"}} aria-label="Open menu"> 
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle header menu</span>
                </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs"> 
                <SheetHeader className="p-4 border-b"> 
                    <SheetTitle className="text-lg font-semibold">
                    Menu 
                    </SheetTitle>
                    <SheetDescription>
                        Main navigation
                    </SheetDescription>
                </SheetHeader>
                <div className="p-4"> 
                    <MenuItems /> 
                    <HeaderRightContent /> 
                </div>
                </SheetContent>
            </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
