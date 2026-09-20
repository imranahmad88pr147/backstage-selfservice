# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-09-XX

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