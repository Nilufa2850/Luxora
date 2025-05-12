import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails, isLoading, error } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user?.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (orderDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails]);

  if (isLoading && (!orderList || orderList.length === 0)) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground py-8">Loading your orders...</p>
            </CardContent>
        </Card>
    );
  }

  if (error) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-red-500 py-8">Error loading orders: {error}</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {orderList && orderList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead className="text-right">Order Price</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList.map((orderItem) => (
                <TableRow key={orderItem._id}>
                  <TableCell className="font-medium truncate w-[200px]">{orderItem?._id}</TableCell>
                  <TableCell>{orderItem?.orderDate ? new Date(orderItem.orderDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        orderItem?.orderStatus === "confirmed" || orderItem?.orderStatus === "paid"
                          ? "success"
                          : orderItem?.orderStatus === "delivered"
                          ? "default"
                          : orderItem?.orderStatus === "processing" || orderItem?.orderStatus === "pending_payment"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {orderItem?.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${orderItem?.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={openDetailsDialog && orderDetails?._id === orderItem._id}
                      onOpenChange={(isOpen) => {
                        if (!isOpen) {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }
                      }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setOpenDetailsDialog(true);
                            handleFetchOrderDetails(orderItem?._id);
                        }}
                      >
                        View Details
                      </Button>
                      {orderDetails && orderDetails._id === orderItem._id && (
                        <ShoppingOrderDetailsView orderDetails={orderDetails} />
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-10">You have no orders yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
