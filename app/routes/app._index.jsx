import { json } from "@remix-run/node";
import { useLoaderData, Form, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({ appName: "Tag Bundle Discount" });
};

export default function Index() {
  const { appName } = useLoaderData();
  const navigation = useNavigation();

  return (
    <Page>
      <TitleBar title={appName} />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Welcome to Tag Bundle Discount 🎯
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Create discount rules that apply when customers purchase selected products together with tagged products.
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Getting Started
                  </Text>
                  <List>
                    <List.Item>
                      Create a new discount configuration by clicking the button below
                    </List.Item>
                    <List.Item>
                      Select products that should receive the discount
                    </List.Item>
                    <List.Item>
                      Specify the tag that trigger products must have
                    </List.Item>
                    <List.Item>
                      Set your discount amount or percentage
                    </List.Item>
                    <List.Item>
                      Activate the discount and watch it work automatically!
                    </List.Item>
                  </List>
                </BlockStack>
                <InlineStack gap="300">
                  <Button url="/app/discounts/new" variant="primary">
                    Create Discount Configuration
                  </Button>
                  <Button url="/app/discounts">
                    View Existing Discounts
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    How it Works
                  </Text>
                  <Text as="p" variant="bodyMd">
                    When customers add products to their cart that include both:
                  </Text>
                  <List type="bullet">
                    <List.Item>Products from your selected list</List.Item>
                    <List.Item>Products with your specified tag</List.Item>
                  </List>
                  <Text as="p" variant="bodyMd">
                    The discount will automatically apply to the selected products.
                  </Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Resources
                  </Text>
                  <List>
                    <List.Item>
                      <Link url="https://shopify.dev/docs/apps" external>
                        App documentation
                      </Link>
                    </List.Item>
                    <List.Item>
                      <Link url="https://shopify.dev/docs/apps/functions/discounts" external>
                        Discount functions guide
                      </Link>
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}