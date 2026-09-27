variable "aws_region" {
  description = "AWS region for infrastructure provisioning"
  type        = string
  default     = "eu-central-1"
}

variable "environment" {
  description = "Deployment environment (production, staging, dev)"
  type        = string
  default     = "production"
}
