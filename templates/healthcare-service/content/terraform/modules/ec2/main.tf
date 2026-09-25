data "aws_ami" "ubuntu" {

  most_recent = true

  owners = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

}

data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "this" {

  name        = "${var.instance_name}-sg"
  description = "Security group for ${var.instance_name}"
  vpc_id      = data.aws_vpc.default.id

  # No inbound rules.
  # Inbound connections are blocked by default.

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.instance_name}-sg"
  }

}

resource "aws_instance" "this" {

  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  vpc_security_group_ids = [
    aws_security_group.this.id
  ]

  root_block_device {
    encrypted = true
  }

  tags = {
    Name = var.instance_name
  }

}