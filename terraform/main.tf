terraform {
  required_version = ">= 1.5.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "novacart_frontend" {
  name = "murughan1985/novacart-frontend:v1"
}

resource "docker_container" "novacart_frontend" {
  name  = "novacart-frontend"
  image = docker_image.novacart_frontend.image_id

  ports {
    internal = 3000
    external = 3000
  }
}

# Optional AWS EC2 sketch (commented):
# provider "aws" {
#   region = "us-east-1"
# }
#
# resource "aws_instance" "novacart_host" {
#   ami           = "ami-xxxxxxxx"
#   instance_type = "t3.micro"
#   tags = {
#     Name = "novacart-dev-host"
#   }
# }