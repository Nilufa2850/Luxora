import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList, loading, error } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();

  const handleOpenEditDialog = (productToEdit) => {
    setCurrentEditedId(productToEdit._id);
    setFormData({
      title: productToEdit.title || "",
      description: productToEdit.description || "",
      category: productToEdit.category || "",
      brand: productToEdit.brand || "",
      price: productToEdit.price || "",
      salePrice: productToEdit.salePrice || "",
      totalStock: productToEdit.totalStock || "",
      averageReview: productToEdit.averageReview || 0,
      image: productToEdit.image || null,
    });
    setUploadedImageUrl(productToEdit.image || "");
    setImageFile(null);
    setOpenCreateProductsDialog(true);
  };

  const handleOpenAddDialog = () => {
    setCurrentEditedId(null);
    setFormData(initialFormData);
    setImageFile(null);
    setUploadedImageUrl("");
    setOpenCreateProductsDialog(true);
  };

  const handleDialogClose = () => {
    setOpenCreateProductsDialog(false);
    setCurrentEditedId(null);
    setFormData(initialFormData);
    setImageFile(null);
    setUploadedImageUrl("");
  }

  function onSubmit(event) {
    event.preventDefault();
    const finalImageData = uploadedImageUrl || formData.image;

    if (!finalImageData && currentEditedId === null) {
        toast.error("Please upload an image for the new product.");
        return;
    }
    
    const dataToSend = {
        ...formData,
        image: finalImageData,
        price: parseFloat(formData.price) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        totalStock: parseInt(formData.totalStock, 10) || 0,
    };

    if (currentEditedId !== null) {
      dispatch(
        editProduct({
          id: currentEditedId,
          formData: dataToSend,
        })
      ).unwrap()
       .then((data) => {
        if (data?.success) {
          dispatch(fetchAllProducts());
          toast.success(data?.message || "Product updated successfully!");
          handleDialogClose();
        } else {
          toast.error(data?.message || "Failed to update product.");
        }
      }).catch(err => {
        console.error("Edit product error:", err);
        toast.error(err?.message || "An error occurred while updating the product.");
      });
    } else {
      dispatch(addNewProduct(dataToSend))
      .unwrap()
      .then((data) => {
        if (data?.success) {
          dispatch(fetchAllProducts());
          toast.success(data?.message || "Product added successfully!");
          handleDialogClose();
        } else {
          toast.error(data?.message || "Failed to add product.");
        }
      }).catch(err => {
        console.error("Add product error:", err);
        toast.error(err?.message || "An error occurred while adding the product.");
      });
    }
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId))
    .unwrap()
    .then((data) => {
      if (data?.success) {
        dispatch(fetchAllProducts());
        toast.success(data?.message || "Product deleted successfully!");
      } else {
        toast.error(data?.message || "Failed to delete product.");
      }
    }).catch(err => {
        console.error("Delete product error:", err);
        toast.error(err?.message || "An error occurred while deleting the product.");
    });
  }

  function isFormValid() {
    const requiredFields = ["title", "description", "category", "brand", "price", "totalStock"];
    const imageIsPresent = uploadedImageUrl || (currentEditedId && formData.image);
    return imageIsPresent && requiredFields.every(key => formData[key] && String(formData[key]).trim() !== "");
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={handleOpenAddDialog}>
          Add New Product
        </Button>
      </div>
      {loading && <p className="text-center text-muted-foreground py-4">Loading products...</p>}
      {error && <p className="text-center text-red-500 py-4">Error loading products: {error}</p>}
      {!loading && !error && productList && productList.length === 0 && (
        <p className="text-center text-muted-foreground py-10">No products found. Click "Add New Product" to get started.</p>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                key={productItem._id}
                handleOpenEditDialog={() => handleOpenEditDialog(productItem)}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={handleDialogClose}
      >
        <SheetContent side="right" className="overflow-auto w-full sm:max-w-lg md:max-w-xl">
          <SheetHeader className="pb-4 border-b mb-4">
            <SheetTitle className="text-2xl font-semibold">
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            <SheetDescription>
              {currentEditedId !== null 
                ? "Update the details of the existing product." 
                : "Fill in the details to add a new product to your store."
              }
            </SheetDescription>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Update Product" : "Add Product"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid() || imageLoadingState || loading}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
