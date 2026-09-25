terraform {
 backend "s3" {
    bucket       = "your-bucket-name"
    key          = "terraform/terraform.tfstate"
    region       = "ap-southeast-1"
    use_lockfile = true
    encrypt      = true
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1"
}

{% if "s3" in values.infrastructure %}

module "s3_bucket" {
  source      = "./modules/s3-bucket"
  bucket_name = "${{ values.resourceName }}-${{ values.environment }}-${{ values.infrastructureId }}"
}

{% endif %}

{% if "ec2" in values.infrastructure %}

module "ec2" {
  source        = "./modules/ec2"
  instance_name = "${{ values.resourceName }}-${{ values.environment }}-${{ values.infrastructureId }}"
}

{% endif %}