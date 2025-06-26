import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  EmptyState,
  Badge,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  const discounts = await prisma.discountConfiguration.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });

  return json({ discounts });
};

export default function DiscountsList() {
  const { discounts } = useLoaderData();

  const rows = discounts.map((discount) => {
    const products = JSON.parse(discount.selectedProducts);
    return [
      discount.tagName,
      `${products.length} products`,
      discount.discountType === "percentage" 
        ? `${discount.discountValue}%` 
        : `$${discount.discountValue}`,
      <Badge status={discount.isActive ? "success" : "attention"}>
        {discount.isActive ? "Active" : "Inactive"}
      </Badge>,
      <InlineStack gap="200">
        <Button url={`/app/discounts/${discount.id}/edit`} size="slim">
          Edit
        </Button>
        <Button url={`/app/discounts/${discount.id}/delete`} size="slim" tone="critical">
          Delete
        </Button>
      </InlineStack>,
    ];
  });

  return (
    <Page
      title="Discount Configurations"
      primaryAction={
        <Button url="/app/discounts/new" variant="primary">
          Create New Discount
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          {discounts.length === 0 ? (
            <Card>
              <EmptyState
                heading="Create your first discount configuration"
                action={{
                  content: "Create discount",
                  url: "/app/discounts/new",
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Set up tag-based discounts to automatically apply when customers
                  purchase specific product combinations.
                </p>
              </EmptyState>
            </Card>
          ) : (
            <Card>
              <DataTable
                columnContentTypes={["text", "text", "text", "text", "text"]}
                headings={["Tag Name", "Products", "Discount", "Status", "Actions"]}
                rows={rows}
              />
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}