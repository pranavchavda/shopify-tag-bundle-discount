import { useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  FormLayout,
  TextField,
  Select,
  RadioButton,
  Stack,
  Text,
  Banner,
  ResourcePicker,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const tagName = formData.get("tagName");
  const discountType = formData.get("discountType");
  const discountValue = parseFloat(formData.get("discountValue"));
  const selectedProducts = formData.get("selectedProducts");

  if (!tagName || !discountValue || !selectedProducts) {
    return json({ error: "Please fill in all required fields" }, { status: 400 });
  }

  try {
    // Create discount configuration in database
    const discount = await prisma.discountConfiguration.create({
      data: {
        shop: session.shop,
        functionId: "product-discount", // This will be updated with actual function ID
        tagName,
        discountType,
        discountValue,
        selectedProducts,
        isActive: true,
      },
    });

    // Create the discount using Admin API
    const response = await admin.graphql(
      `#graphql
      mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
          automaticAppDiscount {
            discountId
            title
            status
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          automaticAppDiscount: {
            title: `Tag Bundle: ${tagName}`,
            functionId: "product-discount",
            startsAt: new Date().toISOString(),
            combinesWith: {
              productDiscounts: true,
              shippingDiscounts: true,
            },
            metafields: [
              {
                namespace: "product-discount",
                key: "config",
                value: JSON.stringify({
                  tagName,
                  discountType,
                  discountValue,
                  selectedProducts,
                }),
                type: "json",
              },
            ],
          },
        },
      }
    );

    const { discountAutomaticAppCreate } = await response.json();
    
    if (discountAutomaticAppCreate.userErrors.length > 0) {
      throw new Error(discountAutomaticAppCreate.userErrors[0].message);
    }

    // Update the discount configuration with the Shopify discount ID
    await prisma.discountConfiguration.update({
      where: { id: discount.id },
      data: { functionId: discountAutomaticAppCreate.automaticAppDiscount.discountId },
    });

    return redirect("/app/discounts");
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }
};

export default function NewDiscount() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isLoading = navigation.state === "submitting";

  const [tagName, setTagName] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showResourcePicker, setShowResourcePicker] = useState(false);

  const handleSubmit = useCallback(() => {
    const formData = new FormData();
    formData.append("tagName", tagName);
    formData.append("discountType", discountType);
    formData.append("discountValue", discountValue);
    formData.append("selectedProducts", JSON.stringify(selectedProducts.map(p => p.id)));
    submit(formData, { method: "post" });
  }, [tagName, discountType, discountValue, selectedProducts, submit]);

  return (
    <Page
      title="Create New Discount"
      backAction={{ url: "/app/discounts" }}
      primaryAction={{
        content: "Create Discount",
        loading: isLoading,
        disabled: !tagName || !discountValue || selectedProducts.length === 0,
        onAction: handleSubmit,
      }}
    >
      <Layout>
        <Layout.Section>
          {actionData?.error && (
            <Banner status="critical" title="Error creating discount">
              <p>{actionData.error}</p>
            </Banner>
          )}
          
          <Card>
            <FormLayout>
              <TextField
                label="Tag Name"
                value={tagName}
                onChange={setTagName}
                placeholder="e.g., promo-tag"
                helpText="Products with this tag will trigger the discount when purchased with selected products"
                requiredIndicator
              />

              <Stack vertical>
                <Text variant="headingMd">Selected Products</Text>
                <Text variant="bodySm" color="subdued">
                  These products will receive the discount when purchased with tagged products
                </Text>
                <Button onClick={() => setShowResourcePicker(true)}>
                  {selectedProducts.length > 0
                    ? `${selectedProducts.length} products selected`
                    : "Select Products"}
                </Button>
              </Stack>

              <Stack vertical>
                <Text variant="headingMd">Discount Type</Text>
                <RadioButton
                  label="Percentage discount"
                  checked={discountType === "percentage"}
                  id="percentage"
                  name="discountType"
                  onChange={() => setDiscountType("percentage")}
                />
                <RadioButton
                  label="Fixed amount discount"
                  checked={discountType === "fixed_amount"}
                  id="fixed_amount"
                  name="discountType"
                  onChange={() => setDiscountType("fixed_amount")}
                />
              </Stack>

              <TextField
                label={discountType === "percentage" ? "Discount Percentage" : "Discount Amount"}
                type="number"
                value={discountValue}
                onChange={setDiscountValue}
                prefix={discountType === "fixed_amount" ? "$" : ""}
                suffix={discountType === "percentage" ? "%" : ""}
                requiredIndicator
                min={0}
                max={discountType === "percentage" ? 100 : undefined}
              />
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>

      {showResourcePicker && (
        <ResourcePicker
          resourceType="Product"
          open={showResourcePicker}
          onSelection={({ selection }) => {
            setSelectedProducts(selection);
            setShowResourcePicker(false);
          }}
          onCancel={() => setShowResourcePicker(false)}
          selectMultiple
          initialSelectionIds={selectedProducts}
        />
      )}
    </Page>
  );
}