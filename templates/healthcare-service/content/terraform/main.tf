terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "s3_bucket" {
  source      = "./modules/s3-bucket"
  bucket_name = "${{ values.serviceName }}-${{ values.environment }}"
}

module "ec2" {
  source        = "./modules/ec2"
  instance_name = "${{ values.serviceName }}-${{ values.environment }}"
}