import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  editaAddress, 
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";

import { toast } from "sonner";

const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList, error, loading } = useSelector((state) => state.shopAddress);

  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList && addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast.error("You can add a maximum of 3 addresses."); 
      return;
    }

    if (currentEditedId !== null) {
      dispatch(
        editaAddress({ 
          userId: user?.id,
          addressId: currentEditedId,
          formData,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user?.id));
          setCurrentEditedId(null);
          setFormData(initialAddressFormData);
          toast.success("Address updated successfully!"); 
        } else {
          toast.error(data?.payload?.message || "Failed to update address. Please try again.");
        }
      }).catch(err => {
        console.error("Error editing address:", err);
        toast.error("An unexpected error occurred while updating the address.");
      });
    } else {
      dispatch(
        addNewAddress({
          ...formData,
          userId: user?.id,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user?.id));
          setFormData(initialAddressFormData);
          toast.success("Address added successfully!"); 
        } else {
          toast.error(data?.payload?.message || "Failed to add address. Please try again.");
        }
      }).catch(err => {
        console.error("Error adding new address:", err);
        toast.error("An unexpected error occurred while adding the address.");
      });
    }
  }

  function handleDeleteAddress(getCurrentAddressId) { 
    dispatch(
      deleteAddress({ userId: user?.id, addressId: getCurrentAddressId })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast.success("Address deleted successfully!"); 
        if (selectedId === getCurrentAddressId) { 
            if (setCurrentSelectedAddress) setCurrentSelectedAddress(null);
        }
      } else {
        toast.error(data?.payload?.message || "Failed to delete address. Please try again.");
      }
    }).catch(err => {
        console.error("Error deleting address:", err);
        toast.error("An unexpected error occurred while deleting the address.");
    });
  }

  function handleEditAddress(getCurrentAddress) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); 
    setCurrentEditedId(getCurrentAddress?._id);
    setFormData({
      address: getCurrentAddress?.address || "", 
      city: getCurrentAddress?.city || "",
      phone: getCurrentAddress?.phone || "",
      pincode: getCurrentAddress?.pincode || "",
      notes: getCurrentAddress?.notes || "",
    });
  }

  function isFormValid() {
    const requiredFields = ["address", "city", "phone", "pincode"];
    return requiredFields.every(key => formData[key] && formData[key].trim() !== "");
  }

  useEffect(() => {
    if (user?.id) { 
      dispatch(fetchAllAddresses(user?.id));
    }
  }, [dispatch, user?.id]); 

  return (
    <Card className="shadow-lg">
      <div className="mb-5 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && !addressList?.length && <p className="col-span-full text-center text-muted-foreground">Loading addresses...</p>}
        {!loading && addressList && addressList.length > 0
          ? addressList.map((singleAddressItem) => (
              <AddressCard
                key={singleAddressItem._id} 
                selectedId={selectedId}
                handleDeleteAddress={() => handleDeleteAddress(singleAddressItem._id)} 
                addressInfo={singleAddressItem}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            ))
          : !loading && <p className="col-span-full text-center text-muted-foreground">No addresses found. Please add one below.</p>}
        {error && <p className="col-span-full text-center text-red-500">Error loading addresses: {error}</p>}
      </div>
      <CardHeader className="border-t pt-6">
        <CardTitle className="text-2xl font-semibold">
          {currentEditedId !== null ? "Edit Address" : "Add New Address"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-6">
        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditedId !== null ? "Update Address" : "Add Address"}
          onSubmit={handleManageAddress}
          isBtnDisabled={!isFormValid() || loading} 
        />
      </CardContent>
    </Card>
  );
}

export default Address;
