# Healthcare Self-Service Platform

A Backstage-based self-service platform for developers building healthcare applications.

The platform provides developers with a standardized workflow to create healthcare services, generate GitHub repositories, provision AWS infrastructure using Terraform, and use automated CI/CD — while authentication and authorization are centrally managed through Microsoft Entra ID and Backstage's Permission Framework.

---

## Table of Contents

- [Overview](#overview)
- [How the Platform Helps Developers](#how-the-platform-helps-developers)
- [Platform Workflow](#platform-workflow)
- [Architecture](#architecture)
- [Authentication Flow](#authentication-flow)
- [Authorization Flow](#authorization-flow)
- [Roles and Permissions](#roles-and-permissions)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation and Configuration](#installation-and-configuration)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Microsoft Entra ID](#3-configure-microsoft-entra-id)
  - [4. Register the Backstage Application](#4-register-the-backstage-application)
  - [5. Configure the Redirect URI](#5-configure-the-redirect-uri)
  - [6. Create the Client Secret](#6-create-the-client-secret)
  - [7. Create Entra App Roles](#7-create-entra-app-roles)
  - [8. Add Users and Assign Roles](#8-add-users-and-assign-roles)
  - [9. Configure the GitHub App](#9-configure-the-github-app)
  - [10. Configure AWS](#10-configure-aws)
  - [11. Configure Environment Variables](#11-configure-environment-variables)
  - [12. Start Backstage](#12-start-backstage)
- [Using the Self-Service Platform](#using-the-self-service-platform)
- [Configuration Reference](#configuration-reference)
- [Security](#security)
- [Project Structure](#project-structure)
- [Development](#development)
- [Current Scope](#current-scope)

---

# Overview

This project implements a developer self-service platform using [Backstage](https://backstage.io/).

The platform is designed for a healthcare development environment where developers can create standardized services without manually setting up repositories, infrastructure, and CI/CD pipelines from scratch.

Instead, developers interact with Backstage through a self-service interface.

The platform provides:

- Microsoft Entra ID authentication
- Role-based authorization
- Backstage software templates
- Automated GitHub repository creation
- Terraform-based AWS infrastructure
- GitHub Actions CI/CD
- GitHub OIDC authentication to AWS
- Standardized healthcare service creation

The main idea is:

> Developers should be able to focus on building applications while the platform provides the standardized infrastructure and delivery workflow.

---

# How the Platform Helps Developers

Without a self-service platform, creating a new service may require developers to manually:

1. Create a GitHub repository.
2. Configure the repository structure.
3. Create Terraform configuration.
4. Configure AWS infrastructure.
5. Configure CI/CD.
6. Configure authentication.
7. Follow organizational infrastructure standards.

The platform standardizes these steps.

A developer can instead:

```text
Sign in
   ↓
Open Backstage
   ↓
Select Healthcare Service template
   ↓
Enter service information
   ↓
Create service
   ↓
GitHub repository is generated
   ↓
Terraform + CI/CD are generated
   ↓
AWS infrastructure can be provisioned
```

This provides:

### Self-Service

Developers can create approved services without manually requesting every infrastructure operation.

### Standardization

Every service starts from an approved template and follows the platform's predefined structure.

### Faster Development

Developers do not need to repeatedly configure repositories, Terraform, and CI/CD from scratch.

### Centralized Access Control

Microsoft Entra ID handles authentication while Backstage's Permission Framework handles authorization.

### Secure Cloud Authentication

GitHub Actions can authenticate to AWS using OIDC instead of storing long-lived AWS access keys.

### Platform Governance

Platform engineers control templates, infrastructure patterns, and permissions while developers consume the approved workflows.

---

# Platform Workflow

```mermaid
flowchart TD

    A["Developer"] --> B["Backstage"]

    B --> C["Healthcare Service Template"]

    C --> D["Backstage Scaffolder"]

    D --> E["GitHub Repository"]

    D --> F["Terraform Configuration"]

    E --> G["GitHub Actions"]

    F --> H["AWS Infrastructure"]

    G -->|"OIDC"| H
```

---

# Architecture

The major components of the platform are:

| Component | Purpose |
|---|---|
| Backstage | Developer portal and self-service interface |
| Microsoft Entra ID | User authentication |
| OIDC | Authentication protocol between Backstage and Entra ID |
| Backstage Permission Framework | Authorization |
| Entra App Roles | Admin/developer role assignment |
| Backstage Scaffolder | Service creation automation |
| GitHub | Source-code repository |
| GitHub App | Backstage-to-GitHub integration |
| Terraform | Infrastructure as Code |
| AWS | Cloud infrastructure |
| GitHub Actions | CI/CD |
| GitHub OIDC | Secure GitHub-to-AWS authentication |

---

# Authentication Flow

The diagram below follows a single sign-in request end to end: from the user clicking **Sign in** in the browser, through Backstage's frontend auth API, into the Backstage backend's OIDC handling, and finally into the `signInResolver` that turns Entra ID claims into a Backstage identity token.

```mermaid
flowchart TD

    subgraph Browser["Browser"]
        A["Backstage UI<br/><br/>User clicks<br/>'Sign in using Microsoft Entra ID'"]
        B["SignInPage<br/><br/>provider.apiRef = entraAuthApiRef"]
        C["entraAuthApi<br/><br/>→ DiscoveryApi<br/>→ provider.id = 'oidc'"]
    end

    D["http://localhost:7007/api/auth/oidc<br/><br/>DiscoveryApi discovers the backend"]

    subgraph Backend["Backstage Backend (localhost:7007)"]
        E["Sends auth request"]
        F["Auth Backend<br/><br/>Performs Entra ID OIDC Discovery<br/>(authorization + token endpoints)<br/>from the metadata URL in app-config.yaml<br/>to obtain the auth code and access token"]
    end

    G["Response: ID Token / Claims"]

    subgraph Resolver["signInResolver (auth.ts)"]
        H["Reads Entra claims<br/><br/>claims.oid<br/>claims.roles<br/>claims.preferred_username"]
        I["Puts users and roles<br/>into the Backstage identity token"]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
```

---

# Authorization Flow

Once a user is signed in, every action they take in Backstage is routed through the Permission Framework, which delegates the allow/deny decision to the platform's custom `AuthorizationPolicy.ts`.

```mermaid
flowchart TD

    subgraph Browser["Browser"]
        A["User is signed in<br/><br/>Example:<br/>user:default/bilal<br/>Role: Developer"]
        B["User performs an action<br/><br/>Example: Open Task / Cancel Task"]
    end

    subgraph Backend["Backstage Backend"]
        C["Permission Framework"]
        D["AuthorizationPolicy.ts"]
        E["Reads user context<br/><br/>user.info<br/>ownershipEntityRefs"]
    end

    F{"Which role does<br/>the user have?"}
    G["Admin Rules"]
    H["Developer Rules"]
    I["DENY<br/>Unknown / unauthorized user"]

    J{"Does the requested<br/>operation satisfy<br/>the authorization rules?"}

    K["ALLOW"]
    L["DENY"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F

    F -->|"Admin"| G
    F -->|"Developer"| H
    F -->|"No recognized role"| I

    G --> J
    H --> J

    J -->|"Yes"| K
    J -->|"No"| L
```

---

# Roles and Permissions

The platform currently defines two application roles.

| Capability | Admin | Developer |
|---|:---:|:---:|
| Sign in | Yes | Yes |
| View catalog entities | Yes | Yes |
| View approved templates | Yes | Yes |
| Execute approved templates | Yes | Yes |
| Create scaffolder tasks | Yes | Yes |
| View own tasks | Yes | Yes |
| View other users' tasks | Yes | No |
| Cancel own tasks | Yes | Yes |
| Cancel other users' tasks | Yes | No |
| Manage templates | Yes | No |
| Modify platform configuration | Yes | No |
| Backstage administration | Yes | No |

For task-related permissions, developers are restricted to their own tasks.

---

# Technology Stack

| Technology | Purpose |
|---|---|
| Backstage | Developer portal |
| React | Backstage frontend |
| Node.js | Backend runtime |
| Microsoft Entra ID | Authentication |
| OpenID Connect | Authentication protocol |
| Backstage Permission Framework | Authorization |
| GitHub | Source control |
| GitHub App | GitHub integration |
| Backstage Scaffolder | Service creation |
| Terraform | Infrastructure as Code |
| AWS | Cloud infrastructure |
| GitHub Actions | CI/CD |
| GitHub OIDC | AWS authentication |
| SQLite / better-sqlite3 | Local development database |

---

# Prerequisites

Before installing the platform, make sure you have:

- Node.js
- Yarn
- Git
- A Microsoft Entra ID tenant
- Permission to register applications in Microsoft Entra ID
- A GitHub organization
- Permission to create/install a GitHub App
- An AWS account
- Permission to configure AWS IAM

Verify your local tools:

```powershell
node --version
yarn --version
git --version
```

---

# Installation and Configuration

The platform is designed to be configured with your own:

- Microsoft Entra tenant
- Entra application
- Entra client secret
- GitHub organization
- GitHub App
- AWS account
- AWS IAM role

Do not use credentials from another installation.

---

# 1. Clone the Repository

```bash
git clone <YOUR-REPOSITORY-URL>
cd backstage-platform
```

---

# 2. Install Dependencies

```bash
yarn install
```

---

# 3. Configure Microsoft Entra ID

The platform uses Microsoft Entra ID as its OpenID Connect identity provider.

Open the Microsoft Entra admin center and navigate to:

```text
Microsoft Entra ID
    ↓
App registrations
```

Select:

```text
New registration
```

Create an application for your Backstage platform.

For example:

```text
Name:
Backstage Platform
```

For an organization-internal platform, configure the application for the appropriate organizational accounts supported by your tenant.

After registering the application, Microsoft Entra ID will provide:

```text
Application (client) ID
Directory (tenant) ID
```

Save these values because they will be required during Backstage configuration.

---

# 4. Register the Backstage Application

Open your newly created application registration.

Navigate to:

```text
Microsoft Entra ID
    ↓
App registrations
    ↓
Backstage Platform
```

The important identifiers are:

```text
Application (client) ID
Directory (tenant) ID
```

These values are identifiers and are configured through environment variables.

The client secret is sensitive and must be protected.

---

# 5. Configure the Redirect URI

Inside the application registration, open:

```text
Authentication
```

Add a platform:

```text
Web
```

For local development, configure this redirect URI:

```text
http://localhost:7007/api/auth/oidc/handler/frame
```

The redirect URI configured in Entra ID must match the callback expected by the Backstage OIDC provider.

---

# 6. Create the Client Secret

Inside your application registration, navigate to:

```text
Certificates & secrets
    ↓
Client secrets
```

Select:

```text
New client secret
```

Create the secret and copy its **Value**.

Do not commit the secret to Git.

You will configure it through:

```text
AUTH_OIDC_CLIENT_SECRET
```

> Microsoft Entra displays the secret value only when it is created. Store it securely.

---

# 7. Create Entra App Roles

The platform uses Microsoft Entra application roles to distinguish administrators and developers.

Open:

```text
App registrations
    ↓
Backstage Platform
    ↓
App roles
```

Create the administrator role.

## Administrator

Configure:

```text
Display name:
Backstage Admin

Allowed member types:
Users/Groups

Value:
backstage.admin

Description:
Backstage platform administrator
```

Enable the role.

---

## Developer

Create another role:

```text
Display name:
Backstage Developer

Allowed member types:
Users/Groups

Value:
backstage.developer

Description:
Backstage platform developer
```

Enable the role.

The important values are:

```text
backstage.admin
backstage.developer
```

These are the values read by the Backstage authentication resolver.

---

# 8. Add Users and Assign Roles

After creating the application roles, assign users to the application.

Navigate to:

```text
Microsoft Entra ID
    ↓
Enterprise applications
    ↓
Backstage Platform
```

Open:

```text
Users and groups
```

Select:

```text
Add user/group
```

Select the required user and assign one of the application roles.

For example:

```text
User
  ↓
Backstage Admin
```

or:

```text
User
  ↓
Backstage Developer
```

The resulting authentication token will contain the assigned application role.

For a developer:

```json
{
  "roles": [
    "backstage.developer"
  ]
}
```

For an administrator:

```json
{
  "roles": [
    "backstage.admin"
  ]
}
```

---

# 9. Configure the GitHub App

The Backstage Scaffolder uses a GitHub App to create repositories and interact with GitHub.

Create a GitHub App and install it in the GitHub organization that will contain the generated service repositories.

Your GitHub App credentials include:

- App ID
- Client ID
- Client Secret
- Private Key

The repository contains:

```text
github-app-credentials-example.yaml
```

Use it as a reference.

Example:

```yaml
appId: <YOUR-GITHUB-APP-ID>
clientId: <YOUR-GITHUB-APP-CLIENT-ID>
clientSecret: <YOUR-GITHUB-APP-CLIENT-SECRET>

privateKey: |
  -----BEGIN RSA PRIVATE KEY-----
  <YOUR-GITHUB-APP-PRIVATE-KEY>
  -----END RSA PRIVATE KEY-----

allowedInstallationOwners:
  - <YOUR-GITHUB-ORGANIZATION>
```

Create your local:

```text
github-app-credentials.yaml
```

and replace the placeholders with your own values.

The real credentials file must not be committed.

The example file is provided so another developer can understand the expected configuration without exposing credentials.

---

## GitHub Organization

The GitHub organization configured for the GitHub App must be the organization where the App is installed.

For example:

```yaml
allowedInstallationOwners:
  - my-healthcare-organization
```

Use your own organization name.

---

# 10. Configure AWS

The generated healthcare service repository uses Terraform to provision AWS infrastructure.

The CI/CD workflow is designed around GitHub OIDC.

The authentication model is:

```text
GitHub Actions
       |
       | OIDC JWT
       v
GitHub OIDC Identity Provider
       |
       v
AWS IAM
       |
       | AssumeRoleWithWebIdentity
       v
AWS IAM Role
       |
       v
AWS Resources
```

This avoids storing long-lived AWS access keys in GitHub Actions.

---

## Create the AWS OIDC Identity Provider

In AWS IAM, configure GitHub as an OpenID Connect identity provider.

Provider URL:

```text
https://token.actions.githubusercontent.com
```

Audience:

```text
sts.amazonaws.com
```

---

## Create the IAM Role

Create an IAM role that GitHub Actions can assume.

The trust policy should restrict which GitHub repository or organization is allowed to assume the role.

Do not create a role that allows arbitrary GitHub repositories to assume the role.

The role will have an ARN similar to:

```text
arn:aws:iam::<YOUR-AWS-ACCOUNT-ID>:role/<YOUR-GITHUB-OIDC-ROLE>
```

Use your own AWS account ID and role name.

Do not copy an AWS role ARN from another installation.

---

# 11. Configure Environment Variables

The Backstage authentication configuration uses:

```text
AUTH_OIDC_METADATA_URL
AUTH_OIDC_CLIENT_ID
AUTH_OIDC_CLIENT_SECRET
AUTH_SESSION_SECRET
```

## PowerShell

If you are using Windows PowerShell:

```powershell
$env:AUTH_OIDC_METADATA_URL="https://login.microsoftonline.com/<YOUR-TENANT-ID>/v2.0/.well-known/openid-configuration"

$env:AUTH_OIDC_CLIENT_ID="<YOUR-ENTRA-CLIENT-ID>"

$env:AUTH_OIDC_CLIENT_SECRET="<YOUR-ENTRA-CLIENT-SECRET>"

$env:AUTH_SESSION_SECRET=(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

## Linux / macOS

For Bash:

```bash
export AUTH_OIDC_METADATA_URL="https://login.microsoftonline.com/<YOUR-TENANT-ID>/v2.0/.well-known/openid-configuration"

export AUTH_OIDC_CLIENT_ID="<YOUR-ENTRA-CLIENT-ID>"

export AUTH_OIDC_CLIENT_SECRET="<YOUR-ENTRA-CLIENT-SECRET>"

export AUTH_SESSION_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
```

## Environment Variable Reference

| Variable | Purpose | Sensitive |
|---|---|:---:|
| `AUTH_OIDC_METADATA_URL` | Entra OIDC discovery document | No |
| `AUTH_OIDC_CLIENT_ID` | Entra application client ID | No |
| `AUTH_OIDC_CLIENT_SECRET` | Entra application client secret | Yes |
| `AUTH_SESSION_SECRET` | Backstage session secret | Yes |

---

## Generate a Session Secret

Generate a random session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then configure it:

```powershell
$env:AUTH_SESSION_SECRET="<GENERATED-VALUE>"
```

---

# 12. Start Backstage

After configuring the required environment variables:

```bash
yarn start
```

The frontend will be available at:

```text
http://localhost:3000
```

The backend will run at:

```text
http://localhost:7007
```

Open:

```text
http://localhost:3000
```

You should see the Backstage sign-in page.

Select:

```text
Sign in using Microsoft Entra ID
```

You will then be redirected through the Entra OIDC authentication flow.

---

# Using the Self-Service Platform

After successfully signing in, developers can access the approved Backstage templates.

Select:

```text
Healthcare Service
```

The template collects information such as:

### Service Name

Example:

```text
patient-service
```

### Service Type

The current template supports:

```text
patient-service
appointment-service
billing-service
```

### Environment

The available environments are:

```text
dev
staging
prod
```

After submitting the form, Backstage Scaffolder performs the service creation workflow.

Conceptually:

```text
Developer
    |
    v
Healthcare Service Template
    |
    +---- Generate repository files
    |
    +---- Create GitHub repository
    |
    +---- Generate Terraform configuration
    |
    +---- Generate GitHub Actions workflow
    |
    v
GitHub Repository
```

The generated repository contains the required infrastructure and CI/CD configuration.

---

# Configuration Reference

## Backstage Authentication

The authentication configuration follows this structure:

```yaml
auth:
  environment: development

  session:
    secret: ${AUTH_SESSION_SECRET}

  providers:
    oidc:
      development:
        metadataUrl: ${AUTH_OIDC_METADATA_URL}
        clientId: ${AUTH_OIDC_CLIENT_ID}
        clientSecret: ${AUTH_OIDC_CLIENT_SECRET}
        prompt: login
```

The environment:

```yaml
environment: development
```

selects:

```yaml
providers:
  oidc:
    development:
```

---

# GitHub App Configuration

The local GitHub App credentials file follows the structure:

```yaml
appId: <YOUR-GITHUB-APP-ID>
clientId: <YOUR-GITHUB-APP-CLIENT-ID>
clientSecret: <YOUR-GITHUB-APP-CLIENT-SECRET>

privateKey: |
  -----BEGIN RSA PRIVATE KEY-----
  <YOUR-GITHUB-APP-PRIVATE-KEY>
  -----END RSA PRIVATE KEY-----

allowedInstallationOwners:
  - <YOUR-GITHUB-ORGANIZATION>
```

Keep the real credentials file out of source control.

---

# Security

Security is an important part of the platform design.

## Never Commit Secrets

Never commit:

- Microsoft Entra client secrets
- GitHub App client secrets
- GitHub App private keys
- AWS access keys
- AWS secret access keys
- Backstage session secrets
- Production credentials

---

## Local Development

For local development, environment variables can be used:

```text
Terminal
   |
   v
Environment Variables
   |
   v
Backstage
```

For example:

```powershell
$env:AUTH_OIDC_CLIENT_SECRET="<SECRET>"
```

This keeps the secret outside the source code.

---

## CI/CD

For GitHub Actions, the platform uses OIDC-based cloud authentication:

```text
GitHub Actions
      |
      | OIDC
      v
AWS IAM Role
```

instead of:

```text
GitHub Actions
      |
      | Long-lived access key
      v
AWS
```

The OIDC approach avoids storing long-lived AWS access keys in the GitHub repository.

---

## Production Secret Management

For an actual production deployment, secrets should be provided through the organization's approved secret-management mechanism.

Depending on the organization's infrastructure, this may include:

- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Kubernetes External Secrets
- Other enterprise secret-management systems

The important principle is that application configuration should consume secrets through configuration/environment variables rather than having secrets hardcoded into source code.

---

# Project Structure

```text
backstage-platform/
│
├── app-config.yaml
│
├── examples/
│   └── org.yaml
│
├── packages/
│   ├── app/
│   │
│   └── backend/
│       └── src/
│           └── auth.ts
│
├── plugins/
│   └── permission-backend-module-authorization/
│       └── ...
│
├── templates/
│   └── healthcare-service/
│       ├── template.yaml
│       │
│       └── content/
│           └── .github/
│               └── workflows/
│                   └── terraform.yml
│
├── github-app-credentials-example.yaml
│
└── package.json
```

---

## `app-config.yaml`

Contains the Backstage application configuration, including the OIDC provider configuration.

Sensitive values are loaded through environment variables.

---

## `packages/backend/src/auth.ts`

Contains the custom OIDC provider and sign-in resolver.

The resolver:

1. Receives the authenticated user's OIDC information.
2. Reads the Entra ID claims.
3. Reads the user's Entra application roles.
4. Finds the matching Backstage catalog user.
5. Maps Entra roles to Backstage groups.
6. Issues the Backstage identity token.

---

## `AuthorizationPolicy.ts`

Contains the custom authorization policy.

It evaluates:

```text
User identity
    +
Ownership entity references
    +
Requested permission
    +
Resource ownership where required
    |
    v
ALLOW / DENY
```

---

## `templates/healthcare-service/template.yaml`

Defines the healthcare service template used by developers.

It controls:

- Service information
- Service type
- Environment
- Repository creation
- Generated project structure
- Template outputs

---

## `templates/healthcare-service/content/`

Contains the files that are generated into the developer's new service repository.

This includes the Terraform configuration and GitHub Actions workflow.

---

# Development

Start the development environment:

```bash
yarn start
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:7007
```

If authentication configuration changes, make sure the corresponding Microsoft Entra configuration is also updated.

For local development, the redirect URI must match:

```text
http://localhost:7007/api/auth/oidc/handler/frame
```

---

# Current Scope

The current project focuses on the **self-service platform engineering workflow**.

The core platform provides:

```text
                    Healthcare Developer
                            |
                            v
                     +-------------+
                     |  Backstage  |
                     +------+------+
                            |
             +--------------+--------------+
             |                             |
             v                             v
      Microsoft Entra ID             Permission
      Authentication                  Framework
             |                             |
             +--------------+--------------+
                            |
                            v
                  Healthcare Template
                            |
                            v
                       Scaffolder
                            |
                            +-------------+
                            |             |
                            v             v
                         GitHub       Terraform
                                        |
                                        v
                                       AWS
                                        ^
                                        |
                                  GitHub Actions
                                        |
                                       OIDC
```

The platform can be extended in the future with additional service templates, infrastructure modules, environments, policies, and integrations.

---

# Summary

This platform provides a standardized developer self-service workflow:

```text
                    Developer
                        |
                        v
                Microsoft Entra ID
                        |
                  Authentication
                        |
                        v
                    Backstage
                        |
                  Authorization
                        |
                        v
              Healthcare Template
                        |
                        v
                  GitHub Repository
                        |
                        v
                    Terraform
                        |
                        v
                       AWS
                        ^
                        |
                  GitHub Actions
                        |
                       OIDC
```

The developer gets a standardized path from **service creation to infrastructure provisioning**, while the platform maintains control over authentication, authorization, infrastructure patterns, and CI/CD configuration.