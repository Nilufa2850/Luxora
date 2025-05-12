import {
  ShoppingBag,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription // <-- IMPORT ADDED
} from "../ui/sheet"; // <-- Make sure path to ui/sheet is correct

const adminSidebarMenuItems = [
  // ... (menu items remain the same) ...
  { id: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard />, },
  { id: "products", label: "Products", path: "/admin/products", icon: <ShoppingCart />, },
  { id: "orders", label: "Orders", path: "/admin/orders", icon: <ShoppingBag />, },
];

// MenuItems component remains the same
function MenuItems({ setOpen }) {
  const navigate = useNavigate();
  return (
      <nav className="mt-8 flex-col flex gap-2">
          {adminSidebarMenuItems.map((menuItem) => (
              <div
                  key={menuItem.id}
                  onClick={() => {
                      navigate(menuItem.path);
                      setOpen ? setOpen(false) : null;
                  }}
                  className="flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                  {menuItem.icon}
                  <span>{menuItem.label}</span>
              </div>
          ))}
      </nav>
  );
}


function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();

  return (
      <Fragment>
          {/* Mobile/Sheet Sidebar */}
          <Sheet open={open} onOpenChange={setOpen}>
              <SheetContent side="left" className="w-64">
                  <div className="flex flex-col h-full">
                      <SheetHeader className="border-b pb-4"> 
                          <SheetTitle className="flex items-center gap-2 mt-5 mb-2"> 
                              <ChartNoAxesCombined size={30} />
                              {/* FIXED: Changed h1 to span */}
                              <span className="text-2xl font-extrabold">Admin Panel</span> 
                          </SheetTitle>
                          {/* FIXED: Added SheetDescription */}
                          <SheetDescription>
                              Navigate through admin sections.
                          </SheetDescription>
                      </SheetHeader>
                      <MenuItems setOpen={setOpen} />
                  </div>
              </SheetContent>
          </Sheet>

          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
              <div
                  onClick={() => navigate("/admin/dashboard")}
                  className="flex cursor-pointer items-center gap-2 mb-5" 
              >
                  <ChartNoAxesCombined size={30} />
                   {/* Changed h1 to h2 for consistency, though h1 was okay here */}
                  <h2 className="text-2xl font-extrabold">Admin Panel</h2> 
              </div>
              <MenuItems /> 
          </aside>
      </Fragment>
  );
}

export default AdminSideBar;