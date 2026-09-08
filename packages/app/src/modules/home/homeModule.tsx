import { createFrontendModule } from '@backstage/frontend-plugin-api';
import {
  HomePageLayoutBlueprint,
  HomePageWidgetBlueprint,
} from '@backstage/plugin-home-react/alpha';
import { MarkdownContent } from '@backstage/core-components';
import { Fragment } from 'react';

const content = `
# Healthcare Developer Portal

Welcome to the **Healthcare Developer Portal** — a self-service platform for creating standardized healthcare services.

## 🚀 Create a New Service

Start a new service using an approved **Golden Path template**.

The platform takes care of the initial setup so you can focus on building your service.

### What the platform provides

- **Standardized service structure**
- **Automated infrastructure provisioning**
- **Automated CI/CD**
- **Development, Staging, and Production environments**
- **Organization-approved deployment standards**

### Get Started

[**🚀 Create a Service →**](/create)

Choose your service type, provide a service name, select an environment, and let the platform handle the setup.

---

## How It Works

**1. Choose your service**  
Select the type of healthcare service you want to create.

**2. Configure your environment**  
Choose Development, Staging, or Production.

**3. Create your service**  
The platform generates a standardized GitHub repository from the selected template.

**4. Deploy automatically**  
The repository's CI/CD pipeline provisions the required AWS infrastructure using Terraform.

---

### 💡 Platform Principle

> **You build the service. The platform provides the foundation.**

Use the approved templates to follow consistent engineering standards without setting up infrastructure and CI/CD from scratch.
`;

const gettingStartedWidget = HomePageWidgetBlueprint.make({
  name: 'getting-started',
  params: {
    name: 'GettingStarted',
    title: '',
    description: 'Self-service platform for creating standardized healthcare services',
    components: async () => ({
      Content: () => <MarkdownContent content={content} />,
    }),
  },
});

const staticHomeLayout = HomePageLayoutBlueprint.make({
  name: 'static',
  params: {
    loader: async () => ({ widgets }) => (
      <>
        {widgets
          .filter(widget => widget.name === 'GettingStarted')
          .map(widget => (
            <Fragment key={widget.name}>{widget.component}</Fragment>
          ))}
      </>
    ),
  },
});

export const homeModule = createFrontendModule({
  pluginId: 'home',
  extensions: [gettingStartedWidget, staticHomeLayout],
});