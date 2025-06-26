// @ts-check
// import { DiscountApplicationStrategy } from "../generated/api";

const DiscountApplicationStrategy = {
  First: "FIRST",
  Maximum: "MAXIMUM",
  All: "ALL"
};

/**
 * @typedef {import("../generated/api").InputQuery} InputQuery
 * @typedef {import("../generated/api").FunctionResult} FunctionResult
 * @typedef {import("../generated/api").Target} Target
 * @typedef {import("../generated/api").ProductVariant} ProductVariant
 */

/**
 * @type {FunctionResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {InputQuery} input
 * @returns {FunctionResult}
 */
export function run(input) {
  const configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}"
  );

  if (!configuration.tagName || !configuration.selectedProducts || !configuration.discountValue) {
    return EMPTY_DISCOUNT;
  }

  const { tagName, selectedProducts, discountType, discountValue } = configuration;
  const selectedProductIds = JSON.parse(selectedProducts);
  
  // Check if any product in cart has the required tag
  let hasTaggedProduct = false;
  const targets = [];

  for (const line of input.cart.lines) {
    if (line.merchandise.__typename === "ProductVariant") {
      const product = line.merchandise.product;
      
      // Check if this product has the required tag
      if (product.tags && product.tags.includes(tagName)) {
        hasTaggedProduct = true;
      }
      
      // Check if this product is in the selected products list
      if (selectedProductIds.includes(product.id)) {
        targets.push({
          productVariant: {
            id: line.merchandise.id,
          },
        });
      }
    }
  }

  // Only apply discount if both conditions are met:
  // 1. Cart has at least one product with the required tag
  // 2. Cart has at least one of the selected products
  if (!hasTaggedProduct || targets.length === 0) {
    return EMPTY_DISCOUNT;
  }

  // Apply discount to selected products
  const discountAmount = parseFloat(discountValue);
  
  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: [
      {
        targets,
        value: discountType === "percentage"
          ? {
              percentage: {
                value: discountAmount.toString(),
              },
            }
          : {
              fixedAmount: {
                amount: discountAmount.toString(),
              },
            },
      },
    ],
  };
}