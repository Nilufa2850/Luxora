import { filterOptions } from "@/config"; 
import { Fragment } from "react";
import { Label } from "../ui/label"; 
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

function ProductFilter({ filters, handleFilter }) {
  return (
    <div className="bg-background rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}> 
            <div>
              <h3 className="text-base font-semibold capitalize text-foreground mb-2">{keyItem}</h3>
              <div className="grid gap-2">
                {filterOptions[keyItem].map((option) => {
                  const isChecked = Boolean(
                    filters && 
                    filters[keyItem] && 
                    Array.isArray(filters[keyItem]) &&
                    filters[keyItem].includes(option.id)
                  );

                  return (
                    <Label 
                      key={option.id} 
                      htmlFor={`${keyItem}-${option.id}`}
                      className="flex font-medium items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                    > 
                      <Checkbox
                        id={`${keyItem}-${option.id}`} 
                        checked={isChecked}
                        onCheckedChange={(checkedState) => {
                          handleFilter(keyItem, option.id, checkedState);
                        }}
                        
                      />
                      <span>{option.label}</span>
                    </Label>
                  );
                })}
              </div>
            </div>
            <Separator className="my-4"/> 
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;