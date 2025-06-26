import { useState, useCallback, useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  FormLayout,
  TextField,
  RadioButton,
  Stack,
  Text,
  Banner,
  ResourcePicker,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  
  const discount = await prisma.discountConfiguration.findFirst({
    where: { 
      id: params.id,
      shop: session.shop,
    },
  });

  if (!discount) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ discount });
};

export const action = async ({ request, params }) => {
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
    // Update discount configuration in database
    await prisma.discountConfiguration.update({
      where: { id: params.id },
      data: {
        tagName,
        discountType,
        discountValue,
        selectedProducts,
      },
    });

    // Update the discount metafield in Shopify
    // In a real app, you'd update the discount through the Admin API

    return redirect("/app/discounts");
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }
};

export default function EditDiscount() {
  const { discount } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isLoading = navigation.state === "submitting";

  const [tagName, setTagName] = useState(discount.tagName);
  const [discountType, setDiscountType] = useState(discount.discountType);
  const [discountValue, setDiscountValue] = useState(discount.discountValue.toString());
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showResourcePicker, setShowResourcePicker] = useState(false);

  useEffect(() => {
    // Parse selected products
    const products = JSON.parse(discount.selectedProducts);
    setSelectedProducts(products.map(id => ({ id })));
  }, [discount.selectedProducts]);

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
      title="Edit Discount"
      backAction={{ url: "/app/discounts" }}
      primaryAction={{
        content: "Save Changes",
        loading: isLoading,
        disabled: !tagName || !discountValue || selectedProducts.length === 0,
        onAction: handleSubmit,
      }}
    >
      <Layout>
        <Layout.Section>
          {actionData?.error && (
            <Banner status="critical" title="Error updating discount">
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