terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 Bucket for research papers and publications
resource "aws_s3_bucket" "research_documents" {
  bucket = "${var.environment}-viratec-research-docs"

  tags = {
    Project     = "VIRaTeC"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "research_documents_public" {
  bucket = aws_s3_bucket.research_documents.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
