# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-09-23

### Added

- Added infrastructure self-service provisioning workflow.
- Added support for provisioning EC2 and S3 infrastructure through the Backstage platform.
- Added infrastructure selection, allowing developers to choose the AWS infrastructure they need.
- Added resource name, environment, and infrastructure purpose inputs.
- Added environment selection for `dev`, `staging`, and `prod`.
- Added automatic Terraform configuration generation based on the selected infrastructure.
- Added automatic unique suffix generation for S3 bucket names to prevent global naming conflicts.
- Added automatic GitHub repository creation for infrastructure requests.
- Added Terraform provisioning through the generated infrastructure repositories.
- Added GitHub Actions CI/CD workflow for validating and deploying generated Terraform configurations.

### Changed

- Replaced the previous healthcare service scaffolder template with an infrastructure provisioning template.
- Updated the scaffolder inputs and workflow to support infrastructure selection, resource naming, environment selection, and infrastructure purpose.
- Updated generated repositories and Terraform configuration to reflect the new infrastructure provisioning workflow.

## [1.0.0] - 2026-09-20

### Added

- Added Backstage-based self-service platform for creating standardized healthcare services.
- Added healthcare service scaffolder template.
- Added automatic GitHub repository creation for new services.
- Added Terraform infrastructure provisioning for generated services.
- Added GitHub Actions CI/CD workflow for Terraform validation and deployment.
- Added AWS authentication using GitHub Actions OIDC.
- Added Microsoft Entra ID authentication for Backstage.
- Added role-based authorization using Microsoft Entra ID App Roles.
- Added separate Backstage roles for administrators and developers.
- Added permission policies for controlling catalog, scaffolder, and task access.
- Added task ownership-based authorization for developers.
- Added GitHub App integration for repository creation.
- Added environment selection for generated services.
- Added project documentation and setup instructions.

### Security

- Replaced long-lived AWS credentials in GitHub Actions with OIDC-based authentication.
- Added role-based access control for Backstage users.
- Added authorization checks for scaffolder tasks and administrative operations.

### Documentation

- Added installation and configuration instructions.
- Added Microsoft Entra ID authentication setup instructions.
- Added GitHub App configuration instructions.
- Added AWS OIDC and IAM role configuration instructions.
- Added authentication and authorization architecture diagrams.
- Added self-service platform usage instructions.
