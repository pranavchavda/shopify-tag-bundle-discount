import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request, params }) => {
  const { session, admin } = await authenticate.admin(request);
  
  try {
    // Find the discount configuration
    const discount = await prisma.discountConfiguration.findFirst({
      where: { 
        id: params.id,
        shop: session.shop,
      },
    });

    if (!discount) {
      throw new Response("Not Found", { status: 404 });
    }

    // Delete from Shopify (if functionId exists)
    if (discount.functionId && discount.functionId !== "product-discount") {
      try {
        await admin.graphql(
          `#graphql
          mutation discountAutomaticDelete($id: ID!) {
            discountAutomaticDelete(id: $id) {
              deletedAutomaticDiscountId
              userErrors {
                field
                message
              }
            }
          }`,
          {
            variables: {
              id: discount.functionId,
            },
          }
        );
      } catch (error) {
        console.error("Error deleting discount from Shopify:", error);
      }
    }

    // Delete from database
    await prisma.discountConfiguration.delete({
      where: { id: params.id },
    });

    return redirect("/app/discounts");
  } catch (error) {
    console.error("Error deleting discount:", error);
    return redirect("/app/discounts");
  }
};