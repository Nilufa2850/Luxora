import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

function AdminProductTile({
  product,
  handleOpenEditDialog,
  handleDelete,
}) {
  if (!product) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-md">
      <div> 
        <div className="relative">
          <img
            src={product?.image || 'https://placehold.co/600x400?text=No+Image'}
            alt={product?.title || "Product Image"}
            className="w-full h-[300px] object-cover"
          />
        </div>
        <CardContent className="p-4"> 
          <h2 className="text-xl font-bold mb-2 mt-2 truncate"> 
            {product?.title || "Untitled Product"}
          </h2>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 && parseFloat(product?.salePrice) < parseFloat(product?.price)
                  ? "line-through text-grey-600 text-md"
                  : "text-lg font-semibold text-gray-800"
              }`}
            >
              ${product?.price ? parseFloat(product.price).toFixed(2) : '0.00'}
            </span>
            {product?.salePrice > 0 && parseFloat(product?.salePrice) < parseFloat(product?.price) ? (
              <span className="text-lg font-bold text-red-600"> 
                ${parseFloat(product.salePrice).toFixed(2)}
              </span>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center p-4 border-t"> 
          <Button
            
            size="sm"
            onClick={() => {
              if (handleOpenEditDialog) {
                handleOpenEditDialog(product);
              }
            }}
          >
            Edit
          </Button>
          <Button 
            
            size="sm"
            onClick={() => handleDelete(product?._id)}
          >
            Delete
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default AdminProductTile;
