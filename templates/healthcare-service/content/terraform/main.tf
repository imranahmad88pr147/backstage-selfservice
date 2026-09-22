terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.7"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1"
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

{% if "s3" in values.infrastructure %}
module "s3_bucket" {
  source      = "./modules/s3-bucket"
  bucket_name = "${{ values.resourceName }}-${{ values.environment }}-${random_id.bucket_suffix.hex}"
}
{% endif %}

{% if "ec2" in values.infrastructure %}
module "ec2" {
  source        = "./modules/ec2"
  instance_name = "${{ values.resourceName }}-${{ values.environment }}"
}
{% endif %}